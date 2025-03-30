// Main entry point for Bubo content script

// Global variables to track the Bubo UI state
let activeComposeWindow = null;
let buboToggleButton = null;
let buboContainer = null;
let observerInitialized = false;

// Load CSS file
function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL(href);
    link.id = href.replace(/\//g, '-'); // Create unique ID
    
    // Only add if not already loaded
    if (!document.getElementById(link.id)) {
      link.onload = () => {
        console.log(`Loaded CSS: ${href}`);
        resolve();
      };
      link.onerror = (err) => {
        console.error(`Failed to load CSS: ${href}`, err);
        reject(err);
      };
      document.head.appendChild(link);
    } else {
      resolve();
    }
  });
}

// Store for component data
const componentData = {
  data: {
    currentScreen: 'dashboard',
    apiStatus: {
      hunterConnected: false,
      gmailConnected: false
    },
    purpose: '',
    segmentation: {
      size: false,
      employees: false,
      location: false,
      industry: false
    },
    companies: [
      { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: false },
      { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: false },
      { id: 3, name: 'SportHaus', industry: 'Sporting Goods', employees: '100-250', selected: false },
    ],
    selectedCompanies: [],
    contacts: [
      { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', match: 95, selected: false },
      { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', match: 80, selected: false },
      { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', match: 90, selected: false },
    ],
    selectedContacts: [],
    emails: [],
    followups: [],
    activeCampaigns: []
  },
  
  listeners: {},
  
  setState(newState) {
    this.data = { ...this.data, ...newState };
    this.notifyListeners();
  },
  
  getState() {
    return { ...this.data };
  },
  
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  },
  
  notifyListeners() {
    Object.keys(this.listeners).forEach(key => {
      this.listeners[key].forEach(callback => {
        callback(this.data);
      });
    });
  },
  
  goToScreen(screen) {
    this.setState({ currentScreen: screen });
  },
  
  toggleCompanySelection(id) {
    const updatedCompanies = [...this.data.companies];
    const index = updatedCompanies.findIndex(company => company.id === id);
    if (index !== -1) {
      updatedCompanies[index].selected = !updatedCompanies[index].selected;
      this.setState({ 
        companies: updatedCompanies,
        selectedCompanies: updatedCompanies.filter(company => company.selected)
      });
    }
  },
  
  toggleContactSelection(id) {
    const updatedContacts = [...this.data.contacts];
    const index = updatedContacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      updatedContacts[index].selected = !updatedContacts[index].selected;
      this.setState({ 
        contacts: updatedContacts,
        selectedContacts: updatedContacts.filter(contact => contact.selected)
      });
    }
  }
};

// Create and inject the toggle button
function injectToggleButton(composeWindow) {
  if (!composeWindow) return;
  
  // Create toggle button
  buboToggleButton = document.createElement('button');
  buboToggleButton.className = 'bubo-toggle-btn';
  buboToggleButton.innerText = 'B';
  buboToggleButton.title = 'Open Bubo';
  buboToggleButton.style.position = 'absolute';
  buboToggleButton.style.zIndex = '9999';
  buboToggleButton.style.width = '32px';
  buboToggleButton.style.height = '32px';
  buboToggleButton.style.borderRadius = '50%';
  buboToggleButton.style.backgroundColor = '#8E5ADF';
  buboToggleButton.style.color = 'white';
  buboToggleButton.style.border = 'none';
  buboToggleButton.style.fontWeight = 'bold';
  buboToggleButton.style.cursor = 'pointer';
  buboToggleButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  
  // Append button to body
  document.body.appendChild(buboToggleButton);
  
  // Position button in the top-right corner of compose window
  updateButtonPosition(composeWindow);
  
  // Add click handler to toggle Bubo container
  buboToggleButton.addEventListener('click', () => {
    toggleBuboContainer();
  });
}

// Update toggle button position
function updateButtonPosition(composeWindow) {
  if (!composeWindow || !buboToggleButton) return;
  
  const rect = composeWindow.getBoundingClientRect();
  
  // Position in the top-right corner of the compose window
  buboToggleButton.style.position = 'fixed';
  buboToggleButton.style.top = `${rect.top + 8}px`;
  buboToggleButton.style.left = `${rect.right - 40}px`; // 8px from the right edge
}

// Position UI element next to Gmail compose window
function positionNextToGmailCompose(element, composeWindow) {
  if (!composeWindow) {
    // Find the first compose window if not provided
    composeWindow = document.querySelector('div.nH.Hd[role="dialog"]');
  }
  
  if (!composeWindow || !element) return;
  
  // Get compose window's position
  const composeRect = composeWindow.getBoundingClientRect();
  
  // Position to the right of the compose window
  element.style.position = 'fixed';
  element.style.top = `${composeRect.top}px`;
  element.style.left = `${composeRect.right + 16}px`; // 16px gap
  element.style.zIndex = '9999';
  
  // Make sure it's on screen
  const elementRect = element.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Handle horizontal positioning
  if (elementRect.right > windowWidth) {
    // Not enough room on right, position on left
    element.style.left = `${composeRect.left - elementRect.width - 16}px`;
  }
  
  // Handle vertical positioning
  const elementHeight = elementRect.height;
  const availableHeight = windowHeight - composeRect.top - 20; // 20px bottom margin
  
  // If element would overflow the bottom of the screen, adjust its height
  if (elementHeight > availableHeight) {
    // Apply height to the module
    element.style.maxHeight = `${availableHeight}px`;
    
    // Calculate height for the content area (subtract header height)
    const headerHeight = element.querySelector('.bubo-header')?.offsetHeight || 60;
    const contentElement = element.querySelector('.bubo-content');
    
    if (contentElement) {
      contentElement.style.maxHeight = `${availableHeight - headerHeight}px`;
    }
  } else {
    // Reset to default if there's enough space
    element.style.maxHeight = '80vh';
    
    const contentElement = element.querySelector('.bubo-content');
    if (contentElement) {
      contentElement.style.maxHeight = 'calc(80vh - 60px)';
    }
  }
}

// Create or show Bubo container
function toggleBuboContainer() {
  if (!buboContainer) {
    // Create container if it doesn't exist
    buboContainer = document.createElement('div');
    buboContainer.id = 'bubo-container';
    document.body.appendChild(buboContainer);
    
    // Initialize UI
    componentData.goToScreen('dashboard');
    renderCurrentScreen();
    
    // Set up listeners for state changes
    componentData.subscribe('main', renderCurrentScreen);
  } else {
    // Toggle visibility
    if (buboContainer.style.display === 'none') {
      buboContainer.style.display = 'block';
    } else {
      buboContainer.style.display = 'none';
    }
  }
  
  // Position next to compose window
  if (buboContainer.style.display !== 'none') {
    positionNextToGmailCompose(buboContainer, activeComposeWindow);
    setupPositionListeners(buboContainer, activeComposeWindow);
  }
}

// Update position when window resizes or scrolls
function setupPositionListeners(element, composeWindow) {
  if (!element || !composeWindow) return;
  
  // Clean up any previous listeners to avoid duplicates
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  
  // Create bound event handlers
  function handleResize() {
    positionNextToGmailCompose(element, composeWindow);
  }
  
  function handleScroll() {
    positionNextToGmailCompose(element, composeWindow);
  }
  
  // Add event listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
}

// Remove Bubo UI elements
function removeFloatingUI() {
  if (buboToggleButton) {
    buboToggleButton.remove();
    buboToggleButton = null;
  }
  
  if (buboContainer) {
    buboContainer.remove();
    buboContainer = null;
  }
}

// Check for Gmail compose windows
function checkForComposeWindows() {
  // Check for Gmail compose windows
  const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"]');
  
  if (composeWindows.length === 0) {
    // No compose windows, remove any existing UI
    removeFloatingUI();
    activeComposeWindow = null;
    return;
  }
  
  // Get the first compose window if there are multiple
  const composeWindow = composeWindows[0];
  
  // If it's the same window we already processed, just update positioning
  if (composeWindow === activeComposeWindow && buboToggleButton) {
    updateButtonPosition(composeWindow);
    return;
  }
  
  // New compose window detected, clean up any existing UI
  removeFloatingUI();
  
  // Set this as the active window and inject UI
  activeComposeWindow = composeWindow;
  injectToggleButton(composeWindow);
}

// Initialize MutationObserver to detect compose windows
function initializeObserver() {
  if (observerInitialized) return;
  
  console.log('Initializing observer');
  
  // Create observer
  const observer = new MutationObserver((mutations) => {
    checkForComposeWindows();
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Set flag
  observerInitialized = true;
  
  // Also check immediately
  checkForComposeWindows();
  
  // Check periodically as well (backup)
  setInterval(checkForComposeWindows, 1000);
  
  console.log('Observer initialized');
}

// Component Implementations

// Render followup setup component
function renderFollowupSetup(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load followup setup CSS
  loadCSS('content/components/followup-setup/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Get the selected contacts
  const selectedContacts = state.contacts.filter(contact => contact.selected);
  const currentContact = selectedContacts[0] || { name: 'No Contact Selected', company: 'Unknown' };
  
  // Sequence info
  const sequenceInfo = document.createElement('div');
  sequenceInfo.className = 'bubo-sequence-info';
  sequenceInfo.innerHTML = `
    <h2 class="bubo-sequence-title">Follow-up Sequence</h2>
    <p class="bubo-sequence-recipient">For: ${currentContact.name}, ${currentContact.company}</p>
  `;
  
  // Timeline
  const timeline = document.createElement('div');
  timeline.className = 'bubo-timeline';
  
  // Initial email
  const initialEmail = document.createElement('div');
  initialEmail.className = 'bubo-timeline-item';
  initialEmail.innerHTML = `
    <div class="bubo-timeline-marker bubo-timeline-initial"></div>
    <div class="bubo-timeline-content">
      <p class="bubo-timeline-title">Initial Email</p>
      <p class="bubo-timeline-date">Today</p>
    </div>
  `;
  
  // Follow-up 1
  const followup1 = document.createElement('div');
  followup1.className = 'bubo-timeline-item';
  followup1.innerHTML = `
    <div class="bubo-timeline-marker bubo-timeline-followup"></div>
    <div class="bubo-timeline-content">
      <div class="bubo-timeline-header">
        <p class="bubo-timeline-title">Follow-up #1</p>
        <button class="bubo-timeline-edit">Edit</button>
      </div>
      <p class="bubo-timeline-date">3 days after initial email</p>
      <div class="bubo-timeline-badge">
        <span class="bubo-recommended">Recommended</span>
      </div>
    </div>
  `;
  
  // Follow-up 2
  const followup2 = document.createElement('div');
  followup2.className = 'bubo-timeline-item';
  followup2.innerHTML = `
    <div class="bubo-timeline-marker bubo-timeline-followup"></div>
    <div class="bubo-timeline-content">
      <div class="bubo-timeline-header">
        <p class="bubo-timeline-title">Follow-up #2</p>
        <button class="bubo-timeline-edit">Edit</button>
      </div>
      <p class="bubo-timeline-date">7 days after initial email</p>
    </div>
  `;
  
  // Add followup button
  const addFollowup = document.createElement('button');
  addFollowup.className = 'bubo-add-followup';
  addFollowup.innerHTML = '+ Add Another Follow-up';
  
  // Global settings
  const globalSettings = document.createElement('div');
  globalSettings.className = 'bubo-global-settings';
  globalSettings.innerHTML = `
    <h3 class="bubo-settings-title">Follow-up Settings</h3>
    
    <div class="bubo-setting-row">
      <span class="bubo-setting-label">Best time to send</span>
      <div class="bubo-setting-value">Tuesday-Thursday, 10:00-11:00 AM</div>
    </div>
    
    <div class="bubo-setting-row">
      <span class="bubo-setting-label">Stop if recipient</span>
      <div class="bubo-setting-value">Replies or Books Meeting</div>
    </div>
  `;
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'bubo-action-buttons';
  actionButtons.innerHTML = `
    <button class="bubo-btn bubo-btn-secondary" id="back-btn">Back</button>
    <button class="bubo-btn bubo-btn-primary" id="schedule-btn">Schedule Campaign</button>
  `;
  
  // Assemble timeline
  timeline.appendChild(initialEmail);
  timeline.appendChild(followup1);
  timeline.appendChild(followup2);
  
  // Assemble content
  content.appendChild(sequenceInfo);
  content.appendChild(timeline);
  content.appendChild(addFollowup);
  content.appendChild(globalSettings);
  content.appendChild(actionButtons);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachFollowupSetupBehaviors(container);
  
  return container;
}

// Attach followup setup behaviors
function attachFollowupSetupBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Back button
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      componentData.goToScreen('emails');
    });
  }
  
  // Schedule Campaign button
  const scheduleBtn = container.querySelector('#schedule-btn');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      componentData.goToScreen('send');
    });
  }
  
  // Add another followup button
  const addFollowupBtn = container.querySelector('.bubo-add-followup');
  if (addFollowupBtn) {
    addFollowupBtn.addEventListener('click', () => {
      alert('Additional follow-ups will be available in a future version');
    });
  }
  
  // Edit buttons for followups
  const editButtons = container.querySelectorAll('.bubo-timeline-edit');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('Follow-up editing will be available in a future version');
    });
  });
}

