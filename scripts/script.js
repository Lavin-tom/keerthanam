const titleIndex = {};
let originalLyrics = '';

async function buildIndex(file) {
    const response = await fetch(file);
    const xmlData = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    const entries = xmlDoc.querySelectorAll('entry');
    entries.forEach(entry => {
        const prefix = entry.getAttribute('letter');
        const songs = entry.querySelectorAll('song');

        if (!titleIndex[prefix]) {
            titleIndex[prefix] = [];
        }

        songs.forEach(song => {
            const songTitle = song.getAttribute('title')?.toLowerCase() || '';
            const songFile = song.getAttribute('file');

            titleIndex[prefix].push({
                title: songTitle,
                file: songFile
            });
        });
    });
    console.log('Built Title Index:', titleIndex); 
}

function getCurrentSongFile() {
    const songContentDiv = document.getElementById('songContent');
    const currentSong = songContentDiv.querySelector('h2');

    if (currentSong) {
        return currentSong.getAttribute('data-file');
    }

    return null;
}

let fuse;
let isIndexLoaded = false;
async function loadIndex() {
    const indexFile = 'assets/index.xml'; 
    await buildIndex(indexFile);
}

function getFilteredSuggestions(searchInput) {
    if (!searchInput) return [];

    const trimmedInput = searchInput.trim().toLowerCase();

    const results = titleIndex[trimmedInput];

    if (results) {
        return results;
    } else {
        return [];
    }
}

async function loadSong(file) {
    const response = await fetch(`assets/songs/${file}`);
    const xmlData = await response.text();
    const songContentDiv = document.getElementById('songContent');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    const title = xmlDoc.querySelector('title').textContent;
    const verses = xmlDoc.querySelectorAll('verse');

    const transliterationIcon = document.getElementById('transliterationIcon');
    const transliterationEnabled = transliterationIcon?.classList.contains('transliteration-active');

    const transliteratedTitle = transliterationEnabled ? transliterateLyrics(title) : title;
    const rawLyrics = Array.from(verses).map(verse => verse.querySelector('lines').innerHTML).join('\n');
    const transliteratedLyrics = transliterationEnabled ? transliterateLyrics(rawLyrics) : rawLyrics;

    const versesWithLineBreaks = transliteratedLyrics.split('\n').map(verse => `${verse}<br>`).join('');

    let htmlContent = `<h2>${transliteratedTitle}</h2>`;
    htmlContent += `<p class="malayalam-lyrics">${versesWithLineBreaks.replace(/<br>/g, '<br/><br/>')}</p>`;

    songContentDiv.innerHTML = htmlContent;
}

function transliterateLyrics(lyrics) {
    if (typeof ml2en !== 'function') {
        console.error('ml2en function not found. Ensure it is defined.');
        return lyrics;
    }
    return ml2en(lyrics);
}

function toggleTransliteration() {
    const transliterationIcon = document.getElementById('transliterationIcon');

    if (!transliterationIcon) {
        console.error('Transliteration icon not found.');
        return;
    }

    transliterationIcon.classList.toggle('transliteration-active');

    const currentSongFile = getCurrentSongFile();
    if (currentSongFile) {
        loadSong(currentSongFile); 
    } else {
        console.warn('No current song file found.');
    }
}

function filterSongs() {
    const searchInput = document.getElementById('searchBox').value.trim().toLowerCase();
    console.log('Search Input:', searchInput); 

    const suggestions = getFilteredSuggestions(searchInput);
    console.log('Suggestions:', suggestions); 

    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = ''; 

    if (searchInput === '' || suggestions.length === 0) {
        suggestionList.style.display = 'none';
        return;
    }

    suggestionList.style.display = 'block';
    suggestions.forEach(({ title, file }) => {
        const listItem = document.createElement('li');
        listItem.textContent = title; 
        listItem.addEventListener('click', () => {
            console.log('Loading Song:', file); 
            loadSong(file); 
            suggestionList.style.display = 'none'; 
        });
        suggestionList.appendChild(listItem);
    });
}

