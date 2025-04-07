// API Services for Bubo Gmail Extension

/**
 * API Service for handling data operations
 * This service abstracts communication with the backend, API services, and Chrome storage
 */

// Base API endpoints (placeholder)
const API_ENDPOINTS = {
  COMPANIES: '/api/companies',
  CONTACTS: '/api/contacts',
  CAMPAIGNS: '/api/campaigns',
  TEMPLATES: '/api/templates',
  ANALYTICS: '/api/analytics'
};

/**
 * Send a message to the background script
 * @param {Object} message - Message to send
 * @returns {Promise} - Promise that resolves with the response
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Get data from Chrome storage
 * @param {string|Array} keys - Key(s) to get from storage
 * @returns {Promise} - Promise that resolves with the data
 */
function getFromStorage(keys = null) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Save data to Chrome storage
 * @param {Object} data - Data to save
 * @returns {Promise} - Promise that resolves when the data is saved
 */
function saveToStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Company API methods
const CompanyAPI = {
  /**
   * Get list of companies
   * @param {Object} filters - Filters to apply
   * @returns {Promise} - Promise that resolves with companies
   */
  async getCompanies(filters = {}) {
    try {
      // For now, use the background script to get data
      const response = await sendMessage({ 
        type: 'GET_COMPANIES',
        filters 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get companies');
      }
    } catch (error) {
      console.error('Error getting companies:', error);
      
      // Fallback to local state if message fails
      const state = window.BuboState.getState();
      return state.companies;
    }
  },
  
  /**
   * Get company by ID
   * @param {string|number} id - Company ID
   * @returns {Promise} - Promise that resolves with company
   */
  async getCompanyById(id) {
    try {
      const response = await sendMessage({ 
        type: 'GET_COMPANY',
        id 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get company');
      }
    } catch (error) {
      console.error(`Error getting company ${id}:`, error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.companies.find(company => company.id == id);
    }
  }
};

// Contact API methods
const ContactAPI = {
  /**
   * Get list of contacts
   * @param {Object} filters - Filters to apply
   * @returns {Promise} - Promise that resolves with contacts
   */
  async getContacts(filters = {}) {
    try {
      const response = await sendMessage({ 
        type: 'GET_CONTACTS',
        filters 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get contacts');
      }
    } catch (error) {
      console.error('Error getting contacts:', error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.contacts;
    }
  },
  
  /**
   * Get contacts for a company
   * @param {string|number} companyId - Company ID
   * @returns {Promise} - Promise that resolves with contacts
   */
  async getContactsByCompany(companyId) {
    try {
      const response = await sendMessage({ 
        type: 'GET_CONTACTS_BY_COMPANY',
        companyId 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get contacts');
      }
    } catch (error) {
      console.error(`Error getting contacts for company ${companyId}:`, error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.contacts.filter(contact => contact.company_id == companyId);
    }
  }
};

// Campaign API methods
const CampaignAPI = {
  /**
   * Get list of campaigns
   * @param {Object} filters - Filters to apply
   * @returns {Promise} - Promise that resolves with campaigns
   */
  async getCampaigns(filters = {}) {
    try {
      const response = await sendMessage({ 
        type: 'GET_CAMPAIGNS',
        filters 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get campaigns');
      }
    } catch (error) {
      console.error('Error getting campaigns:', error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.activeCampaigns;
    }
  },
  
  /**
   * Get campaign by ID
   * @param {string|number} id - Campaign ID
   * @returns {Promise} - Promise that resolves with campaign
   */
  async getCampaignById(id) {
    try {
      const response = await sendMessage({ 
        type: 'GET_CAMPAIGN',
        id 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get campaign');
      }
    } catch (error) {
      console.error(`Error getting campaign ${id}:`, error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.activeCampaigns.find(campaign => campaign.id == id);
    }
  },
  
  /**
   * Launch a campaign
   * @param {Object} campaign - Campaign data
   * @returns {Promise} - Promise that resolves with the result
   */
  async launchCampaign(campaign) {
    try {
      const response = await sendMessage({
        type: 'LAUNCH_CAMPAIGN',
        campaign
      });
      
      if (response.success) {
        // Update local state
        const state = window.BuboState.getState();
        window.BuboState.setState({
          activeCampaigns: [...state.activeCampaigns, response.campaign]
        });
        
        return response.campaign;
      } else {
        throw new Error(response.error || 'Failed to launch campaign');
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      throw error;
    }
  }
};

// Template API methods
const TemplateAPI = {
  /**
   * Get email templates
   * @returns {Promise} - Promise that resolves with templates
   */
  async getEmailTemplates() {
    try {
      const response = await sendMessage({ 
        type: 'GET_EMAIL_TEMPLATES'
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get email templates');
      }
    } catch (error) {
      console.error('Error getting email templates:', error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.emailTemplates;
    }
  },
  
  /**
   * Get followup templates
   * @returns {Promise} - Promise that resolves with templates
   */
  async getFollowupTemplates() {
    try {
      const response = await sendMessage({ 
        type: 'GET_FOLLOWUP_TEMPLATES'
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get followup templates');
      }
    } catch (error) {
      console.error('Error getting followup templates:', error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      return state.followupTemplates;
    }
  },
  
  /**
   * Save email template
   * @param {Object} template - Template data
   * @returns {Promise} - Promise that resolves with the result
   */
  async saveEmailTemplate(template) {
    try {
      const response = await sendMessage({
        type: 'SAVE_EMAIL_TEMPLATE',
        template
      });
      
      if (response.success) {
        // Update local state
        const state = window.BuboState.getState();
        const updatedTemplates = [...state.emailTemplates];
        const index = updatedTemplates.findIndex(t => t.id === template.id);
        
        if (index !== -1) {
          updatedTemplates[index] = template;
        } else {
          updatedTemplates.push(template);
        }
        
        window.BuboState.setState({
          emailTemplates: updatedTemplates
        });
        
        return response.template;
      } else {
        throw new Error(response.error || 'Failed to save email template');
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      throw error;
    }
  }
};

// Analytics API methods
const AnalyticsAPI = {
  /**
   * Get campaign analytics
   * @param {string|number} campaignId - Campaign ID
   * @returns {Promise} - Promise that resolves with analytics data
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const response = await sendMessage({ 
        type: 'GET_CAMPAIGN_ANALYTICS',
        campaignId 
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get campaign analytics');
      }
    } catch (error) {
      console.error(`Error getting analytics for campaign ${campaignId}:`, error);
      
      // Fallback to local state
      const state = window.BuboState.getState();
      const campaign = state.activeCampaigns.find(c => c.id == campaignId);
      return campaign ? campaign.metrics : null;
    }
  }
};

// Export the API services
export default {
  Company: CompanyAPI,
  Contact: ContactAPI,
  Campaign: CampaignAPI,
  Template: TemplateAPI,
  Analytics: AnalyticsAPI,
  Storage: {
    get: getFromStorage,
    save: saveToStorage
  }
};