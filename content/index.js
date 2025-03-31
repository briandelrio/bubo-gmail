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
    previousScreen: null,
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
    emailTemplates: [],
    currentEmail: null,
    followups: [],
    followupTemplates: [],
    currentFollowup: null,
    activeCampaigns: [],
    currentCampaign: null
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
    this.setState({ 
      previousScreen: this.data.currentScreen,
      currentScreen: screen 
    });
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
    
    // Initialize UI with sample data for new components
    componentData.setState({
      // Initialize with mock data for the new components
      emails: [
        {
          id: 'email-1',
          subject: 'Introduction: Partnership Opportunity',
          body: '<p>Hi {{firstName}},</p><p>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.</p><p>Would you be open to a quick call to discuss how we might be able to help {{company}}?</p><p>Best regards,<br>[Your Name]</p>'
        }
      ],
      followups: [
        {
          id: 'followup-1',
          days: 3,
          time: 'morning',
          stopIfReplied: true,
          stopIfOpened: false,
          subject: 'Following up: Partnership Opportunity',
          body: '<p>Hi {{firstName}},</p><p>I wanted to follow up on my previous email about helping {{company}} with outreach and lead generation. I understand you might be busy, so I thought I would check in again.</p><p>Would you have 15 minutes for a quick call this week?</p><p>Best regards,<br>[Your Name]</p>'
        }
      ],
      activeCampaigns: [
        {
          id: 'campaign-1',
          name: 'Berlin Gym Equipment Outreach',
          status: 'active',
          created: '2025-01-15',
          contacts: 3,
          companies: 2,
          date: new Date().toLocaleDateString(),
          opens: 2,
          replies: 1,
          metrics: {
            delivered: 3,
            opened: 2,
            replied: 1,
            clicked: 1
          },
          emails: [],
          followups: [],
          activity: [
            { 
              type: 'sent', 
              message: 'Campaign launched successfully', 
              timestamp: new Date().toLocaleString() 
            }
          ]
        }
      ]
    });
    
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
  editButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      // Sample followup data
      const followupData = [
        {
          id: 'followup-1',
          days: 3,
          time: 'morning',
          stopIfReplied: true,
          stopIfOpened: false,
          subject: 'Following up: Partnership Opportunity',
          body: '<p>Hi {{firstName}},</p><p>I wanted to follow up on my previous email about helping {{company}} with outreach and lead generation. I understand you might be busy, so I thought I would check in again.</p><p>Would you have 15 minutes for a quick call this week?</p><p>Best regards,<br>[Your Name]</p>'
        },
        {
          id: 'followup-2',
          days: 7,
          time: 'afternoon',
          stopIfReplied: true,
          stopIfOpened: true,
          subject: 'Last follow-up: Partnership Opportunity',
          body: '<p>Hi {{firstName}},</p><p>I\'m reaching out one final time regarding our potential partnership. If you\'re interested in learning how we can help {{company}} improve your outreach strategy, please let me know.</p><p>I respect your time and won\'t follow up further if I don\'t hear back.</p><p>Best regards,<br>[Your Name]</p>'
        }
      ];
      
      // Get the appropriate followup based on button index
      const followup = followupData[index] || followupData[0];
      
      // Store the followup in state for editing
      componentData.setState({ 
        currentFollowup: followup,
        previousScreen: 'followups'
      });
      
      // Navigate to followup editor
      componentData.goToScreen('followup-editor');
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
      // In the future, this would go to a campaign management screen
      // For now, if we have a campaign, go to its details
      const state = componentData.getState();
      if (state.activeCampaigns && state.activeCampaigns.length > 0) {
        componentData.setState({ 
          currentCampaign: state.activeCampaigns[0]
        });
        componentData.goToScreen('campaign-detail');
      } else {
        alert('No active campaigns. Create a campaign first.');
      }
    });
  }
  
  // Add click handlers for campaign cards
  const campaignCards = container.querySelectorAll('.bubo-campaign-card');
  if (campaignCards.length) {
    campaignCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const state = componentData.getState();
        if (state.activeCampaigns && state.activeCampaigns.length > index) {
          // Set the selected campaign and navigate to detail view
          componentData.setState({ 
            currentCampaign: state.activeCampaigns[index]
          });
          componentData.goToScreen('campaign-detail');
        }
      });
      
      // Add cursor pointer to make it clear these are clickable
      card.style.cursor = 'pointer';
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
      // Set up current email for editing
      const state = componentData.getState();
      const selectedContacts = state.contacts.filter(contact => contact.selected);
      const currentContact = selectedContacts[0] || { name: 'No Contact Selected', company: 'Unknown' };
      
      // Create a sample email if none exists
      const email = {
        id: 'email-' + Date.now(),
        subject: `Premium Gym Equipment for ${currentContact.company}`,
        body: `<p>Dear ${currentContact.name.split(' ')[0]},</p>
               <p>I noticed that ${currentContact.company} has been expanding its premium fitness studios across the city, and I wanted to introduce our latest line of commercial-grade gym equipment.</p>
               <p>Would you be open to a brief conversation about how our equipment could enhance your members' experience?</p>
               <p>Best regards,<br>[Your Name]</p>`
      };
      
      // Store the email in state
      componentData.setState({ 
        currentEmail: email,
        previousScreen: 'emails'
      });
      
      // Navigate to email editor
      componentData.goToScreen('email-editor');
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
    // New screens for the enhanced modules
    case 'email-editor':
      // Instead of dynamic imports, render an inline editor
      renderedContainer = renderEmailEditor(state);
      break;
    case 'followup-editor':
      // Render inline followup editor
      renderedContainer = renderFollowupEditor(state);
      break;
    case 'campaign-detail':
      // Render inline campaign detail view
      renderedContainer = renderCampaignDetail(state);
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