document.getElementById('searchBox').addEventListener('input', filterSongs);
window.addEventListener('DOMContentLoaded', loadIndex);

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

let currentFontSize = 16;

function zoomIn() {
    currentFontSize += 2;
    updateFontSize();
}

function zoomOut() {
    currentFontSize = Math.max(10, currentFontSize - 2);
    updateFontSize();
}

function resetZoom() {
    currentFontSize = 16;
    updateFontSize();
}

function updateFontSize() {
    const songContentDiv = document.getElementById('songContent');
    songContentDiv.style.fontSize = `${currentFontSize}px`;
}

// Darkmode.js Initialization
const darkmodeOptions = {
    bottom: '32px', 
    right: '32px', 
    left: 'unset', 
    time: '0.3s', 
    mixColor: '#f0f0f0', 
    backgroundColor: '#f0f0f0', 
    buttonColorDark: '#2c3e50', 
    buttonColorLight: '#ffffff', 
    saveInCookies: true, 
    label: '', 
    autoMatchOsTheme: true 
};

const darkmode = new Darkmode(darkmodeOptions);

// Add event listener to your button
document.getElementById('dark_mode_toggle').addEventListener('click', () => {
    darkmode.toggle(); 
    updateDarkModeIcon(); 
});

// Function to update the dark mode icon
function updateDarkModeIcon() {
    const darkModeToggle = document.getElementById('dark_mode_toggle');
    if (darkmode.isActivated()) {
        darkModeToggle.classList.remove('fa-sun');
        darkModeToggle.classList.add('fa-moon');
    } else {
        darkModeToggle.classList.remove('fa-moon');
        darkModeToggle.classList.add('fa-sun');
    }
}

// Initialize the icon based on the current mode
updateDarkModeIcon();

