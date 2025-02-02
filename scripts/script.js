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
//const url = 'assets/55179722.pdf'; 		
const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; //for testing
const prayersButton = document.getElementById('prayersButton');
const pdfViewer = document.getElementById('pdfViewer');
const pdfContainer = document.getElementById('pdfContainer');

if (prayersButton && pdfViewer && pdfContainer) {
    prayersButton.addEventListener('click', () => {
        if (pdfContainer.style.display === "none" || pdfContainer.style.display === "") {
            pdfContainer.style.display = "block";
            pdfViewer.src = url; 
        } else {
            pdfContainer.style.display = "none";
        }
    });
} else {
    console.error("Required elements for PDF viewer not found.");
}

function togglePdf() {
    console.log("Toggle PDF function called.");
    if (!pdfContainer || !pdfViewer) {
        console.error("PDF container or viewer not found.");
        return;
    }

    if (pdfContainer.style.display === "none" || pdfContainer.style.display === "") {
        console.log("Loading PDF:", url);
        pdfContainer.style.display = "block";
        pdfViewer.src = url; 
        prayersButton.innerText = "Hide"; 
    } else {
        console.log("Hiding PDF viewer.");
        pdfContainer.style.display = "none";
        prayersButton.innerText = "Show"; 
    }
}
