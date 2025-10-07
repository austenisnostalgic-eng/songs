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
   BUTTON HANDLING (robust)
   - uses event delegation so it works even if button text/node is clicked
   - clamps 1..10
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

artistInput && artistInput.addEventListener('input', function () {
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

/* Close suggestions when clicking outside */
document.addEventListener('click', function (e) {
  if (!artistInput.contains(e.target) && !artistSuggestions.contains(e.target)) {
    artistSuggestions.classList.remove('active');
  }
});

/* -------------------------
   Form submission
   ------------------------- */
songForm && songForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const songData = {
    songName: document.getElementById('songName').value || '',
    artistName: document.getElementById('artistName').value || '',
    genre: document.getElementById('genre').value || '',
    ratings: { ...ratings },
    timestamp: new Date().toISOString()
  };

  // add artist to in-memory list if new
  if (songData.artistName && !artists.includes(songData.artistName)) {
    artists.push(songData.artistName);
    artists.sort();
  }

  songForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const songData = {
        songName: document.getElementById('songName').value,
        artistName: document.getElementById('artistName').value,
        genre: document.getElementById('genre').value,
        ratings: {
            overall: ratings.overall,
            nostalgia: ratings.nostalgia,
            lyricism: ratings.lyricism,
            novelty: ratings.novelty,
            iconicness: ratings.iconicness
        }
    };

    // Send to Google Sheets
    sendToSheet(songData);

    // Show confirmation screen
    showConfirmation(songData);
});


  console.log('Song data to be sent to Google Sheets:', songData);

  showConfirmation(songData);
});

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

// Function to send song data to Google Sheets
function sendToSheet(songData) {
    fetch('https://script.google.com/macros/s/AKfycbx2R0gdS8LpsyTLCvJerHRDwpiIe3ZUVDF9q4Z8yDc8-NDHDLqvYxv-oQvM55-YsUFW/exec', {
        method: 'POST',
        body: JSON.stringify(songData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Google Sheets response:', data);
    })
    .catch(error => console.error('Error sending to Sheets:', error));
}
