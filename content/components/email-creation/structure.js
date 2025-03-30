// Email Creation component structure

window.EmailCreationStructure = {};

window.EmailCreationStructure.render = function(state) {
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
  
  return container;
};