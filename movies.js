// Sample movies data
const movies = [
    {
        title: "فيلم جوازة توكسيك 2024",
        image: "https://media0063.elcinema.com/uploads/_315x420_859954b33e39387f2cd2ae03f329d866b3c601580cf46f3fd7b9c60719d2b2c2.jpg",
        rating: "8.5",
        year: "2024",
        duration: "120 دقيقة",
        description: "فيلم كوميدي مصري يدور حول قصة زواج غير تقليدية ومواقف مضحكة تنتج عنها",
        genre: "كوميدي",
        quality: "BluRay 1080p",
        videoUrl: "https://geo.dailymotion.com/player.html?video=x99l2ka"
    },
    {
        title: "الكنز 3",
        image: "https://media.elcinema.com/uploads/_315x420_8e6b33c6f26b83ef445b24480b3a1c1cd0c8eb88ac1301e859b3d1f26b46a555.jpg",
        rating: "7.9",
        year: "2024",
        duration: "135 دقيقة",
        description: "الجزء الثالث من سلسلة أفلام الكنز، يستكمل رحلة البحث عن الكنوز التاريخية",
        genre: "دراما/مغامرة",
        quality: "WEB-DL 1080p",
        videoUrl: "https://geo.dailymotion.com/player.html?video=x99l2kb"
    }
];

// Function to create a movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="quality-badge">${movie.quality}</div>
        <img src="${movie.image}" alt="${movie.title}">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span><i class="fas fa-star"></i> ${movie.rating}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openMovieViewer(movie));
    return card;
}

// Function to display movies
function displayMovies(moviesToShow = movies) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = '';
    moviesToShow.forEach(movie => {
        const card = createMovieCard(movie);
        movieGrid.appendChild(card);
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

function openMovieViewer(movie) {
    document.querySelector('.movie-title').textContent = movie.title;
    document.querySelector('.rating-value').textContent = movie.rating;
    document.querySelector('.duration-value').textContent = movie.duration;
    document.querySelector('.genre-value').textContent = movie.genre;
    document.querySelector('.description').textContent = movie.description;
    document.querySelector('.quality').textContent = movie.quality;
    
    initializePlayer(movie.videoUrl);
    
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
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm)
    );
    displayMovies(filteredMovies);
});

// Filter functionality
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const qualityFilter = document.getElementById('qualityFilter');

function applyFilters() {
    const genre = genreFilter.value.toLowerCase();
    const year = yearFilter.value;
    const quality = qualityFilter.value.toLowerCase();

    const filteredMovies = movies.filter(movie => {
        const genreMatch = !genre || movie.genre.toLowerCase().includes(genre);
        const yearMatch = !year || movie.year === year;
        const qualityMatch = !quality || movie.quality.toLowerCase().includes(quality);
        return genreMatch && yearMatch && qualityMatch;
    });

    displayMovies(filteredMovies);
}

genreFilter.addEventListener('change', applyFilters);
yearFilter.addEventListener('change', applyFilters);
qualityFilter.addEventListener('change', applyFilters);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayMovies();
});
