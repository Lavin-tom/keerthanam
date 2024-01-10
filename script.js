// Object to store the index
const titleIndex = {};

// Function to parse XML and build the index
async function buildIndex(file) {
    const response = await fetch(file);
    const xmlData = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    const entries = xmlDoc.querySelectorAll('entry');
    entries.forEach(entry => {
        const letter = entry.getAttribute('letter');
        const songs = entry.querySelectorAll('song');

        songs.forEach(song => {
            const songTitle = song.getAttribute('title').toLowerCase();
            const songFile = song.getAttribute('file');

            if (!titleIndex[letter]) {
                titleIndex[letter] = [];
            }

            titleIndex[letter].push({
                title: songTitle,
                file: songFile
            });
        });
    });
}
// Function to get the current song file
function getCurrentSongFile() {
    const songContentDiv = document.getElementById('songContent');
    const currentSong = songContentDiv.querySelector('h2');

    if (currentSong) {
        return currentSong.getAttribute('data-file');
    }

    return null;
}
// Function to toggle transliteration
function toggleTransliteration() {
    const transliterationCheckbox = document.getElementById('transliterationCheckbox');
    transliterationCheckbox.checked = !transliterationCheckbox.checked;

    // Load the song again to apply transliteration if needed
    const currentSongFile = getCurrentSongFile();
    if (currentSongFile) {
        loadSong(currentSongFile);
    }
}
// Function to transliterate Malayalam lyrics to Roman characters
function transliterateLyrics(lyrics) {
    // Use the ml2en function for transliteration
    return ml2en(lyrics);
}
// Function to fetch and parse the index file
async function loadIndex() {
    const indexFile = 'res/index.xml'; 
    await buildIndex(indexFile);
}

// Function to get filtered suggestions based on search input
function getFilteredSuggestions(searchInput) {
    // Filter suggestions based on the entire searchInput
    const suggestions = Object.values(titleIndex)
        .flat()
        .filter(suggestion =>
            suggestion.title.toLowerCase().includes(searchInput)
        );

    return suggestions;
}

async function loadSong(file) {
    const response = await fetch(`res/songs/${file}`);
    const xmlData = await response.text();
    const songContentDiv = document.getElementById('songContent');

    // Parse XML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    // Extract title and lyrics
    const title = xmlDoc.querySelector('title').textContent;
    const verses = xmlDoc.querySelectorAll('verse');

    // Check if transliteration is enabled
    const transliterationCheckbox = document.getElementById('transliterationCheckbox');
    const transliterationEnabled = transliterationCheckbox.checked;

    // If transliteration is enabled, transliterate the lyrics
    const rawLyrics = Array.from(verses).map(verse => verse.querySelector('lines').innerHTML).join('\n');
    const lyrics = transliterationEnabled ? transliterateLyrics(rawLyrics) : rawLyrics;

    // Create HTML content
    let htmlContent = `<h2>${title}</h2>`;
    htmlContent += `<p>${lyrics.replace(/<br\s*[/]?>/gi, '<br/>')}</p>`;

    // Display the HTML content on the page
    songContentDiv.innerHTML = htmlContent;
}

function filterSongs() {
    const searchInput = document.getElementById('searchBox').value.toLowerCase();
    const suggestionList = document.getElementById('suggestionList');
    const songList = document.getElementById('songList');
    
    // Add a check for empty or undefined searchInput
    if (!searchInput) {
        // If search input is empty, display suggestion list
        suggestionList.style.display = 'block';
        return;
    }
    
    // Hide suggestion list if the search input is not empty
    suggestionList.style.display = 'none';

    // Clear previous suggestions and song list
    suggestionList.innerHTML = '';
    songList.innerHTML = '';

    // Display suggestions from the index
    const suggestions = getFilteredSuggestions(searchInput);

    // Check if suggestions are present
    if (suggestions.length > 0) {
        // If suggestions are present, display suggestion list
        suggestionList.style.display = 'block';

        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion.title;
            listItem.addEventListener('click', () => {
                loadSong(suggestion.file);
                // Hide the suggestion list when a song is clicked
                suggestionList.style.display = 'none';
            });
            suggestionList.appendChild(listItem);
        });
    }
}

window.addEventListener('DOMContentLoaded', loadIndex);

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}
