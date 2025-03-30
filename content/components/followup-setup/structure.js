// Followup Setup component structure

window.FollowupSetupStructure = {};

window.FollowupSetupStructure.render = function(state) {
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
  
  return container;
};