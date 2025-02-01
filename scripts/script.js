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

const url = 'assets/55179722.pdf'; 		
let pdfDoc = null;
let currentPage = 2;

document.addEventListener('DOMContentLoaded', () => {
    // Your code here
    const prayersButton = document.getElementById('prayersButton');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfContainer = document.getElementById('pdfContainer');

    if (prayersButton && pdfViewer && pdfContainer) {
        prayersButton.addEventListener('click', togglePdf);
    } else {
        console.error("Required elements for PDF viewer not found.");
    }

    function togglePdf() {
        if (!pdfContainer || !pdfViewer) {
            console.error("PDF container or viewer not found.");
            return;
        }

        if (pdfContainer.style.display === "none" || pdfContainer.style.display === "") {
            pdfContainer.style.display = "block";
            pdfViewer.src = 'assets/55179722.pdf'; 
            prayersButton.innerText = "Hide"; 
        } else {
            pdfContainer.style.display = "none";
            prayersButton.innerText = "Show"; 
        }
    }
});

// Load PDF.js Document
pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    renderPage(currentPage);
}).catch(error => {
    console.error("Error loading PDF document:", error);
});

function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        page.render(renderContext);
    }).catch(error => {
        console.error("Error rendering PDF page:", error);
    });
}

// JavaScript to toggle the visibility of the PDF iframe
function togglePdf() {
    const pdfContainer = document.getElementById("pdfContainer");
    const pdfViewer = document.getElementById("pdfViewer");

    if (!pdfContainer || !pdfViewer) {
        console.error("PDF container or viewer not found.");
        return;
    }

    if (pdfContainer.style.display === "none" || pdfContainer.style.display === "") {
        pdfContainer.style.display = "block";
        pdfViewer.src = "assets/55179722.pdf"; 
        document.getElementById("prayersButton").innerText = "Hide"; 
    } else {
        pdfContainer.style.display = "none";
        document.getElementById("prayersButton").innerText = "Show"; 
    }
}

// Dark Mode Toggle Script
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
