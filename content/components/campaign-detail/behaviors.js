import BuboState from '../../core/state';

export function attachEventListeners(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-campaign-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      BuboState.setState({ currentCampaign: null });
      BuboState.goToScreen('campaigns');
    });
  }
  
  // Tabs functionality
  const tabs = container.querySelectorAll('.bubo-tab');
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Get tab identifier
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => {
          t.classList.remove('bubo-tab-selected');
          t.classList.add('bubo-tab-default');
        });
        tab.classList.remove('bubo-tab-default');
        tab.classList.add('bubo-tab-selected');
        
        // Update active panel
        const panels = container.querySelectorAll('.bubo-tab-panel');
        panels.forEach(panel => {
          panel.classList.remove('bubo-tab-panel-active');
        });
        const activePanel = container.querySelector(`.bubo-tab-panel[data-tab-panel="${tabId}"]`);
        if (activePanel) {
          activePanel.classList.add('bubo-tab-panel-active');
        }
      });
    });
  }
  
  // Campaign status controls
  const pauseBtn = container.querySelector('#bubo-pause-campaign');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to pause this campaign?')) {
        const currentCampaign = { ...state.currentCampaign, status: 'paused' };
        
        // Update campaign in activeCampaigns array
        const updatedCampaigns = state.activeCampaigns.map(campaign => {
          if (campaign.id === currentCampaign.id) {
            return currentCampaign;
          }
          return campaign;
        });
        
        BuboState.setState({
          activeCampaigns: updatedCampaigns,
          currentCampaign
        });
        
        // Reload the component to show updated UI
        BuboState.goToScreen('campaign-detail');
      }
    });
  }
  
  const resumeBtn = container.querySelector('#bubo-resume-campaign');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const currentCampaign = { ...state.currentCampaign, status: 'active' };
      
      // Update campaign in activeCampaigns array
      const updatedCampaigns = state.activeCampaigns.map(campaign => {
        if (campaign.id === currentCampaign.id) {
          return currentCampaign;
        }
        return campaign;
      });
      
      BuboState.setState({
        activeCampaigns: updatedCampaigns,
        currentCampaign
      });
      
      // Reload the component to show updated UI
      BuboState.goToScreen('campaign-detail');
    });
  }
  
  const cancelBtn = container.querySelector('#bubo-cancel-campaign');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this campaign? This action cannot be undone.')) {
        const currentCampaign = { ...state.currentCampaign, status: 'cancelled' };
        
        // Update campaign in activeCampaigns array
        const updatedCampaigns = state.activeCampaigns.map(campaign => {
          if (campaign.id === currentCampaign.id) {
            return currentCampaign;
          }
          return campaign;
        });
        
        BuboState.setState({
          activeCampaigns: updatedCampaigns,
          currentCampaign
        });
        
        // Reload the component to show updated UI
        BuboState.goToScreen('campaign-detail');
      }
    });
  }
  
  // Edit initial email button
  const editEmailBtns = container.querySelectorAll('.bubo-edit-email');
  if (editEmailBtns.length) {
    editEmailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const emailId = btn.getAttribute('data-email-id');
        const email = state.emails.find(e => e.id === emailId) || state.currentCampaign?.emails?.[0];
        
        if (email) {
          BuboState.setState({
            currentEmail: email,
            previousScreen: 'campaign-detail'
          });
          BuboState.goToScreen('email-editor');
        }
      });
    });
  }
  
  // Edit followup buttons
  const editFollowupBtns = container.querySelectorAll('.bubo-edit-followup');
  if (editFollowupBtns.length) {
    editFollowupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const followupId = btn.getAttribute('data-followup-id');
        const followup = state.followups.find(f => f.id === followupId) || 
                        state.currentCampaign?.followups?.find(f => f.id === followupId);
        
        if (followup) {
          BuboState.setState({
            currentFollowup: followup,
            previousScreen: 'campaign-detail'
          });
          BuboState.goToScreen('followup-editor');
        }
      });
    });
  }
  
  // Delete followup buttons
  const deleteFollowupBtns = container.querySelectorAll('.bubo-delete-followup');
  if (deleteFollowupBtns.length) {
    deleteFollowupBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const followupId = btn.getAttribute('data-followup-id');
        
        if (confirm('Are you sure you want to delete this follow-up email?')) {
          // Filter out the deleted followup
          const updatedFollowups = state.currentCampaign.followups.filter(f => f.id !== followupId);
          
          // Update the campaign
          const updatedCampaign = {
            ...state.currentCampaign,
            followups: updatedFollowups
          };
          
          // Update campaigns array
          const updatedCampaigns = state.activeCampaigns.map(campaign => {
            if (campaign.id === updatedCampaign.id) {
              return updatedCampaign;
            }
            return campaign;
          });
          
          BuboState.setState({
            activeCampaigns: updatedCampaigns,
            currentCampaign: updatedCampaign
          });
          
          // Reload the component
          BuboState.goToScreen('campaign-detail');
        }
      });
    });
  }
  
  // Add followup button
  const addFollowupBtn = container.querySelector('#bubo-add-followup');
  if (addFollowupBtn) {
    addFollowupBtn.addEventListener('click', () => {
      // Create a new followup
      const newFollowup = {
        id: `followup-${Date.now()}`,
        days: 3,
        time: 'morning',
        stopIfReplied: true,
        stopIfOpened: false,
        subject: '',
        body: '',
        scheduled: false,
        sent: false
      };
      
      BuboState.setState({
        currentFollowup: newFollowup,
        previousScreen: 'campaign-detail'
      });
      
      BuboState.goToScreen('followup-editor');
    });
  }
  
  // Add contacts button
  const addContactsBtn = container.querySelector('#bubo-add-contacts');
  if (addContactsBtn) {
    addContactsBtn.addEventListener('click', () => {
      BuboState.setState({
        previousScreen: 'campaign-detail'
      });
      BuboState.goToScreen('contacts'); // Goes to contact discovery screen
    });
  }
  
  // Contact search
  const contactSearch = container.querySelector('#bubo-contact-search');
  if (contactSearch) {
    contactSearch.addEventListener('input', () => {
      const searchTerm = contactSearch.value.toLowerCase();
      const contactCards = container.querySelectorAll('.bubo-contact-card');
      
      contactCards.forEach(card => {
        const name = card.querySelector('.bubo-contact-name').textContent.toLowerCase();
        const email = card.querySelector('.bubo-contact-email').textContent.toLowerCase();
        const company = card.querySelector('.bubo-contact-company').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || email.includes(searchTerm) || company.includes(searchTerm)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
  
  // View contact buttons
  const viewContactBtns = container.querySelectorAll('.bubo-view-contact');
  if (viewContactBtns.length) {
    viewContactBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const contactId = btn.getAttribute('data-contact-id');
        const contact = state.currentCampaign?.contacts?.find(c => c.id === contactId);
        
        if (contact) {
          // For demo, just show an alert with contact details
          alert(`Contact Details:\n\nName: ${contact.name}\nEmail: ${contact.email}\nCompany: ${contact.company}\nStatus: ${getContactStatus(contact)}`);
          
          // In a real implementation, you would navigate to a contact detail view
          // BuboState.setState({ currentContact: contact });
          // BuboState.goToScreen('contact-detail');
        }
      });
    });
  }
  
  // Settings tab functionality
  const saveSettingsBtn = container.querySelector('#bubo-save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const name = container.querySelector('#bubo-campaign-name').value;
      const sendFrom = container.querySelector('#bubo-send-from').value;
      const trackOpens = container.querySelector('#bubo-track-opens').checked;
      const trackClicks = container.querySelector('#bubo-track-clicks').checked;
      const dailyLimit = parseInt(container.querySelector('#bubo-daily-limit').value, 10);
      
      // Validate
      if (!name) {
        alert('Please enter a campaign name');
        return;
      }
      
      if (!dailyLimit || dailyLimit < 1) {
        alert('Please enter a valid daily sending limit');
        return;
      }
      
      // Update campaign
      const updatedCampaign = {
        ...state.currentCampaign,
        name,
        sendFrom,
        trackOpens,
        trackClicks,
        dailyLimit
      };
      
      // Update campaigns array
      const updatedCampaigns = state.activeCampaigns.map(campaign => {
        if (campaign.id === updatedCampaign.id) {
          return updatedCampaign;
        }
        return campaign;
      });
      
      BuboState.setState({
        activeCampaigns: updatedCampaigns,
        currentCampaign: updatedCampaign
      });
      
      alert('Campaign settings saved successfully');
    });
  }
  
  // Duplicate campaign button
  const duplicateBtn = container.querySelector('#bubo-duplicate-campaign');
  if (duplicateBtn) {
    duplicateBtn.addEventListener('click', () => {
      if (confirm('Create a duplicate of this campaign?')) {
        // Create a copy with a new ID and name
        const duplicateCampaign = {
          ...state.currentCampaign,
          id: `campaign-${Date.now()}`,
          name: `${state.currentCampaign.name} (Copy)`,
          status: 'draft',
          // Reset metrics for the new campaign
          metrics: {
            delivered: 0,
            opened: 0,
            replied: 0,
            clicked: 0
          },
          activity: []
        };
        
        // Add to campaigns array
        const updatedCampaigns = [...state.activeCampaigns, duplicateCampaign];
        
        BuboState.setState({
          activeCampaigns: updatedCampaigns,
          currentCampaign: duplicateCampaign
        });
        
        // Reload to show the duplicate
        BuboState.goToScreen('campaign-detail');
      }
    });
  }
  
  // Delete campaign button
  const deleteBtn = container.querySelector('#bubo-delete-campaign');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
        // Remove from campaigns array
        const updatedCampaigns = state.activeCampaigns.filter(
          campaign => campaign.id !== state.currentCampaign.id
        );
        
        BuboState.setState({
          activeCampaigns: updatedCampaigns,
          currentCampaign: null
        });
        
        // Go back to campaigns list
        BuboState.goToScreen('campaigns');
      }
    });
  }
}

// Helper function for contact status
function getContactStatus(contact) {
  if (contact.replied) return 'Replied';
  if (contact.bounced) return 'Bounced';
  if (contact.opened) return 'Opened';
  if (contact.sent) return 'Sent';
  return 'Pending';
}