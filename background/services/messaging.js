// Message handling for background script

// Initialize message listeners
export function init() {
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Handle messages from content scripts and popup
function handleMessage(message, sender, sendResponse) {
  console.log('Received message:', message);
  
  // Process different message types
  switch (message.type) {
    case 'GET_STATE':
      handleGetState(sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'UPDATE_STATE':
      handleUpdateState(message.data, sendResponse);
      return true;
      
    case 'CONNECT_API':
      handleConnectApi(message.api, sendResponse);
      return true;
      
    case 'LAUNCH_CAMPAIGN':
      handleLaunchCampaign(message.campaign, sendResponse);
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
}

// Get current extension state
function handleGetState(sendResponse) {
  chrome.storage.local.get(null, (data) => {
    sendResponse({ success: true, data });
  });
}

// Update extension state
function handleUpdateState(data, sendResponse) {
  chrome.storage.local.set(data, () => {
    sendResponse({ success: true });
  });
}

// Connect to external API (simulated)
function handleConnectApi(api, sendResponse) {
  // Simulate API connection
  setTimeout(() => {
    chrome.storage.local.get('apiConnections', (data) => {
      const apiConnections = data.apiConnections || {};
      apiConnections[api] = true;
      
      chrome.storage.local.set({ apiConnections }, () => {
        sendResponse({ success: true, api, connected: true });
      });
    });
  }, 1500);
}

// Launch a new campaign (simulated)
function handleLaunchCampaign(campaign, sendResponse) {
  // Simulate campaign launch
  setTimeout(() => {
    chrome.storage.local.get('activeCampaigns', (data) => {
      const activeCampaigns = data.activeCampaigns || [];
      campaign.id = Date.now(); // Generate unique ID
      campaign.status = 'active';
      campaign.launchDate = new Date().toISOString();
      
      activeCampaigns.push(campaign);
      chrome.storage.local.set({ activeCampaigns }, () => {
        sendResponse({ success: true, campaign });
      });
    });
  }, 2000);
}