// Render campaign launch component
function renderCampaignLaunch(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load campaign launch CSS
  loadCSS('content/components/campaign-launch/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Campaign summary
  const campaignSummary = document.createElement('div');
  campaignSummary.className = 'bubo-campaign-summary';
  campaignSummary.innerHTML = `
    <h2 class="bubo-campaign-title">Campaign Summary</h2>
    <p class="bubo-campaign-name">Berlin Gym Equipment Outreach</p>
  `;
  
  // Campaign details
  const campaignDetails = document.createElement('div');
  campaignDetails.className = 'bubo-campaign-details';
  
  // Get selected contacts and companies
  const selectedContacts = state.contacts.filter(contact => contact.selected);
  const selectedCompanies = state.companies.filter(company => company.selected);
  
  campaignDetails.innerHTML = `
    <div class="bubo-detail-section">
      <p class="bubo-detail-title">Recipients</p>
      <p class="bubo-detail-text">${selectedContacts.length} contacts from ${selectedCompanies.length} ${selectedCompanies.length === 1 ? 'company' : 'companies'}</p>
    </div>
    
    <div class="bubo-detail-section">
      <p class="bubo-detail-title">Emails</p>
      <p class="bubo-detail-text">${selectedContacts.length} initial emails with 2 follow-ups each</p>
    </div>
    
    <div class="bubo-detail-section">
      <p class="bubo-detail-title">Timing</p>
      <p class="bubo-detail-text">Initial emails to be sent immediately</p>
      <p class="bubo-detail-text">Follow-ups scheduled over next 7 days</p>
    </div>
  `;
  
  // Send options
  const sendOptions = document.createElement('div');
  sendOptions.className = 'bubo-send-options';
  sendOptions.innerHTML = `
    <h3 class="bubo-options-title">Send Options</h3>
    
    <div class="bubo-option-buttons">
      <button class="bubo-btn bubo-btn-secondary" id="test-btn">Test</button>
      <button class="bubo-btn bubo-btn-secondary" id="schedule-btn">Schedule</button>
      <button class="bubo-btn bubo-btn-primary" id="send-now-btn">Send Now</button>
    </div>
  `;
  
  // Save options
  const saveOptions = document.createElement('div');
  saveOptions.className = 'bubo-save-options';
  saveOptions.innerHTML = `
    <button class="bubo-btn bubo-btn-secondary" id="save-template-btn">Save as Template</button>
    <button class="bubo-btn bubo-btn-secondary" id="save-draft-btn">Save as Draft</button>
  `;
  
  // Assemble
  content.appendChild(campaignSummary);
  content.appendChild(campaignDetails);
  content.appendChild(sendOptions);
  content.appendChild(saveOptions);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachCampaignLaunchBehaviors(container);
  
  return container;
}

// Attach campaign launch behaviors
function attachCampaignLaunchBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Test button
  const testBtn = container.querySelector('#test-btn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      alert('Test emails will be available in a future version');
    });
  }
  
  // Schedule button
  const scheduleBtn = container.querySelector('#schedule-btn');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      alert('Campaign scheduling will be available in a future version');
    });
  }
  
  // Send Now button
  const sendNowBtn = container.querySelector('#send-now-btn');
  if (sendNowBtn) {
    sendNowBtn.addEventListener('click', () => {
      // Add a new campaign to the active campaigns list
      const selectedContacts = state.contacts.filter(contact => contact.selected);
      const selectedCompanies = state.companies.filter(company => company.selected);
      
      const newCampaign = {
        id: Date.now(),
        name: 'Berlin Gym Equipment Outreach',
        contacts: selectedContacts.length,
        companies: selectedCompanies.length,
        date: new Date().toLocaleDateString(),
        opens: 0,
        replies: 0
      };
      
      componentData.setState({ 
        activeCampaigns: [...state.activeCampaigns, newCampaign]
      });
      
      alert('Campaign successfully launched! You can monitor its progress in the dashboard.');
      componentData.goToScreen('dashboard');
    });
  }
  
  // Save as Template button
  const saveTemplateBtn = container.querySelector('#save-template-btn');
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener('click', () => {
      alert('Template saving will be available in a future version');
    });
  }
  
  // Save as Draft button
  const saveDraftBtn = container.querySelector('#save-draft-btn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      alert('Draft saving will be available in a future version');
    });
  }
}

