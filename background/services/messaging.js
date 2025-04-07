// Message handling for background script

// Initialize message listeners
export function init() {
  chrome.runtime.onMessage.addListener(handleMessage);
  initializeStorage();
}

// Initialize storage with default data if empty
async function initializeStorage() {
  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result);
      });
    });
    
    // If storage is empty or missing critical data, initialize with defaults
    if (!data || Object.keys(data).length === 0 || !data.initialized) {
      await loadSampleData();
      console.log('Storage initialized with sample data');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Load sample data into storage
async function loadSampleData() {
  // Sample companies
  const companies = [
    { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: false },
    { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: false },
    { id: 3, name: 'SportHaus', industry: 'Sporting Goods', employees: '100-250', selected: false },
  ];
  
  // Sample contacts
  const contacts = [
    { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', company_id: 1, match: 95, selected: false },
    { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', company_id: 1, match: 80, selected: false },
    { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', company_id: 2, match: 90, selected: false },
  ];
  
  // Sample email templates
  const emailTemplates = [
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
  const followupTemplates = [
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
  
  // Sample emails
  const emails = [
    {
      id: 'email-1',
      subject: 'Introduction: Partnership Opportunity',
      body: '<p>Hi {{firstName}},</p><p>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.</p><p>Would you be open to a quick call to discuss how we might be able to help {{company}}?</p><p>Best regards,<br>[Your Name]</p>'
    }
  ];
  
  // Sample followups
  const followups = [
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
  
  // Sample campaigns
  const activeCampaigns = [
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
      companies: [companies[1]],
      contacts: [contacts[2]],
      emails: [emails[0]],
      followups: [followups[0], followups[1]],
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
      companies: [companies[0]],
      contacts: [contacts[0], contacts[1]],
      emails: [emails[0]],
      followups: [followups[0]],
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
  
  // User settings
  const userSettings = {
    emailSignature: '',
    defaultSendTime: 'morning',
    dailySendLimit: 50,
    trackOpens: true,
    trackClicks: true
  };
  
  // API connections
  const apiConnections = {
    gmail: true,
    hunter: false
  };
  
  // Save all data to storage
  await new Promise((resolve) => {
    chrome.storage.local.set({
      companies,
      contacts,
      emailTemplates,
      followupTemplates,
      emails,
      followups,
      activeCampaigns,
      userSettings,
      apiConnections,
      initialized: true
    }, resolve);
  });
}

// Handle messages from content scripts and popup
function handleMessage(message, sender, sendResponse) {
  console.log('Received message:', message);
  
  // Process different message types
  switch (message.type) {
    // State related message types
    case 'GET_STATE':
      handleGetState(sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'UPDATE_STATE':
      handleUpdateState(message.data, sendResponse);
      return true;
    
    // Company related message types
    case 'GET_COMPANIES':
      handleGetCompanies(message.filters, sendResponse);
      return true;
      
    case 'GET_COMPANY':
      handleGetCompany(message.id, sendResponse);
      return true;
    
    // Contact related message types
    case 'GET_CONTACTS':
      handleGetContacts(message.filters, sendResponse);
      return true;
      
    case 'GET_CONTACTS_BY_COMPANY':
      handleGetContactsByCompany(message.companyId, sendResponse);
      return true;
    
    // Campaign related message types
    case 'GET_CAMPAIGNS':
      handleGetCampaigns(message.filters, sendResponse);
      return true;
      
    case 'GET_CAMPAIGN':
      handleGetCampaign(message.id, sendResponse);
      return true;
      
    case 'LAUNCH_CAMPAIGN':
      handleLaunchCampaign(message.campaign, sendResponse);
      return true;
    
    // Template related message types
    case 'GET_EMAIL_TEMPLATES':
      handleGetEmailTemplates(sendResponse);
      return true;
      
    case 'GET_FOLLOWUP_TEMPLATES':
      handleGetFollowupTemplates(sendResponse);
      return true;
      
    case 'SAVE_EMAIL_TEMPLATE':
      handleSaveEmailTemplate(message.template, sendResponse);
      return true;
    
    // Analytics related message types
    case 'GET_CAMPAIGN_ANALYTICS':
      handleGetCampaignAnalytics(message.campaignId, sendResponse);
      return true;
    
    // API integration message types
    case 'CONNECT_API':
      handleConnectApi(message.api, sendResponse);
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

// Get companies with optional filters
function handleGetCompanies(filters, sendResponse) {
  chrome.storage.local.get('companies', (data) => {
    let companies = data.companies || [];
    
    // Apply filters if provided
    if (filters) {
      if (filters.industry) {
        companies = companies.filter(company => 
          company.industry.toLowerCase().includes(filters.industry.toLowerCase())
        );
      }
      
      if (filters.employees) {
        companies = companies.filter(company => 
          company.employees === filters.employees
        );
      }
      
      if (filters.name) {
        companies = companies.filter(company => 
          company.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
    }
    
    sendResponse({ success: true, data: companies });
  });
}

// Get company by ID
function handleGetCompany(id, sendResponse) {
  chrome.storage.local.get('companies', (data) => {
    const companies = data.companies || [];
    const company = companies.find(company => company.id == id);
    
    if (company) {
      sendResponse({ success: true, data: company });
    } else {
      sendResponse({ success: false, error: 'Company not found' });
    }
  });
}

// Get contacts with optional filters
function handleGetContacts(filters, sendResponse) {
  chrome.storage.local.get('contacts', (data) => {
    let contacts = data.contacts || [];
    
    // Apply filters if provided
    if (filters) {
      if (filters.company) {
        contacts = contacts.filter(contact => 
          contact.company.toLowerCase().includes(filters.company.toLowerCase())
        );
      }
      
      if (filters.role) {
        contacts = contacts.filter(contact => 
          contact.role.toLowerCase().includes(filters.role.toLowerCase())
        );
      }
      
      if (filters.name) {
        contacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
    }
    
    sendResponse({ success: true, data: contacts });
  });
}

// Get contacts for a company
function handleGetContactsByCompany(companyId, sendResponse) {
  chrome.storage.local.get('contacts', (data) => {
    const contacts = data.contacts || [];
    const companyContacts = contacts.filter(contact => contact.company_id == companyId);
    
    sendResponse({ success: true, data: companyContacts });
  });
}

// Get campaigns with optional filters
function handleGetCampaigns(filters, sendResponse) {
  chrome.storage.local.get('activeCampaigns', (data) => {
    let campaigns = data.activeCampaigns || [];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        campaigns = campaigns.filter(campaign => 
          campaign.status === filters.status
        );
      }
      
      if (filters.name) {
        campaigns = campaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
    }
    
    sendResponse({ success: true, data: campaigns });
  });
}

// Get campaign by ID
function handleGetCampaign(id, sendResponse) {
  chrome.storage.local.get('activeCampaigns', (data) => {
    const campaigns = data.activeCampaigns || [];
    const campaign = campaigns.find(campaign => campaign.id == id);
    
    if (campaign) {
      sendResponse({ success: true, data: campaign });
    } else {
      sendResponse({ success: false, error: 'Campaign not found' });
    }
  });
}

// Launch a new campaign
function handleLaunchCampaign(campaign, sendResponse) {
  // Simulate API call delay
  setTimeout(() => {
    chrome.storage.local.get('activeCampaigns', (data) => {
      const activeCampaigns = data.activeCampaigns || [];
      
      // Generate unique ID if not provided
      if (!campaign.id) {
        campaign.id = 'campaign-' + Date.now();
      }
      
      // Set default values
      campaign.status = 'active';
      campaign.created = new Date().toLocaleDateString();
      
      // Add activity entry
      if (!campaign.activity) {
        campaign.activity = [];
      }
      
      campaign.activity.unshift({
        type: 'sent',
        message: 'Campaign launched successfully',
        timestamp: new Date().toLocaleString()
      });
      
      // Add campaign to list
      activeCampaigns.push(campaign);
      
      // Save to storage
      chrome.storage.local.set({ activeCampaigns }, () => {
        sendResponse({ success: true, campaign });
      });
    });
  }, 1000);
}

// Get email templates
function handleGetEmailTemplates(sendResponse) {
  chrome.storage.local.get('emailTemplates', (data) => {
    const templates = data.emailTemplates || [];
    sendResponse({ success: true, data: templates });
  });
}

// Get followup templates
function handleGetFollowupTemplates(sendResponse) {
  chrome.storage.local.get('followupTemplates', (data) => {
    const templates = data.followupTemplates || [];
    sendResponse({ success: true, data: templates });
  });
}

// Save email template
function handleSaveEmailTemplate(template, sendResponse) {
  chrome.storage.local.get('emailTemplates', (data) => {
    let templates = data.emailTemplates || [];
    
    // Generate ID if new template
    if (!template.id) {
      template.id = 'template-' + Date.now();
    }
    
    // Check if template exists
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      // Update existing template
      templates[index] = template;
    } else {
      // Add new template
      templates.push(template);
    }
    
    // Save to storage
    chrome.storage.local.set({ emailTemplates: templates }, () => {
      sendResponse({ success: true, template });
    });
  });
}

// Get campaign analytics
function handleGetCampaignAnalytics(campaignId, sendResponse) {
  chrome.storage.local.get('activeCampaigns', (data) => {
    const campaigns = data.activeCampaigns || [];
    const campaign = campaigns.find(c => c.id == campaignId);
    
    if (campaign && campaign.metrics) {
      // Add calculated rates
      const metrics = { ...campaign.metrics };
      
      if (metrics.delivered > 0) {
        metrics.openRate = Math.round((metrics.opened / metrics.delivered) * 100);
        metrics.replyRate = Math.round((metrics.replied / metrics.delivered) * 100);
        metrics.clickRate = Math.round((metrics.clicked / metrics.delivered) * 100);
      }
      
      sendResponse({ success: true, data: metrics });
    } else {
      sendResponse({ success: false, error: 'Campaign or metrics not found' });
    }
  });
}

// Connect to external API
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