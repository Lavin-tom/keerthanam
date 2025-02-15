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

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    prayerContainer.classList.toggle('dark-mode'); // Sync with full-screen mode
    updateDarkModeIcon();
}
// Update the dark mode icon
function updateDarkModeIcon() {
    const darkModeToggle = document.getElementById('dark_mode_toggle');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.classList.remove('fa-sun');
        darkModeToggle.classList.add('fa-moon');
    } else {
        darkModeToggle.classList.remove('fa-moon');
        darkModeToggle.classList.add('fa-sun');
    }
}

updateDarkModeIcon();
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
		'prayers/page3.html',
		'prayers/page4.html',
		'prayers/page5.html',
		'prayers/page6.html',
		'prayers/page7.html',
		'prayers/page8.html',
		'prayers/page9.html',
		'prayers/page10.html',
		'prayers/page11.html',
		'prayers/page12.html',
		'prayers/page13.html',
		'prayers/page14.html',
		'prayers/page15.html',
		'prayers/page16.html',
		'prayers/page17.html',
		'prayers/page18.html',
		'prayers/page19.html',
		'prayers/page20.html',
		'prayers/page21.html',
		'prayers/page22.html',
		'prayers/page23.html',
		'prayers/page24.html',
		'prayers/page25.html',
		'prayers/page26.html',
		'prayers/page27.html',
		'prayers/page28.html',
		'prayers/page29.html',
		'prayers/page30.html',
		'prayers/page31.html',
		'prayers/page32.html',
		'prayers/page33.html',
		'prayers/page34.html',
		'prayers/page35.html',
		'prayers/page36.html',
		'prayers/page37.html',
		'prayers/page38.html',
		'prayers/page39.html',
		'prayers/page40.html',
		'prayers/page41.html',
		'prayers/page42.html',
		'prayers/page43.html',
		'prayers/page44.html',
		'prayers/page45.html',
		'prayers/page46.html',
		'prayers/page47.html',
		'prayers/page48.html',
		'prayers/page49.html',
		'prayers/page50.html',
		'prayers/page51.html',
		'prayers/page52.html',
		'prayers/page53.html',
		'prayers/page54.html',
		'prayers/page55.html',
		'prayers/page56.html',
		'prayers/page57.html',
		'prayers/page58.html',
		'prayers/page59.html',
		'prayers/page60.html',
		'prayers/page61.html',
		'prayers/page62.html',
		'prayers/page63.html',
		'prayers/page64.html',
		'prayers/page65.html',
		'prayers/page66.html',
		'prayers/page67.html',
		'prayers/page68.html',
		'prayers/page69.html',
		'prayers/page70.html',
		'prayers/page71.html',
		'prayers/page72.html',
		'prayers/page73.html',
		'prayers/page74.html',
		'prayers/page75.html',
		'prayers/page76.html',
		'prayers/page77.html',
		'prayers/page78.html',
		'prayers/page79.html',
		'prayers/page80.html',
		'prayers/page81.html',
		'prayers/page82.html',
		'prayers/page83.html',
		'prayers/page84.html',
		'prayers/page85.html',
		'prayers/page86.html',
		'prayers/page87.html',
		'prayers/page88.html',
		'prayers/page89.html',
		'prayers/page90.html',
		'prayers/page91.html',
		'prayers/page92.html',
		'prayers/page93.html',
		'prayers/page94.html',
		'prayers/page95.html',
		'prayers/page96.html',
		'prayers/page97.html',
		'prayers/page98.html',
		'prayers/page99.html',
		'prayers/page100.html',
		'prayers/page101.html',
		'prayers/page102.html',
		'prayers/page103.html',
		'prayers/page104.html',
		'prayers/page105.html',
		'prayers/page106.html',
		'prayers/page107.html',
		'prayers/page108.html',
		'prayers/page109.html',
		'prayers/page110.html',
		'prayers/page111.html',
		'prayers/page112.html',
		'prayers/page113.html',
		'prayers/page114.html',
		'prayers/page115.html',
		'prayers/page116.html',
		'prayers/page117.html',
		];