// Render email editor component inline
function renderEmailEditor(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-email-editor';
  
  // Load email editor CSS
  loadCSS('content/components/email-editor/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Edit Email</span>
    </div>
    <button id="bubo-email-editor-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Email form
  const emailForm = document.createElement('div');
  emailForm.className = 'bubo-email-form';
  
  // Subject line
  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'bubo-subject-container';
  subjectContainer.innerHTML = `
    <label for="bubo-subject" class="bubo-label">Subject Line</label>
    <input type="text" id="bubo-subject" class="bubo-input" value="${state.currentEmail?.subject || ''}" placeholder="Enter email subject...">
  `;
  
  // Formatting toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'bubo-toolbar';
  toolbar.innerHTML = `
    <button class="bubo-toolbar-btn" data-format="bold"><strong>B</strong></button>
    <button class="bubo-toolbar-btn" data-format="italic"><em>I</em></button>
    <button class="bubo-toolbar-btn" data-format="underline"><u>U</u></button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="insertUnorderedList">• List</button>
    <button class="bubo-toolbar-btn" data-format="insertOrderedList">1. List</button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="createLink">Link</button>
    <span class="bubo-toolbar-divider"></span>
    <select id="bubo-personalization" class="bubo-select">
      <option value="">Insert personalization...</option>
      <option value="{{firstName}}">First Name</option>
      <option value="{{company}}">Company</option>
      <option value="{{title}}">Job Title</option>
    </select>
  `;
  
  // Email body
  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'bubo-body-container';
  bodyContainer.innerHTML = `
    <label for="bubo-body" class="bubo-label">Email Body</label>
    <div id="bubo-body" class="bubo-editor" contenteditable="true">${state.currentEmail?.body || ''}</div>
  `;
  
  // Template management
  const templateContainer = document.createElement('div');
  templateContainer.className = 'bubo-template-container';
  templateContainer.innerHTML = `
    <div class="bubo-template-controls">
      <select id="bubo-templates" class="bubo-select">
        <option value="">Load template...</option>
        <option value="template1">Introduction Email</option>
        <option value="template2">Follow-up Template</option>
        <option value="template3">Meeting Request</option>
      </select>
      <button id="bubo-save-template" class="bubo-btn bubo-btn-secondary">Save as Template</button>
    </div>
  `;
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'bubo-actions';
  actions.innerHTML = `
    <button id="bubo-email-cancel" class="bubo-btn bubo-btn-secondary">Cancel</button>
    <button id="bubo-email-save" class="bubo-btn bubo-btn-accent">Save Changes</button>
  `;
  
  // Assemble the email editor
  emailForm.appendChild(subjectContainer);
  emailForm.appendChild(toolbar);
  emailForm.appendChild(bodyContainer);
  emailForm.appendChild(templateContainer);
  emailForm.appendChild(actions);
  
  content.appendChild(emailForm);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    attachEmailEditorBehaviors(container, state);
  }, 0);
  
  return container;
}

