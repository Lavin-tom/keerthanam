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

    //console.log('XML Data:', xmlData);

    // Parse XML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

    //console.log('Parsed XML:', xmlDoc);

    // Extract title and lyrics
    const title = xmlDoc.querySelector('title').textContent;
    const verses = xmlDoc.querySelectorAll('verse');

    //console.log('Title:', title);
    //console.log('Verses:', verses);

    // Create HTML content
    let htmlContent = `<h2>${title}</h2>`;

    // Arrange lines based on verseOrder
    const verseOrder = xmlDoc.querySelector('verseOrder').textContent.split(' ');

    verseOrder.forEach(verseName => {
        const verse = Array.from(verses).find(v => v.getAttribute('name') === verseName);
        if (verse) {
            const lines = verse.querySelector('lines').innerHTML;
            htmlContent += `<p>${lines.replace(/<br\s*[/]?>/gi, '<br/>')}</p>`;
        }
    });

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