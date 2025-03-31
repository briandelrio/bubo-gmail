// State management for the Bubo extension
(function() {
  // Main state object
  let state = {
    // Current screen
    currentScreen: 'dashboard',
    previousScreen: null,
    
    // API Status
    apiStatus: {
      hunterConnected: false,
      gmailConnected: false
    },
    
    // User settings
    userSettings: {
      emailSignature: '',
      defaultSendTime: 'morning',
      dailySendLimit: 50,
      trackOpens: true,
      trackClicks: true
    },
    
    // Campaign creation flow
    purpose: '',
    segmentation: {
      size: false,
      employees: false,
      location: false,
      industry: false
    },
    
    // Entities
    companies: [],
    selectedCompanies: [],
    contacts: [],
    selectedContacts: [],
    
    // Email content
    emails: [],
    emailTemplates: [],
    currentEmail: null,
    
    // Follow-ups
    followups: [],
    followupTemplates: [],
    currentFollowup: null,
    
    // Campaigns
    activeCampaigns: [],
    currentCampaign: null,
    
    // UI State
    loading: false,
    error: null
  };
  
  // Sample data for prototype
  function loadSampleData() {
    // Legacy format sample data
    const sampleCompanies = [
      { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: false },
      { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: false },
      { id: 3, name: 'SportHaus', industry: 'Sporting Goods', employees: '100-250', selected: false },
    ];
    
    const sampleContacts = [
      { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', match: 95, selected: false },
      { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', match: 80, selected: false },
      { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', match: 90, selected: false },
    ];
    
    // Initialize with legacy sample data
    state.companies = sampleCompanies;
    state.contacts = sampleContacts;
    
    // Additional sample data for new components
    
    // Sample email
    state.emails = [
      {
        id: 'email-1',
        subject: 'Introduction: Partnership Opportunity',
        body: '<p>Hi {{firstName}},</p><p>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.</p><p>Would you be open to a quick call to discuss how we might be able to help {{company}}?</p><p>Best regards,<br>[Your Name]</p>'
      }
    ];
    
    // Sample followups
    state.followups = [
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
    
    // Sample campaigns with more detailed data
    state.activeCampaigns = [
      {
        id: 'campaign-1',
        name: 'Q1 Outreach - Technology Companies',
        status: 'active',
        purpose: 'Partnership opportunities with tech companies',
        created: '2025-01-15',
        sendFrom: 'default',
        trackOpens: true,
        trackClicks: true,
        dailyLimit: 50,
        metrics: {
          delivered: 24,
          opened: 15,
          replied: 5,
          clicked: 8
        },
        companies: [
          { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: true }
        ],
        contacts: [
          { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', match: 90, selected: true }
        ],
        emails: [state.emails[0]],
        followups: [state.followups[0], state.followups[1]],
        activity: [
          { 
            type: 'sent', 
            message: 'Initial email sent to Jan Becker (j.becker@gymtech.de)', 
            timestamp: '2025-01-15 10:32 AM' 
          },
          { 
            type: 'opened', 
            message: 'Email opened by Jan Becker (j.becker@gymtech.de)', 
            timestamp: '2025-01-15 11:45 AM' 
          },
          { 
            type: 'replied', 
            message: 'Reply received from Jan Becker (j.becker@gymtech.de)', 
            timestamp: '2025-01-16 09:20 AM' 
          }
        ]
      },
      {
        id: 'campaign-2',
        name: 'Fitness Industry Outreach',
        status: 'paused',
        purpose: 'Reaching out to fitness companies',
        created: '2025-02-01',
        sendFrom: 'default',
        trackOpens: true,
        trackClicks: true,
        dailyLimit: 30,
        metrics: {
          delivered: 12,
          opened: 8,
          replied: 2,
          clicked: 4
        },
        companies: [
          { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: true }
        ],
        contacts: [
          { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', match: 95, selected: true },
          { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', match: 80, selected: true }
        ],
        emails: [state.emails[0]],
        followups: [state.followups[0]],
        activity: [
          { 
            type: 'sent', 
            message: 'Initial email sent to Sarah Müller (s.mueller@fitlife-berlin.de)', 
            timestamp: '2025-02-01 09:15 AM' 
          },
          { 
            type: 'opened', 
            message: 'Email opened by Sarah Müller (s.mueller@fitlife-berlin.de)', 
            timestamp: '2025-02-01 10:22 AM' 
          },
          { 
            type: 'status', 
            message: 'Campaign paused by user', 
            timestamp: '2025-02-02 02:30 PM' 
          }
        ]
      }
    ];
    
    // Sample email templates
    state.emailTemplates = [
      {
        id: 'template-1',
        name: 'Introduction Email',
        subject: 'Introduction: {{firstName}} from {{company}}',
        body: '<p>Hi {{firstName}},</p><p>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.</p><p>Would you be open to a quick call to discuss how we might be able to help {{company}}?</p><p>Best regards,<br>[Your Name]</p>'
      },
      {
        id: 'template-2',
        name: 'Product Demo Request',
        subject: 'Product Demo Request for {{company}}',
        body: '<p>Hi {{firstName}},</p><p>I\'m reaching out because I believe our solution could help {{company}} with [specific pain point]. Our platform has helped similar companies improve their [relevant metrics] by up to 30%.</p><p>Would you be interested in a quick 15-minute demo to see if it might be a good fit for your team?</p><p>Best regards,<br>[Your Name]</p>'
      }
    ];
    
    // Sample followup templates
    state.followupTemplates = [
      {
        id: 'followup-template-1',
        name: 'Gentle Reminder',
        subject: 'Following up: {{company}} opportunity',
        body: '<p>Hi {{firstName}},</p><p>I wanted to follow up on my previous email about helping {{company}} with outreach and lead generation. I understand you might be busy, so I thought I would check in again.</p><p>Would you have 15 minutes for a quick call this week?</p><p>Best regards,<br>[Your Name]</p>'
      },
      {
        id: 'followup-template-2',
        name: 'Final Follow-up',
        subject: 'Last follow-up: Partnership Opportunity',
        body: '<p>Hi {{firstName}},</p><p>I\'m reaching out one final time regarding our potential partnership. If you\'re interested in learning how we can help {{company}} improve your outreach strategy, please let me know.</p><p>I respect your time and won\'t follow up further if I don\'t hear back.</p><p>Best regards,<br>[Your Name]</p>'
      }
    ];
  }
  
  // Load sample data for prototype
  loadSampleData();
  
  // Event listeners
  const listeners = {};
  
  // Update state and notify listeners
  const setState = (newState) => {
    state = { ...state, ...newState };
    notifyListeners();
  };
  
  // Get current state
  const getState = () => {
    return { ...state };
  };
  
  // Subscribe to state changes
  const subscribe = (key, callback) => {
    if (!listeners[key]) {
      listeners[key] = [];
    }
    listeners[key].push(callback);
    
    // Return unsubscribe function
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  };
  
  // Notify listeners of state changes
  const notifyListeners = () => {
    Object.keys(listeners).forEach(key => {
      listeners[key].forEach(callback => {
        callback(state);
      });
    });
  };
  
  // Navigate to screen
  const goToScreen = (screen) => {
    setState({ 
      previousScreen: state.currentScreen,
      currentScreen: screen 
    });
  };
  
  // Toggle company selection (legacy support)
  const toggleCompanySelection = (id) => {
    const updatedCompanies = [...state.companies];
    const index = updatedCompanies.findIndex(company => company.id === id);
    if (index !== -1) {
      updatedCompanies[index].selected = !updatedCompanies[index].selected;
      setState({ 
        companies: updatedCompanies,
        selectedCompanies: updatedCompanies.filter(company => company.selected)
      });
    }
  };
  
  // Toggle contact selection (legacy support)
  const toggleContactSelection = (id) => {
    const updatedContacts = [...state.contacts];
    const index = updatedContacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      updatedContacts[index].selected = !updatedContacts[index].selected;
      setState({ 
        contacts: updatedContacts,
        selectedContacts: updatedContacts.filter(contact => contact.selected)
      });
    }
  };
  
  // Clear selection state
  const clearSelectionState = () => {
    setState({
      selectedCompanies: [],
      selectedContacts: [],
      currentEmail: null,
      currentFollowup: null
    });
  };
  
  // Reset campaign creation state
  const resetCampaignCreation = () => {
    setState({
      purpose: '',
      segmentation: {
        size: false,
        employees: false,
        location: false,
        industry: false
      },
      selectedCompanies: [],
      selectedContacts: [],
      currentEmail: null,
      currentFollowup: null
    });
  };
  
  // Select a campaign
  const selectCampaign = (campaignId) => {
    const campaign = state.activeCampaigns.find(c => c.id === campaignId);
    setState({ currentCampaign: campaign });
    goToScreen('campaign-detail');
  };
  
  // Add a new campaign
  const addCampaign = (campaign) => {
    const updatedCampaigns = [...state.activeCampaigns, campaign];
    setState({ 
      activeCampaigns: updatedCampaigns,
      currentCampaign: campaign
    });
  };
  
  // Add a contact to a campaign
  const addContactToCampaign = (campaignId, contact) => {
    const updatedCampaigns = state.activeCampaigns.map(campaign => {
      if (campaign.id === campaignId) {
        // Check if contact already exists in campaign
        const contactExists = campaign.contacts.some(c => c.id === contact.id);
        if (!contactExists) {
          return {
            ...campaign,
            contacts: [...campaign.contacts, contact]
          };
        }
      }
      return campaign;
    });
    
    setState({ activeCampaigns: updatedCampaigns });
  };
  
  // Add a followup to a campaign
  const addFollowupToCampaign = (campaignId, followup) => {
    const updatedCampaigns = state.activeCampaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          followups: [...campaign.followups, followup]
        };
      }
      return campaign;
    });
    
    setState({ activeCampaigns: updatedCampaigns });
    
    if (state.currentCampaign && state.currentCampaign.id === campaignId) {
      setState({
        currentCampaign: {
          ...state.currentCampaign,
          followups: [...state.currentCampaign.followups, followup]
        }
      });
    }
  };
  
  // Public API - includes legacy methods and new ones
  window.BuboState = {
    getState,
    setState,
    subscribe,
    goToScreen,
    toggleCompanySelection,
    toggleContactSelection,
    clearSelectionState,
    resetCampaignCreation,
    selectCampaign,
    addCampaign,
    addContactToCampaign,
    addFollowupToCampaign
  };
  
  console.log('BuboState initialized with enhanced capabilities');
})();

// Add ESM compatibility for newer modules
export default window.BuboState;