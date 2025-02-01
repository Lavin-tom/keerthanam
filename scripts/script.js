// Darkmode.js Initialization
const darkmodeOptions = {
    bottom: '32px', 
    right: '32px', 
    left: 'unset', 
    time: '0.3s', 
    mixColor: '#f0f0f0', // Light mode background
    backgroundColor: '#f0f0f0', // Light mode background
    buttonColorDark: '#2c3e50', // Dark mode button color
    buttonColorLight: '#ffffff', // Light mode button color
    saveInCookies: true, 
    label: '🌓', 
    autoMatchOsTheme: false // Disable auto-match OS theme
};

const darkmode = new Darkmode(darkmodeOptions);
darkmode.showWidget();

// Add event listener for dark mode toggle
document.getElementById('dark_mode_toggle').addEventListener('click', () => {
    darkmode.toggle();
});

// PDF Viewer Logic
const url = 'assets/55179722.pdf'; 		
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
        pdfViewer.src = url; 
        prayersButton.innerText = "Hide"; 
    } else {
        pdfContainer.style.display = "none";
        prayersButton.innerText = "Show"; 
    }
}
