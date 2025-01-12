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

let fuse;
async function loadIndex() {
  const indexFile = 'assets/index.xml';
  await buildIndex(indexFile);
  const flatIndex = Object.values(titleIndex).flat();
  const options = {
    keys: ['title'],
    includeScore: true,
    threshold: 0.6 
  };
  fuse = new Fuse(flatIndex, options);
}

function getFilteredSuggestions(searchInput) {
  if (!fuse) {
    console.error('Index not loaded yet. Call loadIndex() first.');
    return [];
  }
  
  const results = fuse.search(searchInput);
  const suggestions = results.map(result => result.item);
  
  return suggestions;
}

async function loadSong(file) {
    const response = await fetch(`assets/songs/${file}`);
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
// Function to filter songs based on search input
function filterSongs() {
    const searchInput = document.getElementById('searchBox').value;
    const suggestions = getFilteredSuggestions(searchInput);
    const suggestionList = document.getElementById('suggestionList');

    // Debugging
    console.log('Search Input:', searchInput);
    console.log('Suggestions Found:', suggestions);

    // Clear previous suggestions
    if (suggestionList) {
        suggestionList.innerHTML = '';
    }

    // Handle no input or no suggestions
    if (!searchInput.trim() || suggestions.length === 0) {
        suggestionList.style.display = 'none';
        return;
    }

    // Display suggestions
    suggestionList.style.display = 'block';
    suggestions.forEach(suggestion => {
        const listItem = document.createElement('li');
        listItem.textContent = suggestion.title;
        listItem.addEventListener('click', () => {
            console.log('Loading Song:', suggestion.file);
            loadSong(suggestion.file); // Load the selected song
            suggestionList.style.display = 'none';
        });
        suggestionList.appendChild(listItem);
    });
}

// Event listener for the search input
document.getElementById('searchBox').addEventListener('input', filterSongs);

window.addEventListener('DOMContentLoaded', loadIndex);
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Initial font size
let currentFontSize = 16;

// Function to increase font size
function zoomIn() {
    currentFontSize += 2;
    updateFontSize();
}

// Function to decrease font size
function zoomOut() {
    currentFontSize = Math.max(10, currentFontSize - 2);
    updateFontSize();
}

// Function to reset font size
function resetZoom() {
    currentFontSize = 16;
    updateFontSize();
}

// Function to update font size in the lyrics container
function updateFontSize() {
    const songContentDiv = document.getElementById('songContent');
    songContentDiv.style.fontSize = `${currentFontSize}px`;
}
