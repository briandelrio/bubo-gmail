// Contact Discovery component structure

window.ContactDiscoveryStructure = {};

window.ContactDiscoveryStructure.render = function(state) {
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
  
  return container;
};