// Render dashboard component
function renderDashboard(state) {
  // Dashboard HTML
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load dashboard CSS
  loadCSS('content/components/dashboard/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Metrics
  const metrics = document.createElement('div');
  metrics.className = 'bubo-metrics';
  metrics.innerHTML = `
    <h2 class="bubo-title">Dashboard</h2>
    
    <div class="bubo-stat-cards">
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">${state.activeCampaigns.length || 0}</span>
        <span class="bubo-stat-label">Active Campaigns</span>
      </div>
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">-</span>
        <span class="bubo-stat-label">Open Rate</span>
      </div>
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">-</span>
        <span class="bubo-stat-label">Reply Rate</span>
      </div>
    </div>
    
    <button id="bubo-new-campaign" class="bubo-btn bubo-btn-primary bubo-btn-full">Start New Campaign</button>
    <button id="bubo-view-campaigns" class="bubo-btn bubo-btn-secondary bubo-btn-full">View All Campaigns</button>
    
    <div class="bubo-activity">
      <h3 class="bubo-title">Recent Activity</h3>
      ${state.activeCampaigns.length === 0 ? 
        '<div class="bubo-empty-state">No recent activity yet. Start your first campaign!</div>' :
        state.activeCampaigns.map(campaign => `
          <div class="bubo-campaign-card">
            <div class="bubo-campaign-header">
              <span class="bubo-campaign-name">${campaign.name}</span>
              <span class="bubo-campaign-date">${campaign.date}</span>
            </div>
            <div class="bubo-campaign-stats">
              <div class="bubo-stat">
                <span class="bubo-stat-value">${campaign.contacts}</span>
                <span class="bubo-stat-label">Contacts</span>
              </div>
              <div class="bubo-stat">
                <span class="bubo-stat-value">${campaign.opens || 0}</span>
                <span class="bubo-stat-label">Opens</span>
              </div>
              <div class="bubo-stat">
                <span class="bubo-stat-value">${campaign.replies || 0}</span>
                <span class="bubo-stat-label">Replies</span>
              </div>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
  
  // Assemble
  content.appendChild(metrics);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachDashboardBehaviors(container);
  
  return container;
}

// Attach dashboard behaviors
function attachDashboardBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // New campaign button
  const newCampaignBtn = container.querySelector('#bubo-new-campaign');
  if (newCampaignBtn) {
    newCampaignBtn.addEventListener('click', () => {
      componentData.goToScreen('purpose');
    });
  }
  
  // View campaigns button
  const viewCampaignsBtn = container.querySelector('#bubo-view-campaigns');
  if (viewCampaignsBtn) {
    viewCampaignsBtn.addEventListener('click', () => {
      alert('Campaign management screen will be available in a future version');
    });
  }
}

