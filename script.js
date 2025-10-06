// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}

// Storage for artists (in-memory, will be replaced with Google Sheets later)
let artists = [];

// Rating values
const ratings = {
    overall: 5,
    nostalgia: 5,
    lyricism: 5,
    novelty: 5,
    catchiness: 5,
    iconicness: 5
};

// DOM Elements
const songForm = document.getElementById('songForm');
const artistInput = document.getElementById('artistName');
const artistSuggestions = document.getElementById('artistSuggestions');
const confirmationScreen = document.getElementById('confirmationScreen');
const resetBtn = document.getElementById('resetBtn');

// Initialize rating displays
updateRatingDisplays();

// Rating button handlers
document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const ratingType = this.dataset.rating;
        const isUp = this.classList.contains('up');
        
        if (isUp && ratings[ratingType] < 10) {
            ratings[ratingType]++;
        } else if (!isUp && ratings[ratingType] > 1) {
            ratings[ratingType]--;
        }
        
        updateRatingDisplays();
    });
});

function updateRatingDisplays() {
    document.getElementById('overallValue').textContent = ratings.overall;
    document.getElementById('nostalgiaValue').textContent = ratings.nostalgia;
    document.getElementById('lyricismValue').textContent = ratings.lyricism;
    document.getElementById('noveltyValue').textContent = ratings.novelty;
    document.getElementById('catchinessValue').textContent = ratings.catchiness;
    document.getElementById('iconicnessValue').textContent = ratings.iconicness;
}

// Artist autocomplete
artistInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    
    if (query.length === 0) {
        artistSuggestions.classList.remove('active');
        artistSuggestions.innerHTML = '';
        return;
    }
    
    const matches = artists.filter(artist => 
        artist.toLowerCase().startsWith(query)
    );
    
    if (matches.length > 0) {
        artistSuggestions.innerHTML = matches
            .map(artist => `<div class="suggestion-item">${artist}</div>`)
            .join('');
        artistSuggestions.classList.add('active');
        
        // Add click handlers to suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
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

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!artistInput.contains(e.target) && !artistSuggestions.contains(e.target)) {
        artistSuggestions.classList.remove('active');
    }
});

// Form submission
songForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const songData = {
        songName: document.getElementById('songName').value,
        artistName: document.getElementById('artistName').value,
        genre: document.getElementById('genre').value,
        specialSong: document.getElementById('specialSong').checked ? 'Yes' : 'No',
        ratings: {
            overall: ratings.overall,
            nostalgia: ratings.nostalgia,
            lyricism: ratings.lyricism,
            novelty: ratings.novelty,
            catchiness: ratings.catchiness,
            iconicness: ratings.iconicness
        },
        timestamp: new Date().toISOString()
    };
    
    // Add artist to list if not already present
    if (!artists.includes(songData.artistName)) {
        artists.push(songData.artistName);
        artists.sort();
    }
    
    // TODO: Send to Google Sheets
    // This is where you'll add the Google Sheets API call
    console.log('Song data to be sent to Google Sheets:', songData);
    
    // Show confirmation
    showConfirmation(songData);
});

function showConfirmation(songData) {
    // Hide form
    songForm.style.display = 'none';
    
    // Show confirmation screen
    const detailsHTML = `
        <p><strong>Song:</strong> ${songData.songName}</p>
        <p><strong>Artist:</strong> ${songData.artistName}</p>
        <p><strong>Genre:</strong> ${songData.genre}</p>
        <p><strong>Special Song:</strong> ${songData.specialSong}</p>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p><strong>Overall Rating:</strong> ${songData.ratings.overall}/10</p>
        <p><strong>Nostalgia:</strong> ${songData.ratings.nostalgia}/10</p>
        <p><strong>Lyricism:</strong> ${songData.ratings.lyricism}/10</p>
        <p><strong>Novelty:</strong> ${songData.ratings.novelty}/10</p>
        <p><strong>Catchiness:</strong> ${songData.ratings.catchiness}/10</p>
        <p><strong>Iconicness:</strong> ${songData.ratings.iconicness}/10</p>
    `;
    
    document.getElementById('songDetails').innerHTML = detailsHTML;
    confirmationScreen.classList.remove('hidden');
}

// Reset button
resetBtn.addEventListener('click', function() {
    // Reset form
    songForm.reset();
    
    // Reset ratings to 5
    for (let key in ratings) {
        ratings[key] = 5;
    }
    updateRatingDisplays();
    
    // Hide confirmation and show form
    confirmationScreen.classList.add('hidden');
    songForm.style.display = 'block';
    
    // Scroll to top
    window.scrollTo(0, 0);
});
