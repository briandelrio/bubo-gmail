// Background script for the Bubo extension

// Initialize listener for messages from content scripts
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Background script received message:', request);
    
    // Handle different message types
    if (request.type === 'LOG') {
      console.log('Content script log:', request.message);
      sendResponse({status: 'logged'});
    }
    
    // Keep the message channel open for async responses
    return true;
  }
);

// Log when service worker starts
console.log('Bubo service worker initialized');