// Company Selection component structure

window.CompanySelectionStructure = {};

window.CompanySelectionStructure.render = function(state) {
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
    <button class="bubo-load-more-btn">Show more companies (7 more)</button>
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
    <span class="bubo-selection-count">${state.selectedCompanies.length} companies selected</span>
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
  
  return container;
};