// Render purpose definition component
function renderPurposeDefinition(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load purpose CSS
  loadCSS('content/components/purpose-definition/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  content.innerHTML = `
    <h2 class="bubo-title">Define your outreach purpose</h2>
    
    <!-- Purpose input -->
    <textarea
      id="purpose-input"
      class="bubo-purpose-input"
      placeholder="I'm looking to sell to German companies in Berlin gym equipment..."
    >${state.purpose}</textarea>
    
    <!-- Segment options -->
    <h2 class="bubo-title bubo-segment-title">Segment by (optional)</h2>
    
    <div class="bubo-segment-options">
      <button class="bubo-segment-option ${state.segmentation.size ? 'bubo-segment-selected' : ''}" data-segment="size">
        <span class="bubo-segment-indicator"></span>
        Size
      </button>
      <button class="bubo-segment-option ${state.segmentation.employees ? 'bubo-segment-selected' : ''}" data-segment="employees">
        <span class="bubo-segment-indicator"></span>
        Employees
      </button>
      <button class="bubo-segment-option ${state.segmentation.location ? 'bubo-segment-selected' : ''}" data-segment="location">
        <span class="bubo-segment-indicator"></span>
        Location
      </button>
      <button class="bubo-segment-option ${state.segmentation.industry ? 'bubo-segment-selected' : ''}" data-segment="industry">
        <span class="bubo-segment-indicator"></span>
        Industry
      </button>
    </div>
    
    <!-- Action button -->
    <button id="find-companies-btn" class="bubo-btn bubo-btn-primary bubo-btn-full ${!state.purpose ? 'bubo-btn-disabled' : ''}">
      Find Companies
    </button>
  `;
  
  // Assemble
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach event listeners
  attachPurposeDefinitionBehaviors(container);
  
  return container;
}

// Attach purpose definition behaviors
function attachPurposeDefinitionBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Purpose input
  const purposeInput = container.querySelector('#purpose-input');
  if (purposeInput) {
    purposeInput.addEventListener('input', (e) => {
      const purpose = e.target.value;
      componentData.setState({ purpose });
      
      // Enable/disable find companies button
      const findCompaniesBtn = container.querySelector('#find-companies-btn');
      if (findCompaniesBtn) {
        if (purpose.trim()) {
          findCompaniesBtn.classList.remove('bubo-btn-disabled');
        } else {
          findCompaniesBtn.classList.add('bubo-btn-disabled');
        }
      }
    });
  }
  
  // Segment options
  const segmentOptions = container.querySelectorAll('.bubo-segment-option');
  segmentOptions.forEach(option => {
    option.addEventListener('click', () => {
      const segment = option.dataset.segment;
      const state = componentData.getState();
      
      // Toggle selection
      componentData.setState({
        segmentation: {
          ...state.segmentation,
          [segment]: !state.segmentation[segment]
        }
      });
    });
  });
  
  // Find Companies button
  const findCompaniesBtn = container.querySelector('#find-companies-btn');
  if (findCompaniesBtn) {
    findCompaniesBtn.addEventListener('click', () => {
      const state = componentData.getState();
      if (state.purpose.trim()) {
        componentData.goToScreen('companies');
      }
    });
  }
}

// Render company selection component
function renderCompanySelection(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load company selection CSS
  loadCSS('content/components/company-selection/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Search bar
  const searchBar = document.createElement('div');
  searchBar.className = 'bubo-search-container';
  searchBar.innerHTML = `
    <input
      type="text"
      class="bubo-search-input"
      placeholder="Search companies..."
    />
    <span class="bubo-search-icon">🔍</span>
  `;
  
  // View tabs
  const viewTabs = document.createElement('div');
  viewTabs.className = 'bubo-tabs';
  viewTabs.innerHTML = `
    <button class="bubo-tab bubo-tab-selected" data-tab="auto">Auto</button>
    <button class="bubo-tab bubo-tab-default" data-tab="manual">Manual</button>
    <button class="bubo-tab bubo-tab-default" data-tab="import">Import</button>
    <button class="bubo-tab bubo-tab-default" data-tab="saved">Saved</button>
  `;
  
  // Results header
  const resultsHeader = document.createElement('div');
  resultsHeader.className = 'bubo-results-header';
  resultsHeader.innerHTML = `
    <h2 class="bubo-results-title">Recommended Companies (${state.companies.length})</h2>
    <div class="bubo-results-actions">
      <button class="bubo-action-btn">Filter</button>
      <button class="bubo-action-btn">Sort</button>
    </div>
  `;
  
  // Company cards
  const companyCards = document.createElement('div');
  companyCards.className = 'bubo-company-cards';
  
  state.companies.forEach(company => {
    const card = document.createElement('div');
    card.className = 'bubo-company-card';
    card.innerHTML = `
      <input
        type="checkbox"
        class="bubo-company-checkbox"
        data-company-id="${company.id}"
        ${company.selected ? 'checked' : ''}
      />
      <div class="bubo-company-info">
        <p class="bubo-company-name">${company.name}</p>
        <p class="bubo-company-details">${company.industry} • ${company.employees} employees</p>
      </div>
      <button class="bubo-company-add" data-company-id="${company.id}">+</button>
    `;
    companyCards.appendChild(card);
  });
  
  // Load more
  const loadMore = document.createElement('div');
  loadMore.className = 'bubo-load-more';
  loadMore.innerHTML = `
    <button class="bubo-load-more-btn">Show more companies</button>
  `;
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'bubo-action-buttons';
  actionButtons.innerHTML = `
    <button class="bubo-btn bubo-btn-secondary" id="save-list-btn">Save List</button>
    <button class="bubo-btn bubo-btn-primary" id="find-contacts-btn">Find Contacts</button>
  `;
  
  // Selection status
  const selectionStatus = document.createElement('div');
  selectionStatus.className = 'bubo-selection-status';
  selectionStatus.innerHTML = `
    <span class="bubo-selection-count">${state.selectedCompanies.length} ${state.selectedCompanies.length === 1 ? 'company' : 'companies'} selected</span>
    <button class="bubo-selection-all">Select all (${state.companies.length})</button>
  `;
  
  // Assemble
  content.appendChild(searchBar);
  content.appendChild(viewTabs);
  content.appendChild(resultsHeader);
  content.appendChild(companyCards);
  content.appendChild(loadMore);
  content.appendChild(actionButtons);
  content.appendChild(selectionStatus);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachCompanySelectionBehaviors(container);
  
  return container;
}

// Attach company selection behaviors
function attachCompanySelectionBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Company checkboxes
  const companyCheckboxes = container.querySelectorAll('.bubo-company-checkbox');
  companyCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const companyId = parseInt(checkbox.dataset.companyId);
      componentData.toggleCompanySelection(companyId);
    });
  });
  
  // Find Contacts button
  const findContactsBtn = container.querySelector('#find-contacts-btn');
  if (findContactsBtn) {
    findContactsBtn.addEventListener('click', () => {
      componentData.goToScreen('contacts');
    });
  }
  
  // Save List button
  const saveListBtn = container.querySelector('#save-list-btn');
  if (saveListBtn) {
    saveListBtn.addEventListener('click', () => {
      alert('List saved successfully!');
    });
  }
  
  // Tab buttons
  const tabButtons = container.querySelectorAll('.bubo-tab');
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove selected class from all tabs
      tabButtons.forEach(t => t.classList.remove('bubo-tab-selected'));
      tabButtons.forEach(t => t.classList.add('bubo-tab-default'));
      
      // Add selected class to clicked tab
      tab.classList.add('bubo-tab-selected');
      tab.classList.remove('bubo-tab-default');
      
      // Show alert for tabs other than "Auto"
      const tabName = tab.dataset.tab;
      if (tabName !== 'auto') {
        alert(`The "${tabName}" tab will be available in a future version.`);
        
        // Reset to auto tab
        tabButtons.forEach(t => t.classList.remove('bubo-tab-selected'));
        tabButtons.forEach(t => t.classList.add('bubo-tab-default'));
        tabButtons[0].classList.add('bubo-tab-selected');
        tabButtons[0].classList.remove('bubo-tab-default');
      }
    });
  });
  
  // Load more button
  const loadMoreBtn = container.querySelector('.bubo-load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      alert('More companies will be available in a future version');
    });
  }
  
  // Select all button
  const selectAllBtn = container.querySelector('.bubo-selection-all');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      const state = componentData.getState();
      const allSelected = state.selectedCompanies.length === state.companies.length;
      
      // Toggle selection for all companies
      state.companies.forEach(company => {
        if (allSelected) {
          // Deselect all
          if (company.selected) {
            componentData.toggleCompanySelection(company.id);
          }
        } else {
          // Select all
          if (!company.selected) {
            componentData.toggleCompanySelection(company.id);
          }
        }
      });
    });
  }
}

// Render contact discovery component
function renderContactDiscovery(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load contact discovery CSS
  loadCSS('content/components/contact-discovery/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Get the selected companies
  const selectedCompanies = state.companies.filter(company => company.selected);
  const currentCompany = selectedCompanies[0] || { name: 'No Company Selected' };
  
  // Company navigation
  const companyNav = document.createElement('div');
  companyNav.className = 'bubo-company-nav';
  companyNav.innerHTML = `
    <h2 class="bubo-company-name">${currentCompany.name}</h2>
    <div class="bubo-company-counter">
      1 of ${selectedCompanies.length}
    </div>
  `;
  
  // Contact filters
  const contactFilters = document.createElement('div');
  contactFilters.className = 'bubo-contact-filters';
  contactFilters.innerHTML = `
    <h3 class="bubo-contact-title">Recommended Contacts</h3>
    
    <div class="bubo-tabs">
      <button class="bubo-tab bubo-tab-selected" data-filter="all">All Roles</button>
      <button class="bubo-tab bubo-tab-default" data-filter="executives">Executives</button>
      <button class="bubo-tab bubo-tab-default" data-filter="purchasing">Purchasing</button>
    </div>
  `;
  
  // Contact cards
  const contactCards = document.createElement('div');
  contactCards.className = 'bubo-contact-cards';
  
  // Filter contacts for the current company
  const companyContacts = state.contacts.filter(contact => contact.company === currentCompany.name);
  
  companyContacts.forEach(contact => {
    const card = document.createElement('div');
    card.className = 'bubo-contact-card';
    card.innerHTML = `
      <div class="bubo-contact-header">
        <input
          type="checkbox"
          class="bubo-contact-checkbox"
          data-contact-id="${contact.id}"
          ${contact.selected ? 'checked' : ''}
        />
        <div class="bubo-contact-name">${contact.name}</div>
        <div class="bubo-contact-match">✓</div>
      </div>
      <div class="bubo-contact-details">
        <p class="bubo-contact-role">${contact.role}</p>
        <p class="bubo-contact-email">${contact.email}</p>
        <div class="bubo-contact-score">
          <span class="bubo-match-score">${contact.match}% match</span>
        </div>
      </div>
    `;
    contactCards.appendChild(card);
  });
  
  // Add manually button
  const addManually = document.createElement('button');
  addManually.className = 'bubo-add-manually';
  addManually.innerHTML = '+ Add Contact Manually';
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'bubo-action-buttons';
  actionButtons.innerHTML = `
    <button class="bubo-btn bubo-btn-secondary" id="back-btn">Back</button>
    <button class="bubo-btn bubo-btn-primary" id="create-emails-btn">Create Emails</button>
  `;
  
  // Assemble
  content.appendChild(companyNav);
  content.appendChild(contactFilters);
  content.appendChild(contactCards);
  content.appendChild(addManually);
  content.appendChild(actionButtons);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachContactDiscoveryBehaviors(container);
  
  return container;
}

// Attach contact discovery behaviors
function attachContactDiscoveryBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Contact checkboxes
  const contactCheckboxes = container.querySelectorAll('.bubo-contact-checkbox');
  contactCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const contactId = parseInt(checkbox.dataset.contactId);
      componentData.toggleContactSelection(contactId);
    });
  });
  
  // Back button
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      componentData.goToScreen('companies');
    });
  }
  
  // Create Emails button
  const createEmailsBtn = container.querySelector('#create-emails-btn');
  if (createEmailsBtn) {
    createEmailsBtn.addEventListener('click', () => {
      componentData.goToScreen('emails');
    });
  }
  
  // Add Manually button
  const addManually = container.querySelector('.bubo-add-manually');
  if (addManually) {
    addManually.addEventListener('click', () => {
      alert('Manual contact entry will be available in a future version');
    });
  }
  
  // Role filter tabs
  const filterTabs = container.querySelectorAll('.bubo-tab[data-filter]');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove selected class from all tabs
      filterTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
      filterTabs.forEach(t => t.classList.add('bubo-tab-default'));
      
      // Add selected class to clicked tab
      tab.classList.add('bubo-tab-selected');
      tab.classList.remove('bubo-tab-default');
      
      // Alert for future functionality
      const filter = tab.dataset.filter;
      if (filter !== 'all') {
        alert(`The "${filter}" filter will be available in a future version.`);
        
        // Reset to all tab
        filterTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
        filterTabs.forEach(t => t.classList.add('bubo-tab-default'));
        filterTabs[0].classList.add('bubo-tab-selected');
        filterTabs[0].classList.remove('bubo-tab-default');
      }
    });
  });
}

// Render email creation component
function renderEmailCreation(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Load email creation CSS
  loadCSS('content/components/email-creation/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Get the selected contacts
  const selectedContacts = state.contacts.filter(contact => contact.selected);
  const currentContact = selectedContacts[0] || { name: 'No Contact Selected', company: 'Unknown' };
  
  // Email navigation
  const emailNav = document.createElement('div');
  emailNav.className = 'bubo-email-nav';
  emailNav.innerHTML = `
    <h2 class="bubo-email-recipient">Email to ${currentContact.name}</h2>
    <div class="bubo-email-counter">
      1 of ${selectedContacts.length}
    </div>
  `;
  
  // Email preview
  const emailPreview = document.createElement('div');
  emailPreview.className = 'bubo-email-preview';
  emailPreview.innerHTML = `
    <p class="bubo-email-subject">Subject: Premium Gym Equipment for ${currentContact.company}</p>
    
    <p class="bubo-email-body">Dear ${currentContact.name.split(' ')[0]},</p>
    
    <p class="bubo-email-body">
      I noticed that ${currentContact.company} has been expanding its premium fitness studios across the city, and I wanted to introduce our latest line of commercial-grade gym equipment.
    </p>
    
    <p class="bubo-email-body">
      Would you be open to a brief conversation about how our equipment could enhance your members' experience?
    </p>
    
    <p class="bubo-email-body">Best regards,</p>
    <p class="bubo-email-body">[Your Name]</p>
  `;
  
  // Tone selector
  const toneSelector = document.createElement('div');
  toneSelector.className = 'bubo-tone-selector';
  toneSelector.innerHTML = `
    <h3 class="bubo-tone-title">Email Tone</h3>
    
    <div class="bubo-tabs">
      <button class="bubo-tab bubo-tab-selected" data-tone="professional">Professional</button>
      <button class="bubo-tab bubo-tab-default" data-tone="friendly">Friendly</button>
      <button class="bubo-tab bubo-tab-default" data-tone="direct">Direct</button>
      <button class="bubo-tab bubo-tab-default" data-tone="custom">Custom</button>
    </div>
  `;
  
  // Action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'bubo-email-actions';
  actionButtons.innerHTML = `
    <button class="bubo-btn bubo-btn-secondary" id="edit-btn">Edit</button>
    <button class="bubo-btn bubo-btn-secondary" id="skip-btn">Skip</button>
    <button class="bubo-btn bubo-btn-primary" id="accept-btn">Accept</button>
  `;
  
  // Navigation
  const emailNavigation = document.createElement('div');
  emailNavigation.className = 'bubo-email-navigation';
  emailNavigation.innerHTML = `
    <button class="bubo-nav-btn bubo-nav-prev" id="prev-email">← Previous</button>
    <div class="bubo-nav-counter">1 of ${selectedContacts.length}</div>
    <button class="bubo-nav-btn bubo-nav-next" id="next-email">Next →</button>
  `;
  
  // Accept all link
  const acceptAll = document.createElement('div');
  acceptAll.className = 'bubo-accept-all';
  acceptAll.innerHTML = `
    <button class="bubo-link" id="accept-all-btn">Accept All Drafts</button>
  `;
  
  // Assemble
  content.appendChild(emailNav);
  content.appendChild(emailPreview);
  content.appendChild(toneSelector);
  content.appendChild(actionButtons);
  content.appendChild(emailNavigation);
  content.appendChild(acceptAll);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  attachEmailCreationBehaviors(container);
  
  return container;
}

// Attach email creation behaviors
function attachEmailCreationBehaviors(container) {
  // Close button
  const closeBtn = container.querySelector('#bubo-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (buboContainer) {
        buboContainer.style.display = 'none';
      }
    });
  }
  
  // Tone selector tabs
  const toneTabs = container.querySelectorAll('.bubo-tab[data-tone]');
  toneTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove selected class from all tabs
      toneTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
      toneTabs.forEach(t => t.classList.add('bubo-tab-default'));
      
      // Add selected class to clicked tab
      tab.classList.add('bubo-tab-selected');
      tab.classList.remove('bubo-tab-default');
      
      // Alert for future functionality
      const tone = tab.dataset.tone;
      if (tone !== 'professional') {
        alert(`The "${tone}" tone will be available in a future version.`);
        
        // Reset to professional tab
        toneTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
        toneTabs.forEach(t => t.classList.add('bubo-tab-default'));
        toneTabs[0].classList.add('bubo-tab-selected');
        toneTabs[0].classList.remove('bubo-tab-default');
      }
    });
  });
  
  // Edit button
  const editBtn = container.querySelector('#edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      alert('Email editing will be available in a future version');
    });
  }
  
  // Skip button
  const skipBtn = container.querySelector('#skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      alert('Skipping to next email will be available in a future version');
    });
  }
  
  // Accept button
  const acceptBtn = container.querySelector('#accept-btn');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      alert('Email accepted');
    });
  }
  
  // Previous email button
  const prevEmailBtn = container.querySelector('#prev-email');
  if (prevEmailBtn) {
    prevEmailBtn.addEventListener('click', () => {
      alert('Navigation between emails will be available in a future version');
    });
  }
  
  // Next email button
  const nextEmailBtn = container.querySelector('#next-email');
  if (nextEmailBtn) {
    nextEmailBtn.addEventListener('click', () => {
      alert('Navigation between emails will be available in a future version');
    });
  }
  
  // Accept all drafts
  const acceptAllBtn = container.querySelector('#accept-all-btn');
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', () => {
      componentData.goToScreen('followups');
    });
  }
}

// Render current screen
function renderCurrentScreen() {
  if (!buboContainer) return;
  
  // Get current state
  const state = componentData.getState();
  const currentScreen = state.currentScreen;
  
  // Clear container
  buboContainer.innerHTML = '';
  
  // Render appropriate component
  let renderedContainer = null;
  
  switch(currentScreen) {
    case 'dashboard':
      renderedContainer = renderDashboard(state);
      break;
    case 'purpose':
      renderedContainer = renderPurposeDefinition(state);
      break;
    case 'companies':
      renderedContainer = renderCompanySelection(state);
      break;
    case 'contacts':
      renderedContainer = renderContactDiscovery(state);
      break;
    case 'emails':
      renderedContainer = renderEmailCreation(state);
      break;
    case 'followups':
      renderedContainer = renderFollowupSetup(state);
      break;
    case 'send':
      renderedContainer = renderCampaignLaunch(state);
      break;
    default:
      // For all other screens, show a placeholder
      renderedContainer = document.createElement('div');
      renderedContainer.className = 'bubo-module';
      renderedContainer.innerHTML = `
        <div class="bubo-header">
          <div class="bubo-brand">
            <span class="bubo-logo">Bubo</span>
            <span class="bubo-tagline">Smart Outreach</span>
          </div>
          <button id="bubo-close" class="bubo-close">×</button>
        </div>
        <div class="bubo-content">
          <h2 class="bubo-title">Screen: ${currentScreen}</h2>
          <p class="bubo-subtitle">This screen is under development</p>
          <button id="back-to-dashboard" class="bubo-btn bubo-btn-primary">Back to Dashboard</button>
        </div>
      `;
      
      // Attach behavior to return to dashboard
      const dashboardBtn = renderedContainer.querySelector('#back-to-dashboard');
      if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
          componentData.goToScreen('dashboard');
        });
      }
      
      // Close button
      const defaultCloseBtn = renderedContainer.querySelector('#bubo-close');
      if (defaultCloseBtn) {
        defaultCloseBtn.addEventListener('click', () => {
          if (buboContainer) {
            buboContainer.style.display = 'none';
          }
        });
      }
  }
  
  if (renderedContainer) {
    buboContainer.appendChild(renderedContainer);
  }
  
  // Position near compose window
  positionNextToGmailCompose(buboContainer, activeComposeWindow);
}

// Initialize the extension
async function initialize() {
  try {
    console.log('Starting Bubo initialization...');
    
    // Load base styles
    await loadCSS('content/styles/base.css');
    
    // Initialize the Observer
    initializeObserver();
    
    console.log('Bubo extension initialized successfully!');
  } catch (error) {
    console.error('Error initializing Bubo extension:', error);
  }
}

// Start extension when DOM is ready
console.log('Bubo content script loaded');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}