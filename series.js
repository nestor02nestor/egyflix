// Sample series data
const series = [
    {
        title: "بيت الرفاعي",
        image: "https://media.elcinema.com/uploads/_315x420_0c8f13dd1287d99418d17c61bb28ed6e2c69a45bd2632f89c2e6ee8091ed5e46.jpg",
        rating: "9.1",
        year: "2024",
        duration: "45 دقيقة",
        description: "مسلسل درامي يتناول قصة عائلة الرفاعي وصراعاتهم مع العائلات الأخرى",
        genre: "دراما",
        quality: "WEB-DL 1080p",
        episodes: 30,
        videoUrl: "https://geo.dailymotion.com/player.html?video=x99l2kc"
    },
    {
        title: "النهاية",
        image: "https://media.elcinema.com/uploads/_315x420_8c9d9cde8cd0e39069446e2df6aaee531f1c0a5e9c0ad43c46f8a3c16adefcb8.jpg",
        rating: "8.7",
        year: "2024",
        duration: "40 دقيقة",
        description: "مسلسل خيال علمي يدور في المستقبل ويتناول قضايا التكنولوجيا وتأثيرها على المجتمع",
        genre: "خيال علمي",
        quality: "HDTV 1080p",
        episodes: 15,
        videoUrl: "https://geo.dailymotion.com/player.html?video=x99l2kd"
    }
];

// Function to create a series card
function createSeriesCard(series) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="quality-badge">${series.quality}</div>
        <img src="${series.image}" alt="${series.title}">
        <div class="movie-info">
            <h3>${series.title}</h3>
            <div class="movie-meta">
                <span>${series.year}</span>
                <span><i class="fas fa-star"></i> ${series.rating}</span>
                <span><i class="fas fa-list"></i> ${series.episodes} حلقة</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openMovieViewer(series));
    return card;
}

// Function to display series
function displaySeries(seriesToShow = series) {
    const seriesGrid = document.getElementById('seriesGrid');
    seriesGrid.innerHTML = '';
    seriesToShow.forEach(series => {
        const card = createSeriesCard(series);
        seriesGrid.appendChild(card);
    });
}

// Movie viewer functionality
const movieViewer = document.getElementById('movieViewer');
const player = document.getElementById('player');
const closeViewer = document.querySelector('.close-viewer');
const toggleLights = document.getElementById('toggleLights');
const toggleFullscreen = document.getElementById('toggleFullscreen');

function initializePlayer(videoUrl) {
    if (player) {
        const iframe = player.querySelector('iframe');
        iframe.src = videoUrl;
    }
}

function openMovieViewer(series) {
    document.querySelector('.movie-title').textContent = series.title;
    document.querySelector('.rating-value').textContent = series.rating;
    document.querySelector('.duration-value').textContent = series.duration;
    document.querySelector('.genre-value').textContent = series.genre;
    document.querySelector('.description').textContent = series.description;
    document.querySelector('.quality').textContent = series.quality;
    document.querySelector('.episodes-value').textContent = series.episodes;
    
    initializePlayer(series.videoUrl);
    
    movieViewer.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeMovieViewer() {
    const iframe = player.querySelector('iframe');
    iframe.src = '';
    movieViewer.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event listeners
closeViewer.addEventListener('click', closeMovieViewer);
movieViewer.addEventListener('click', (e) => {
    if (e.target === movieViewer) {
        closeMovieViewer();
    }
});

// Toggle lights
toggleLights.addEventListener('click', () => {
    movieViewer.classList.toggle('lights-on');
    toggleLights.querySelector('i').classList.toggle('fa-lightbulb');
    toggleLights.querySelector('i').classList.toggle('fa-lightbulb-slash');
});

// Toggle fullscreen
toggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        movieViewer.requestFullscreen();
        toggleFullscreen.querySelector('i').classList.replace('fa-expand', 'fa-compress');
    } else {
        document.exitFullscreen();
        toggleFullscreen.querySelector('i').classList.replace('fa-compress', 'fa-expand');
    }
});

// Handle fullscreen change
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        toggleFullscreen.querySelector('i').classList.replace('fa-compress', 'fa-expand');
    }
});

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSeries = series.filter(series => 
        series.title.toLowerCase().includes(searchTerm) ||
        series.genre.toLowerCase().includes(searchTerm) ||
        series.description.toLowerCase().includes(searchTerm)
    );
    displaySeries(filteredSeries);
});

// Filter functionality
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const qualityFilter = document.getElementById('qualityFilter');

function applyFilters() {
    const genre = genreFilter.value.toLowerCase();
    const year = yearFilter.value;
    const quality = qualityFilter.value.toLowerCase();

    const filteredSeries = series.filter(series => {
        const genreMatch = !genre || series.genre.toLowerCase().includes(genre);
        const yearMatch = !year || series.year === year;
        const qualityMatch = !quality || series.quality.toLowerCase().includes(quality);
        return genreMatch && yearMatch && qualityMatch;
    });

    displaySeries(filteredSeries);
}

genreFilter.addEventListener('change', applyFilters);
yearFilter.addEventListener('change', applyFilters);
qualityFilter.addEventListener('change', applyFilters);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displaySeries();
});
