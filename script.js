// Function to fetch content from the API
async function fetchContent() {
    try {
        const response = await fetch('http://localhost:5000/api/content');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Update each section with the fetched content
        updateSection('movies', data.movies);
        updateSection('series', data.series);
        updateSection('anime', data.anime);
        updateSection('wrestling', data.wrestling);
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

// Function to update a section with content
function updateSection(sectionId, items) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error(`Section ${sectionId} not found`);
        return;
    }

    const container = section.querySelector('.content-grid');
    if (!container) {
        console.error(`Content grid not found in section ${sectionId}`);
        return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add new content
    items.forEach(item => {
        const card = createContentCard(item, sectionId);
        container.appendChild(card);
    });
}

// Function to create a content card
function createContentCard(item, sectionType) {
    const card = document.createElement('div');
    card.className = 'content-card';

    // Create image element with error handling
    const image = document.createElement('img');
    image.src = item.image ? `http://localhost:5000${item.image}` : 'placeholder.jpg';
    image.alt = item.title;
    image.onerror = function() {
        this.src = 'placeholder.jpg';
    };

    // Create info container
    const info = document.createElement('div');
    info.className = 'content-info';

    // Create title
    const title = document.createElement('h3');
    title.textContent = item.title;

    // Create metadata
    const meta = document.createElement('div');
    meta.className = 'content-meta';

    // Add rating if available
    if (item.rating) {
        const rating = document.createElement('span');
        rating.innerHTML = `<i class="fas fa-star"></i> ${item.rating}`;
        meta.appendChild(rating);
    }

    // Add year if available
    if (item.year) {
        const year = document.createElement('span');
        year.innerHTML = `<i class="fas fa-calendar"></i> ${item.year}`;
        meta.appendChild(year);
    }

    // Add episodes for series and anime
    if ((sectionType === 'series' || sectionType === 'anime') && item.episodes) {
        const episodes = document.createElement('span');
        episodes.innerHTML = `<i class="fas fa-list"></i> ${item.episodes} حلقة`;
        meta.appendChild(episodes);
    }

    // Add quality if available
    if (item.quality) {
        const quality = document.createElement('span');
        quality.innerHTML = `<i class="fas fa-video"></i> ${item.quality}`;
        meta.appendChild(quality);
    }

    // Add duration if available
    if (item.duration) {
        const duration = document.createElement('span');
        duration.innerHTML = `<i class="fas fa-clock"></i> ${item.duration}`;
        meta.appendChild(duration);
    }

    // Create watch button
    const watchButton = document.createElement('a');
    watchButton.href = `watch.html?id=${item.id}&type=${sectionType}&title=${encodeURIComponent(item.title)}`;
    watchButton.className = 'watch-button';
    watchButton.innerHTML = '<i class="fas fa-play"></i> مشاهدة';

    // Assemble the card
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(watchButton);

    card.appendChild(image);
    card.appendChild(info);

    return card;
}

// Open movie viewer
function openViewer(item) {
    const viewer = document.getElementById('movieViewer');
    const title = document.getElementById('viewerTitle');
    const rating = document.getElementById('viewerRating');
    const year = document.getElementById('viewerYear');
    const duration = document.getElementById('viewerDuration');
    const quality = document.getElementById('viewerQuality');
    const description = document.getElementById('viewerDescription');
    const videoContainer = document.getElementById('videoContainer');

    // Set content details
    title.textContent = item.title;
    rating.textContent = item.rating || 'N/A';
    year.textContent = item.year || 'N/A';
    duration.textContent = item.duration || 'N/A';
    quality.textContent = item.quality || 'HD';
    description.textContent = item.description || 'لا يوجد وصف متاح';

    // Set video content
    if (item.video_url) {
        videoContainer.innerHTML = `
            <iframe
                src="${item.video_url}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;
    } else {
        videoContainer.innerHTML = '<p class="no-video">عذراً، الفيديو غير متاح</p>';
    }

    // Show viewer
    viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close viewer
function closeViewer() {
    const viewer = document.getElementById('movieViewer');
    const videoContainer = document.getElementById('videoContainer');
    
    viewer.classList.remove('active');
    videoContainer.innerHTML = '';
    document.body.style.overflow = '';
}

// Toggle lights
function toggleLights() {
    document.body.classList.toggle('lights-off');
}

// Toggle fullscreen
function toggleFullscreen() {
    const videoContainer = document.getElementById('videoContainer');
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Search functionality
function searchContent() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    const searchResultsGrid = document.getElementById('searchResultsGrid');

    // Hide search results if query is empty
    if (!searchQuery) {
        searchResults.style.display = 'none';
        return;
    }

    // Show search results section
    searchResults.style.display = 'block';
    searchResultsGrid.innerHTML = '<p>جاري البحث...</p>';

    // Fetch all content and filter
    fetch('http://localhost:5000/api/content')
        .then(response => response.json())
        .then(data => {
            const allContent = [
                ...data.movies,
                ...data.series,
                ...data.anime,
                ...data.wrestling
            ];

            const filteredContent = allContent.filter(item =>
                item.title.toLowerCase().includes(searchQuery) ||
                (item.description && item.description.toLowerCase().includes(searchQuery))
            );

            const searchResultsContainer = document.getElementById('searchResultsGrid');
            searchResultsContainer.innerHTML = '';
            filteredContent.forEach(item => {
                const card = createContentCard(item, 'search');
                searchResultsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error searching content:', error);
            searchResultsGrid.innerHTML = '<p class="error">حدث خطأ أثناء البحث</p>';
        });
}

// Add search on enter key
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchContent();
    }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
    }
});

// Call fetchContent when the page loads
document.addEventListener('DOMContentLoaded', fetchContent);
