// Popup script

// DOM elements
const openGmailBtn = document.getElementById('open-gmail-btn');
const hunterStatus = document.getElementById('hunter-status');
const gmailStatus = document.getElementById('gmail-status');

// Initialize popup
function initialize() {
  // Add event listeners
  openGmailBtn.addEventListener('click', openGmail);
  
  // Load current state
  loadState();
}

// Open Gmail in a new tab
function openGmail() {
  chrome.tabs.create({ url: 'https://mail.google.com' });
}

// Load extension state
function loadState() {
  chrome.storage.local.get(['apiConnections'], (data) => {
    // Update API connection status
    const apiConnections = data.apiConnections || { hunter: false, gmail: false };
    
    if (apiConnections.hunter) {
      hunterStatus.textContent = 'Connected';
      hunterStatus.classList.add('connected');
    } else {
      hunterStatus.textContent = 'Not Connected';
      hunterStatus.classList.remove('connected');
    }
    
    if (apiConnections.gmail) {
      gmailStatus.textContent = 'Connected';
      gmailStatus.classList.add('connected');
    } else {
      gmailStatus.textContent = 'Not Connected';
      gmailStatus.classList.remove('connected');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);