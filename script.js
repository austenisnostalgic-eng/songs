// Robust script.js for Song Rater - prevents duplicate submissions

// 1) Initialization guard so this file only sets up listeners once
if (window.__songRater_initialized) {
  console.log('songRater: already initialized, skipping setup.');
} else {
  window.__songRater_initialized = true;
  console.log('songRater: initializing...');

  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed', err));
  }

  /* -------------------------
     Ratings state & DOM refs
     ------------------------- */
  const ratings = {
    overall: 5,
    nostalgia: 5,
    lyricism: 5,
    novelty: 5,
    iconicness: 5
  };

  // DOM queries (done inside init)
  const songForm = document.getElementById('songForm');
  const artistInput = document.getElementById('artistName');
  const artistSuggestions = document.getElementById('artistSuggestions');
  const confirmationScreen = document.getElementById('confirmationScreen');
  const resetBtn = document.getElementById('resetBtn');

  /* Utility: update all visible rating numbers */
  function updateRatingDisplays() {
    Object.keys(ratings).forEach(key => {
      const el = document.getElementById(`${key}Value`);
      if (el) el.textContent = ratings[key];
    });
  }

  /* Clamp helper */
  function clamp(v, min = 1, max = 10) {
    return Math.max(min, Math.min(max, v));
  }

  /* -------------------------
     BUTTON HANDLING (delegated)
     ------------------------- */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.rating-btn');
    if (!btn) return; // not a rating button

    // avoid interfering with other clickable items
    e.preventDefault();
    e.stopPropagation();

    const ratingType = btn.dataset && btn.dataset.rating;
    if (!ratingType || !(ratingType in ratings)) {
      console.warn('Unknown rating type:', ratingType);
      return;
    }

    const delta = btn.classList.contains('up') ? 1 : -1;
    ratings[ratingType] = clamp(ratings[ratingType] + delta, 1, 10);

    updateRatingDisplays();
  });

  /* -------------------------
     Artist autocomplete (unchanged)
     ------------------------- */
  let artists = []; // in-memory list

  if (artistInput) {
    artistInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      if (!query) {
        artistSuggestions.classList.remove('active');
        artistSuggestions.innerHTML = '';
        return;
      }
      const matches = artists.filter(a => a.toLowerCase().startsWith(query));
      if (matches.length) {
        artistSuggestions.innerHTML = matches.map(a => `<div class="suggestion-item">${a}</div>`).join('');
        artistSuggestions.classList.add('active');

        document.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', function () {
            artistInput.value = this.textContent;
            artistSuggestions.classList.remove('active');
            artistSuggestions.innerHTML = '';
          });
        });
      } else {
        artistSuggestions.classList.remove('active');
        artistSuggestions.innerHTML = '';
      }
    });
  }

  /* Close suggestions when clicking outside */
  document.addEventListener('click', function (e) {
    if (artistInput && artistSuggestions && !artistInput.contains(e.target) && !artistSuggestions.contains(e.target)) {
      artistSuggestions.classList.remove('active');
    }
  });

  /* -------------------------
     Helper: compute dedup key (exclude timestamp)
     ------------------------- */
  function makeDedupKey(songName, artistName, genre, ratingsObj) {
    // stable canonical string for deduplication
    return [
      (songName || '').trim().toLowerCase(),
      (artistName || '').trim().toLowerCase(),
      (genre || '').trim().toLowerCase(),
      ratingsObj.overall,
      ratingsObj.nostalgia,
      ratingsObj.lyricism,
      ratingsObj.novelty,
      ratingsObj.iconicness
    ].join('|');
  }

  /* -------------------------
     Form submission handler (single place)
     ------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    // guard: don't submit multiple times concurrently
    if (songForm.dataset.submitting === "true") {
      console.log('songRater: submission already in progress - ignoring duplicate click.');
      return;
    }

    const songName = (document.getElementById('songName')?.value || '').trim();
    const artistName = (document.getElementById('artistName')?.value || '').trim();
    const genre = (document.getElementById('genre')?.value || '').trim();

    const songData = {
      songName,
      artistName,
      genre,
      ratings: { ...ratings },
      // still include timestamp for sheet, but dedup key excludes it
      timestamp: new Date().toISOString()
    };

    // dedup logic: skip identical submission within N ms
    const dedupKey = makeDedupKey(songData.songName, songData.artistName, songData.genre, songData.ratings);
    const now = Date.now();
    const lastKey = window.__songRater_lastKey || null;
    const lastTime = window.__songRater_lastTime || 0;

    if (lastKey === dedupKey && (now - lastTime) < 5000) {
      console.log('songRater: duplicate submission suppressed (dedup).');
      return;
    }

    // update last sent info
    window.__songRater_lastKey = dedupKey;
    window.__songRater_lastTime = now;

    // add artist to memory
    if (songData.artistName && !artists.includes(songData.artistName)) {
      artists.push(songData.artistName);
      artists.sort();
    }

    console.log('songRater: submitting', songData);

    // UI lock
    songForm.dataset.submitting = "true";
    const submitBtn = songForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // send to Google Apps Script web app
    const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbw3LP9QJMtt__dkTQv805Me9SX6hRchAj8bnsHA6leBJeOu_7c-GsVCEyGW_W627zYv/exec';

    try {
      // Use no-cors if your Apps Script doesn't send CORS headers.
      // If you control the Web App and can add CORS headers, remove mode:'no-cors' to get full responses.
      await fetch(WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });

      console.log('songRater: fetch completed (server may have received it).');
      showConfirmation(songData);
    } catch (err) {
      console.error('songRater: error sending to Google Sheets', err);
      // still show confirmation so UX isn't broken; decide if you want to show error instead
      showConfirmation(songData);
    } finally {
      // release UI lock
      songForm.dataset.submitting = "false";
      if (submitBtn) submitBtn.disabled = false;
      // keep lastKey/time so near-duplicates remain suppressed for a short window
      window.__songRater_lastTime = Date.now();
    }
  }

  // Attach submit listener once
  if (songForm) {
    if (!songForm.dataset.listenerAdded) {
      songForm.dataset.listenerAdded = "true";
      songForm.addEventListener('submit', handleSubmit);
      console.log('songRater: submit listener attached.');
    } else {
      console.log('songRater: submit listener already marked as added.');
    }
  } else {
    console.warn('songRater: songForm not found in DOM.');
  }

  /* -------------------------
     Confirmation / reset
     ------------------------- */
  function showConfirmation(songData) {
    if (!songForm) return;
    songForm.style.display = 'none';

    const detailsHTML = `
      <p><strong>Song:</strong> ${escapeHtml(songData.songName)}</p>
      <p><strong>Artist:</strong> ${escapeHtml(songData.artistName)}</p>
      <p><strong>Genre:</strong> ${escapeHtml(songData.genre)}</p>
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p><strong>Overall Rating:</strong> ${songData.ratings.overall}/10</p>
      <p><strong>Nostalgia:</strong> ${songData.ratings.nostalgia}/10</p>
      <p><strong>Lyricism:</strong> ${songData.ratings.lyricism}/10</p>
      <p><strong>Novelty:</strong> ${songData.ratings.novelty}/10</p>
      <p><strong>Iconicness:</strong> ${songData.ratings.iconicness}/10</p>
    `;

    document.getElementById('songDetails').innerHTML = detailsHTML;
    confirmationScreen.classList.remove('hidden');
  }

  resetBtn && resetBtn.addEventListener('click', function () {
    if (!songForm) return;
    songForm.reset();

    Object.keys(ratings).forEach(k => ratings[k] = 5);
    updateRatingDisplays();

    confirmationScreen.classList.add('hidden');
    songForm.style.display = 'block';
    window.scrollTo(0, 0);
  });

  /* -------------------------
     Small safety helper
     ------------------------- */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* initialize UI */
  updateRatingDisplays();
} // end init guard
