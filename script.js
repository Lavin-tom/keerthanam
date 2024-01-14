const titleIndex = {};
let originalLyrics = '';

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

function getCurrentSongFile() {
    const songContentDiv = document.getElementById('songContent');
    const currentSong = songContentDiv.querySelector('h2');

    if (currentSong) {
        return currentSong.getAttribute('data-file');
    }

    return null;
}

async function loadIndex() {
    const indexFile = 'res/index.xml'; 
    await buildIndex(indexFile);
}

function getFilteredSuggestions(searchInput) {
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

    // Check if transliterationIcon exists
    const transliterationIcon = document.getElementById('transliterationIcon');
    const transliterationEnabled = transliterationIcon ? transliterationIcon.classList.contains('transliteration-active') : false;

    // Transliterate the title if transliteration is enabled
    const transliteratedTitle = transliterationEnabled ? transliterateLyrics(title) : title;

    // If transliteration is enabled, transliterate the lyrics
    const rawLyrics = Array.from(verses).map(verse => verse.querySelector('lines').innerHTML).join('\n');
    const lyrics = transliterationEnabled ? transliterateLyrics(rawLyrics) : rawLyrics;
	
	const versesWithLineBreaks = lyrics.split('\n').map(verse => `${verse}<br>`).join('');
    
	// Create HTML content
	let htmlContent = `<h2>${transliteratedTitle}</h2>`;
	htmlContent += `<p>${versesWithLineBreaks.replace(/<br>/g, '<br/><br/>')}</p>`;

    // Display the HTML content on the page
    songContentDiv.innerHTML = htmlContent;
}



function transliterateLyrics(lyrics) {
    return ml2en(lyrics);
}
function toggleTransliteration() {
    const transliterationIcon = document.getElementById('transliterationIcon');
    
    transliterationIcon.classList.toggle('transliteration-active');

    const currentSongFile = getCurrentSongFile();
    if (currentSongFile) {
        loadSong(currentSongFile);
    }
}
function filterSongs() {
    const searchInput = document.getElementById('searchBox').value.toLowerCase();
    const suggestionList = document.getElementById('suggestionList');
    const songList = document.getElementById('songList');
    
    if (!searchInput) {
        suggestionList.style.display = 'block';
        return;
    }
    
    suggestionList.style.display = 'none';

    suggestionList.innerHTML = '';
    songList.innerHTML = '';

    const suggestions = getFilteredSuggestions(searchInput);

    if (suggestions.length > 0) {
        suggestionList.style.display = 'block';

        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion.title;
            listItem.addEventListener('click', () => {
                loadSong(suggestion.file);
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