// PDF Viewer Logic 		
//const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; //for testing
//const url = 'assets/55179722.pdf'; 		
const prayersButton = document.getElementById('prayersButton');
const navigationPanel = document.getElementById('navigationPanel');
const prayerContainer = document.getElementById('prayerContainer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const pageInput = document.getElementById('pageInput');
const goToPageButton = document.getElementById('goToPageButton');

// List of prayer HTML files
const prayerFiles = [
		'prayers/prayer3.html',
		'prayers/prayer4.html',
		'prayers/prayer5.html',
		'prayers/prayer6.html',
		'prayers/prayer7.html',
		'prayers/prayer8.html',
		'prayers/prayer9.html',
		'prayers/prayer10.html',
		'prayers/prayer11.html',
		'prayers/prayer12.html',
		'prayers/prayer13.html',
		'prayers/prayer14.html',
		'prayers/prayer15.html',
		'prayers/prayer16.html',
		'prayers/prayer17.html',
		'prayers/prayer18.html',
		'prayers/prayer19.html',
		'prayers/prayer20.html',
		'prayers/prayer21.html',
		'prayers/prayer22.html',
		'prayers/prayer23.html',
		'prayers/prayer24.html',
		'prayers/prayer25.html',
		'prayers/prayer26.html',
		'prayers/prayer27.html',
		'prayers/prayer28.html',
		'prayers/prayer29.html',
		'prayers/prayer30.html',
		'prayers/prayer31.html',
		'prayers/prayer32.html',
		'prayers/prayer33.html',
		'prayers/prayer34.html',
		'prayers/prayer35.html',
		'prayers/prayer36.html',
		'prayers/prayer37.html',
		'prayers/prayer38.html',
		'prayers/prayer39.html',
		'prayers/prayer40.html',
		'prayers/prayer41.html',
		'prayers/prayer42.html',
		'prayers/prayer43.html',
		'prayers/prayer44.html',
		'prayers/prayer45.html',
		'prayers/prayer46.html',
		'prayers/prayer47.html',
		'prayers/prayer48.html',
		'prayers/prayer49.html',
		'prayers/prayer50.html',
		'prayers/prayer51.html',
		'prayers/prayer52.html',
		'prayers/prayer53.html',
		'prayers/prayer54.html',
		'prayers/prayer55.html',
		'prayers/prayer56.html',
		'prayers/prayer57.html',
		'prayers/prayer58.html',
		'prayers/prayer59.html',
		'prayers/prayer60.html',
		'prayers/prayer61.html',
		'prayers/prayer62.html',
		'prayers/prayer63.html',
		'prayers/prayer64.html',
		'prayers/prayer65.html',
		'prayers/prayer66.html',
		'prayers/prayer67.html',
		'prayers/prayer68.html',
		'prayers/prayer69.html',
		'prayers/prayer70.html',
		'prayers/prayer71.html',
		'prayers/prayer72.html',
		'prayers/prayer73.html',
		'prayers/prayer74.html',
		'prayers/prayer75.html',
		'prayers/prayer76.html',
		'prayers/prayer77.html',
		'prayers/prayer78.html',
		'prayers/prayer79.html',
		'prayers/prayer80.html',
		'prayers/prayer81.html',
		'prayers/prayer82.html',
		'prayers/prayer83.html',
		'prayers/prayer84.html',
		'prayers/prayer85.html',
		'prayers/prayer86.html',
		'prayers/prayer87.html',
		'prayers/prayer88.html',
		'prayers/prayer89.html',
		'prayers/prayer90.html',
		'prayers/prayer91.html',
		'prayers/prayer92.html',
		'prayers/prayer93.html',
		'prayers/prayer94.html',
		'prayers/prayer95.html',
		'prayers/prayer96.html',
		'prayers/prayer97.html',
		'prayers/prayer98.html',
		'prayers/prayer99.html',
		'prayers/prayer100.html',
		'prayers/prayer101.html',
		'prayers/prayer102.html',
		'prayers/prayer103.html',
		'prayers/prayer104.html',
		'prayers/prayer105.html',
		'prayers/prayer106.html',
		'prayers/prayer107.html',
		'prayers/prayer108.html',
		'prayers/prayer109.html',
		'prayers/prayer110.html',
		'prayers/prayer111.html',
		'prayers/prayer112.html',
		'prayers/prayer113.html',
		'prayers/prayer114.html',
		'prayers/prayer115.html',
		'prayers/prayer116.html',
		'prayers/prayer117.html',
		];

let currentPage = 0; 

// Function to load a specific prayer page
function loadPrayerPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < prayerFiles.length) {
        fetch(prayerFiles[pageIndex])
            .then(response => response.text())
            .then(data => {
                prayerContainer.innerHTML = data; 
                currentPage = pageIndex; 
                updateNavigationButtons(); 
            })
            .catch(error => console.error('Error loading prayer:', error));
    }
}

// Function to update navigation buttons
function updateNavigationButtons() {
    prevButton.disabled = currentPage === 0; 
    nextButton.disabled = currentPage === prayerFiles.length - 1; 
}

// Event listener for the "Show Prayer" button
prayersButton.addEventListener('click', () => {
    if (prayerContainer.style.display === "none" || prayerContainer.style.display === "") {
        navigationPanel.style.display = "block"; 
        prayerContainer.style.display = "block"; 
        loadPrayerPage(0); 
        prayersButton.innerText = "Hide Prayer"; 
    } else {
        navigationPanel.style.display = "none"; 
        prayerContainer.style.display = "none"; 
        prayersButton.innerText = "Show Prayer"; 
    }
});

// Event listener for the "Previous" button
prevButton.addEventListener('click', () => {
    if (currentPage > 0) {
        loadPrayerPage(currentPage - 1); 
    }
});

// Event listener for the "Next" button
nextButton.addEventListener('click', () => {
    if (currentPage < prayerFiles.length - 1) {
        loadPrayerPage(currentPage + 1); 
    }
});

// Event listener for the "Go to Page" button
goToPageButton.addEventListener('click', () => {
    const pageNumber = parseInt(pageInput.value, 10) - 1; 
    if (pageNumber >= 0 && pageNumber < prayerFiles.length) {
        loadPrayerPage(pageNumber); 
    } else {
        alert("Invalid page number!"); 
    }
});