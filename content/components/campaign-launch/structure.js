// Campaign Launch component structure

window.CampaignLaunchStructure = {};

window.CampaignLaunchStructure.render = function(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
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
  
  return container;
};