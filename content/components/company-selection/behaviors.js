// Company Selection component behaviors

window.CompanySelectionBehaviors = {};

window.CompanySelectionBehaviors.attachEventListeners = function(container) {
  // Attach event listeners when the component is rendered
  setTimeout(() => {
    // Close button
    const closeBtn = container.querySelector('#bubo-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const buboContainer = document.getElementById('bubo-container');
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
        window.BuboState.toggleCompanySelection(companyId);
      });
    });
    
    // Find Contacts button
    const findContactsBtn = container.querySelector('#find-contacts-btn');
    if (findContactsBtn) {
      findContactsBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('contacts');
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
    
    // Select all button
    const selectAllBtn = container.querySelector('.bubo-selection-all');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const state = window.BuboState.getState();
        const allSelected = state.selectedCompanies.length === state.companies.length;
        
        // Toggle selection for all companies
        state.companies.forEach(company => {
          if (allSelected) {
            // Deselect all
            if (company.selected) {
              window.BuboState.toggleCompanySelection(company.id);
            }
          } else {
            // Select all
            if (!company.selected) {
              window.BuboState.toggleCompanySelection(company.id);
            }
          }
        });
      });
    }
    
    // Filter and Sort buttons (placeholder functionality)
    const actionBtns = container.querySelectorAll('.bubo-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Filtering and sorting will be available in a future version');
      });
    });
  }, 0);
};

// Add initialization function to run when everything is loaded
window.CompanySelectionBehaviors.init = function() {
  // Store the original render function
  const originalRender = window.CompanySelectionStructure.render;
  
  // Replace with a new function that attaches behaviors
  window.CompanySelectionStructure.render = function(state) {
    const container = originalRender(state);
    window.CompanySelectionBehaviors.attachEventListeners(container);
    return container;
  };
};