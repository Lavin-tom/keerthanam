const titleIndex = {};
let originalLyrics = '';

async function buildIndex(file) {
    const response = await fetch(file);
    const xmlData = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    // Parse all 'entry' elements and categorize songs by their starting letter or prefix
    const entries = xmlDoc.querySelectorAll('entry');
    entries.forEach(entry => {
        const prefix = entry.getAttribute('letter');
        const songs = entry.querySelectorAll('song');

        // Initialize the array for the prefix if not already done
        if (!titleIndex[prefix]) {
            titleIndex[prefix] = [];
        }

        // Add each song under the prefix
        songs.forEach(song => {
            const songTitle = song.getAttribute('title')?.toLowerCase() || '';
            const songFile = song.getAttribute('file');

            titleIndex[prefix].push({
                title: songTitle,
                file: songFile
            });
        });
    });
    console.log('Built Title Index:', titleIndex); // Debugging
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

    // Look for exact matches to the prefix in the titleIndex
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

    // Transliterate title and lyrics if enabled
    const transliteratedTitle = transliterationEnabled ? transliterateLyrics(title) : title;
    const rawLyrics = Array.from(verses).map(verse => verse.querySelector('lines').innerHTML).join('\n');
    const transliteratedLyrics = transliterationEnabled ? transliterateLyrics(rawLyrics) : rawLyrics;

    const versesWithLineBreaks = transliteratedLyrics.split('\n').map(verse => `${verse}<br>`).join('');

    let htmlContent = `<h2>${transliteratedTitle}</h2>`;
    htmlContent += `<p>${versesWithLineBreaks.replace(/<br>/g, '<br/><br/>')}</p>`;

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
        loadSong(currentSongFile); // Reload song with updated transliteration
    } else {
        console.warn('No current song file found.');
    }
}

function filterSongs() {
    const searchInput = document.getElementById('searchBox').value.trim().toLowerCase();
    console.log('Search Input:', searchInput); // Debugging

    const suggestions = getFilteredSuggestions(searchInput);
    console.log('Suggestions:', suggestions); // Debugging

    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = ''; // Clear previous suggestions

    if (searchInput === '' || suggestions.length === 0) {
        suggestionList.style.display = 'none';
        return;
    }

    suggestionList.style.display = 'block';
    suggestions.forEach(({ title, file }) => {
        const listItem = document.createElement('li');
        listItem.textContent = title; // Display the title
        listItem.addEventListener('click', () => {
            console.log('Loading Song:', file); // Debugging
            loadSong(file); // Load the song on click
            suggestionList.style.display = 'none'; // Hide suggestions
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

const url = 'assets/55179722.pdf'; 		
let pdfDoc = null;
let currentPage = 1;

// Load the PDF document
pdfjsLib.getDocument(url).promise.then(doc => {
  pdfDoc = doc;
  renderPage(currentPage);
});

// Render a specific page
function renderPage(pageNum) {
    if (!context) {
        console.error("Canvas context is not initialized.");
        return;
    }

    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        page.render(renderContext);
    });
}
/*// Handle index clicks
document.getElementById('index').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const pageNum = parseInt(e.target.getAttribute('data-page'), 10);
    if (pageNum && pdfDoc) {
      currentPage = pageNum;
      renderPage(pageNum);
    }
  }
});*/
const options = {
    bottom: '32px', 
    right: '32px', 
    left: 'unset', 
    time: '0.3s', 
    mixColor: 'rgba(230, 230, 230, 100%)', 
    backgroundColor: '#fff',  
    buttonColorDark: '#100f2c',  
    buttonColorLight: '#fff', 
    saveInCookies: true, 
    label: '🌓', 
    autoMatchOsTheme: true 
}
const darkmode = new Darkmode(options);
render_dark_mode_icon(darkmode, 'dark_mode_toggle');

document.addEventListener('DOMContentLoaded', () => {
    pdfCanvas = document.getElementById('pdfCanvas');
    if (pdfCanvas) {
        context = pdfCanvas.getContext('2d');
        console.log('Canvas context initialized.');
    } else {
        console.error("Canvas element not found.");
    }
});

// Load the PDF document
pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    renderPage(currentPage);
});

// Display PDF viewer in songContent
const prayersButton = document.getElementById('prayersButton');
if (prayersButton) {
    prayersButton.addEventListener('click', () => {
        songContent.innerHTML = `
            <iframe src="assets/55179722.pdf" width="100%" height="500px" style="border: none;"></iframe>
        `;
    });
}