// Email editor behaviors
function attachEmailEditorBehaviors(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-email-editor-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Return to previous screen, typically email-creation
      if (state.previousScreen) {
        componentData.goToScreen(state.previousScreen);
      } else {
        componentData.goToScreen('emails');
      }
    });
  }
  
  // Cancel button
  const cancelBtn = container.querySelector('#bubo-email-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Prompt user if there are unsaved changes
      const confirmed = confirm('Discard changes to this email?');
      if (confirmed) {
        // Return to previous screen without saving
        if (state.previousScreen) {
          componentData.goToScreen(state.previousScreen);
        } else {
          componentData.goToScreen('emails');
        }
      }
    });
  }
  
  // Save button
  const saveBtn = container.querySelector('#bubo-email-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // Save updated email content to state
      if (state.currentEmail) {
        const updatedEmail = {
          ...state.currentEmail,
          subject,
          body
        };
        
        // Update the email in the emails array
        const updatedEmails = state.emails.map(email => {
          if (email.id === updatedEmail.id) {
            return updatedEmail;
          }
          return email;
        });
        
        componentData.setState({
          emails: updatedEmails,
          currentEmail: null
        });
      }
      
      // Return to previous screen
      if (state.previousScreen) {
        componentData.goToScreen(state.previousScreen);
      } else {
        componentData.goToScreen('emails');
      }
    });
  }
  
  // Format buttons
  const formatBtns = container.querySelectorAll('.bubo-toolbar-btn');
  if (formatBtns.length) {
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.getAttribute('data-format');
        
        if (format === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
        } else {
          document.execCommand(format, false, null);
        }
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      });
    });
  }
  
  // Personalization dropdown
  const personalizationSelect = container.querySelector('#bubo-personalization');
  if (personalizationSelect) {
    personalizationSelect.addEventListener('change', () => {
      const token = personalizationSelect.value;
      if (token) {
        document.execCommand('insertText', false, token);
        personalizationSelect.value = '';
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      }
    });
  }
  
  // Template loading
  const templateSelect = container.querySelector('#bubo-templates');
  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      const templateId = templateSelect.value;
      if (templateId) {
        // In a real implementation, we would load template content from storage
        // For now, we'll use hardcoded examples
        const templates = {
          template1: {
            subject: 'Introduction: {{firstName}} from {{company}}',
            body: 'Hi {{firstName}},<br><br>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.<br><br>Would you be open to a quick call to discuss how we might be able to help {{company}}?<br><br>Best regards,<br>[Your Name]'
          },
          template2: {
            subject: 'Following up: {{company}} opportunity',
            body: 'Hi {{firstName}},<br><br>I wanted to follow up on my previous email about helping {{company}} with outreach and lead generation. I understand you might be busy, so I thought I would check in again.<br><br>Would you have 15 minutes for a quick call this week?<br><br>Best regards,<br>[Your Name]'
          },
          template3: {
            subject: 'Meeting request: {{firstName}} + [Your Name]',
            body: 'Hi {{firstName}},<br><br>I would like to schedule a meeting to discuss how we can help {{company}} improve your outreach strategy. Would any of the following times work for you?<br><br>- Tuesday at 10:00 AM<br>- Wednesday at 2:00 PM<br>- Thursday at 11:00 AM<br><br>Looking forward to speaking with you.<br><br>Best regards,<br>[Your Name]'
          }
        };
        
        const template = templates[templateId];
        if (template) {
          container.querySelector('#bubo-subject').value = template.subject;
          container.querySelector('#bubo-body').innerHTML = template.body;
        }
        
        // Reset select
        templateSelect.value = '';
      }
    });
  }
  
  // Save as template button
  const saveTemplateBtn = container.querySelector('#bubo-save-template');
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener('click', () => {
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // In a real implementation, we would save to storage
      // For prototype, just show confirmation
      if (subject && body) {
        const templateName = prompt('Enter a name for this template:');
        if (templateName) {
          // Simulate saving the template
          alert(`Template "${templateName}" saved successfully.`);
        }
      } else {
        alert('Please add content before saving as template.');
      }
    });
  }
}