let currentPage = 0; 
// Function to load a specific prayer page
function loadPrayerPage(pageIndex) {
    if (pageIndex >= 0 && pageIndex < prayerFiles.length) {
        fetch(prayerFiles[pageIndex])
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(data, 'text/html');
                const imgElement = htmlDoc.querySelector('img');

                if (imgElement) {
                    const imgSrc = imgElement.getAttribute('src');
                    prayerContainer.innerHTML = `<img src="${imgSrc}" alt="Prayer Image" class="prayer-image">`;
                } else {
                    console.warn('No image found in the prayer file:', prayerFiles[pageIndex]);
                    prayerContainer.innerHTML = '<p>No image found in this prayer file.</p>';
                }

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
const fullScreenButton = document.getElementById('fullScreenButton');
function toggleFullScreen() {
    const imgElement = prayerContainer.querySelector('img');
    const fullScreenToggle = document.getElementById('fullScreenToggle');
    const fullScreenContextMenu = document.getElementById('fullScreenContextMenu');

    if (imgElement && !document.fullscreenElement) {
        // Enter full-screen mode
        prayerContainer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        fullScreenButton.innerText = "Exit Full Screen";
        fullScreenToggle.style.display = "block"; 
        fullScreenContextMenu.style.display = "none"; 

        // Sync dark theme
        if (document.body.classList.contains('dark-mode')) {
            prayerContainer.classList.add('dark-mode');
        } else {
            prayerContainer.classList.remove('dark-mode');
        }

        // Add event listeners for full-screen mode
        prayerContainer.addEventListener('dblclick', toggleFullScreen); 
    } else {
        // Exit full-screen mode
        document.exitFullscreen();
        fullScreenButton.innerText = "Full Screen";
        fullScreenToggle.style.display = "none"; 
        fullScreenContextMenu.style.display = "none"; 

        // Remove event listeners for full-screen mode
        prayerContainer.removeEventListener('dblclick', toggleFullScreen);
    }
}
function exitFullScreen() {
    document.exitFullscreen();
    fullScreenButton.innerText = "Full Screen";
    const fullScreenContextMenu = document.getElementById('fullScreenContextMenu');
    fullScreenContextMenu.style.display = "none"; 
}
function handleFullScreenClick(event) {
    const fullScreenContextMenu = document.getElementById('fullScreenContextMenu');

    if (fullScreenContextMenu.style.display === "none" || fullScreenContextMenu.style.display === "") {
        fullScreenContextMenu.style.display = "flex"; 
    } else {
        fullScreenContextMenu.style.display = "none"; 
    }
    event.stopPropagation();
}
// Event listener for the "Full Screen" button
fullScreenButton.addEventListener('click', toggleFullScreen);
prayerContainer.addEventListener('dblclick', toggleFullScreen);

let currentScale = 1; 

function zoomIn() {
    currentScale += 0.1; 
    updateImageScale();
}

function zoomOut() {
    currentScale = Math.max(0.5, currentScale - 0.1); 
    updateImageScale();
}

function resetZoom() {
    currentScale = 1; 
    updateImageScale();
}

function updateImageScale() {
    const imgElement = prayerContainer.querySelector('img');
    if (imgElement) {
        imgElement.style.transform = `scale(${currentScale})`;
    }
}
function toggleZoomControls() {
    const fullScreenControls = document.getElementById('fullScreenControls');
    if (fullScreenControls.style.display === "none" || fullScreenControls.style.display === "") {
        fullScreenControls.style.display = "block"; 
    } else {
        fullScreenControls.style.display = "none"; 
    }
}
function handleFullScreenNavigation(event) {
    const screenWidth = window.innerWidth;
    const clickX = event.clientX;

    if (clickX < screenWidth * 0.33) {
        if (currentPage > 0) {
            loadPrayerPage(currentPage - 1);
        }
    } else if (clickX > screenWidth * 0.66) {
        if (currentPage < prayerFiles.length - 1) {
            loadPrayerPage(currentPage + 1);
        }
    } else {
        const pageNumber = prompt(`Enter page number (1-${prayerFiles.length}):`);
        if (pageNumber) {
            const pageIndex = parseInt(pageNumber, 10) - 1;
            if (pageIndex >= 0 && pageIndex < prayerFiles.length) {
                loadPrayerPage(pageIndex);
            } else {
                alert('Invalid page number!');
            }
        }
    }
}
function toggleContextMenu() {
    const fullScreenContextMenu = document.getElementById('fullScreenContextMenu');
    if (fullScreenContextMenu.style.display === "none" || fullScreenContextMenu.style.display === "") {
        fullScreenContextMenu.style.display = "flex"; 
    } else {
        fullScreenContextMenu.style.display = "none"; 
    }
}