// Render followup editor component inline
function renderFollowupEditor(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-followup-editor';
  
  // Load followup editor CSS
  loadCSS('content/components/followup-editor/style.css');
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Edit Follow-up</span>
    </div>
    <button id="bubo-followup-editor-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Follow-up form
  const followupForm = document.createElement('div');
  followupForm.className = 'bubo-followup-form';
  
  // Timing settings
  const timingContainer = document.createElement('div');
  timingContainer.className = 'bubo-timing-container';
  timingContainer.innerHTML = `
    <h3 class="bubo-subtitle">Timing</h3>
    <div class="bubo-timing-controls">
      <div class="bubo-timing-group">
        <label for="bubo-days" class="bubo-label">Days After Previous Email</label>
        <input type="number" id="bubo-days" class="bubo-input" min="1" max="30" value="${state.currentFollowup?.days || 3}" />
      </div>
      <div class="bubo-timing-group">
        <label for="bubo-time" class="bubo-label">Time</label>
        <select id="bubo-time" class="bubo-select">
          <option value="morning" ${state.currentFollowup?.time === 'morning' ? 'selected' : ''}>Morning (9 AM)</option>
          <option value="midday" ${state.currentFollowup?.time === 'midday' ? 'selected' : ''}>Midday (12 PM)</option>
          <option value="afternoon" ${state.currentFollowup?.time === 'afternoon' ? 'selected' : ''}>Afternoon (3 PM)</option>
        </select>
      </div>
    </div>
  `;
  
  // Conditions
  const conditionsContainer = document.createElement('div');
  conditionsContainer.className = 'bubo-conditions-container';
  conditionsContainer.innerHTML = `
    <h3 class="bubo-subtitle">Conditions</h3>
    <div class="bubo-condition-options">
      <div class="bubo-checkbox-group">
        <input type="checkbox" id="bubo-condition-replied" class="bubo-checkbox" ${state.currentFollowup?.stopIfReplied ? 'checked' : ''} />
        <label for="bubo-condition-replied" class="bubo-checkbox-label">Stop sequence if recipient replied</label>
      </div>
      <div class="bubo-checkbox-group">
        <input type="checkbox" id="bubo-condition-opened" class="bubo-checkbox" ${state.currentFollowup?.stopIfOpened ? 'checked' : ''} />
        <label for="bubo-condition-opened" class="bubo-checkbox-label">Stop sequence if recipient opened the email</label>
      </div>
    </div>
  `;
  
  // Email subject
  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'bubo-subject-container';
  subjectContainer.innerHTML = `
    <h3 class="bubo-subtitle">Email Content</h3>
    <label for="bubo-subject" class="bubo-label">Subject Line</label>
    <input type="text" id="bubo-subject" class="bubo-input" value="${state.currentFollowup?.subject || ''}" placeholder="Enter follow-up subject...">
  `;
  
  // Formatting toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'bubo-toolbar';
  toolbar.innerHTML = `
    <button class="bubo-toolbar-btn" data-format="bold"><strong>B</strong></button>
    <button class="bubo-toolbar-btn" data-format="italic"><em>I</em></button>
    <button class="bubo-toolbar-btn" data-format="underline"><u>U</u></button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="insertUnorderedList">• List</button>
    <button class="bubo-toolbar-btn" data-format="insertOrderedList">1. List</button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="createLink">Link</button>
    <span class="bubo-toolbar-divider"></span>
    <select id="bubo-personalization" class="bubo-select">
      <option value="">Insert personalization...</option>
      <option value="{{firstName}}">First Name</option>
      <option value="{{company}}">Company</option>
      <option value="{{title}}">Job Title</option>
    </select>
  `;
  
  // Email body
  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'bubo-body-container';
  bodyContainer.innerHTML = `
    <label for="bubo-body" class="bubo-label">Email Body</label>
    <div id="bubo-body" class="bubo-editor" contenteditable="true">${state.currentFollowup?.body || ''}</div>
  `;
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'bubo-actions';
  actions.innerHTML = `
    <button id="bubo-followup-cancel" class="bubo-btn bubo-btn-secondary">Cancel</button>
    <button id="bubo-followup-save" class="bubo-btn bubo-btn-accent">Save Changes</button>
  `;
  
  // Assemble the followup editor
  followupForm.appendChild(timingContainer);
  followupForm.appendChild(conditionsContainer);
  followupForm.appendChild(subjectContainer);
  followupForm.appendChild(toolbar);
  followupForm.appendChild(bodyContainer);
  followupForm.appendChild(actions);
  
  content.appendChild(followupForm);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    attachFollowupEditorBehaviors(container, state);
  }, 0);
  
  return container;
}

// Followup editor behaviors
function attachFollowupEditorBehaviors(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-followup-editor-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Return to previous screen, typically followup-setup
      if (state.previousScreen) {
        componentData.goToScreen(state.previousScreen);
      } else {
        componentData.goToScreen('followups');
      }
    });
  }
  
  // Cancel button
  const cancelBtn = container.querySelector('#bubo-followup-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Prompt user if there are unsaved changes
      const confirmed = confirm('Discard changes to this follow-up?');
      if (confirmed) {
        // Return to previous screen without saving
        if (state.previousScreen) {
          componentData.goToScreen(state.previousScreen);
        } else {
          componentData.goToScreen('followups');
        }
      }
    });
  }
  
  // Save button
  const saveBtn = container.querySelector('#bubo-followup-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const days = parseInt(container.querySelector('#bubo-days').value, 10);
      const time = container.querySelector('#bubo-time').value;
      const stopIfReplied = container.querySelector('#bubo-condition-replied').checked;
      const stopIfOpened = container.querySelector('#bubo-condition-opened').checked;
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // Validate inputs
      if (!days || days < 1) {
        alert('Please enter a valid number of days (minimum 1)');
        return;
      }
      
      if (!subject) {
        alert('Please enter a subject line');
        return;
      }
      
      if (!body) {
        alert('Please enter email content');
        return;
      }
      
      // Save updated followup content to state
      if (state.currentFollowup) {
        const updatedFollowup = {
          ...state.currentFollowup,
          days,
          time,
          stopIfReplied,
          stopIfOpened,
          subject,
          body
        };
        
        // Update the followup in the followups array
        const updatedFollowups = state.followups.map(followup => {
          if (followup.id === updatedFollowup.id) {
            return updatedFollowup;
          }
          return followup;
        });
        
        componentData.setState({
          followups: updatedFollowups,
          currentFollowup: null
        });
      }
      
      // Return to previous screen
      if (state.previousScreen) {
        componentData.goToScreen(state.previousScreen);
      } else {
        componentData.goToScreen('followups');
      }
    });
  }
  
  // Format buttons
  const formatBtns = container.querySelectorAll('.bubo-toolbar-btn');
  if (formatBtns.length) {
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.getAttribute('data-format');
        
        if (format === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
        } else {
          document.execCommand(format, false, null);
        }
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      });
    });
  }
  
  // Personalization dropdown
  const personalizationSelect = container.querySelector('#bubo-personalization');
  if (personalizationSelect) {
    personalizationSelect.addEventListener('change', () => {
      const token = personalizationSelect.value;
      if (token) {
        document.execCommand('insertText', false, token);
        personalizationSelect.value = '';
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      }
    });
  }
  
  // Days input validation
  const daysInput = container.querySelector('#bubo-days');
  if (daysInput) {
    daysInput.addEventListener('input', () => {
      const value = parseInt(daysInput.value, 10);
      if (value < 1) {
        daysInput.value = 1;
      } else if (value > 30) {
        daysInput.value = 30;
      }
    });
  }
}

// Render campaign detail component inline
function renderCampaignDetail(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-campaign-detail';
  
  // Load campaign detail CSS
  loadCSS('content/components/campaign-detail/style.css');
  
  // Get current campaign
  const campaign = state.currentCampaign || {};
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Campaign Details</span>
      <span class="bubo-campaign-name">${campaign.name || 'Unnamed Campaign'}</span>
    </div>
    <button id="bubo-campaign-detail-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Simple campaign overview for demo
  content.innerHTML = `
    <div class="bubo-campaign-header">
      <h2 class="bubo-campaign-title">${campaign.name || 'Campaign Details'}</h2>
      <div class="bubo-campaign-status bubo-status-${campaign.status || 'active'}">
        ${campaign.status || 'Active'}
      </div>
    </div>
    
    <div class="bubo-metrics-grid">
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.delivered || campaign.contacts || 0}</span>
        <span class="bubo-metric-label">Delivered</span>
      </div>
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.opened || campaign.opens || 0}</span>
        <span class="bubo-metric-label">Opened</span>
      </div>
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.replied || campaign.replies || 0}</span>
        <span class="bubo-metric-label">Replied</span>
      </div>
    </div>
    
    <div class="bubo-campaign-dates">
      <div class="bubo-date-item">
        <span class="bubo-date-label">Created:</span>
        <span class="bubo-date-value">${campaign.created || campaign.date || new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    <div class="bubo-campaign-actions">
      <button id="bubo-pause-campaign" class="bubo-btn bubo-btn-secondary">
        ${campaign.status === 'paused' ? 'Resume Campaign' : 'Pause Campaign'}
      </button>
      <button id="bubo-back-dashboard" class="bubo-btn bubo-btn-primary">Back to Dashboard</button>
    </div>
  `;
  
  // Assemble container
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    attachCampaignDetailBehaviors(container, state);
  }, 0);
  
  return container;
}

// Campaign detail behaviors
function attachCampaignDetailBehaviors(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-campaign-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      componentData.setState({ currentCampaign: null });
      componentData.goToScreen('dashboard');
    });
  }
  
  // Back to dashboard button
  const backBtn = container.querySelector('#bubo-back-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      componentData.setState({ currentCampaign: null });
      componentData.goToScreen('dashboard');
    });
  }
  
  // Pause/Resume campaign button
  const pauseBtn = container.querySelector('#bubo-pause-campaign');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      const campaign = state.currentCampaign;
      if (!campaign) return;
      
      // Toggle status
      const newStatus = campaign.status === 'paused' ? 'active' : 'paused';
      const statusMessage = newStatus === 'paused' ? 'Campaign paused' : 'Campaign resumed';
      
      // Add status change to activity
      const updatedActivity = [
        {
          type: 'status',
          message: statusMessage,
          timestamp: new Date().toLocaleString()
        },
        ...(campaign.activity || [])
      ];
      
      // Update the campaign
      const updatedCampaign = {
        ...campaign,
        status: newStatus,
        activity: updatedActivity
      };
      
      // Update campaigns array
      const updatedCampaigns = state.activeCampaigns.map(c => {
        if (c.id === campaign.id) {
          return updatedCampaign;
        }
        return c;
      });
      
      // Update state
      componentData.setState({
        activeCampaigns: updatedCampaigns,
        currentCampaign: updatedCampaign
      });
      
      // Refresh UI
      componentData.goToScreen('campaign-detail');
    });
  }
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

// Add test message listener for development
window.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'BUBO_TEST') {
      console.log('Received test message:', event.data);
      
      // Create bubo container if it doesn't exist
      if (!buboContainer) {
        buboContainer = document.createElement('div');
        buboContainer.id = 'bubo-container';
        document.body.appendChild(buboContainer);
      }
      
      // Set test data
      if (event.data.data) {
        componentData.setState(event.data.data);
      }
      
      // Go to specified screen
      if (event.data.screen) {
        componentData.goToScreen(event.data.screen);
      }
      
      // Ensure container is visible
      buboContainer.style.display = 'block';
      
      // Position container (if there's a compose window)
      const composeWindow = document.querySelector('div.nH.Hd[role="dialog"]');
      if (composeWindow) {
        positionNextToGmailCompose(buboContainer, composeWindow);
      } else {
        // If no compose window, center on screen
        buboContainer.style.position = 'fixed';
        buboContainer.style.top = '50%';
        buboContainer.style.left = '50%';
        buboContainer.style.transform = 'translate(-50%, -50%)';
      }
      
      // Send response back
      window.postMessage({
        type: 'BUBO_RESPONSE',
        success: true,
        screen: event.data.screen
      }, '*');
    }
  } catch (error) {
    console.error('Error handling test message:', error);
    window.postMessage({
      type: 'BUBO_RESPONSE',
      success: false,
      error: error.message
    }, '*');
  }
});