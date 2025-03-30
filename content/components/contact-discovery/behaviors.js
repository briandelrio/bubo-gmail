// Contact Discovery component behaviors

window.ContactDiscoveryBehaviors = {};

window.ContactDiscoveryBehaviors.attachEventListeners = function(container) {
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
    
    // Contact checkboxes
    const contactCheckboxes = container.querySelectorAll('.bubo-contact-checkbox');
    contactCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const contactId = parseInt(checkbox.dataset.contactId);
        window.BuboState.toggleContactSelection(contactId);
      });
    });
    
    // Back button
    const backBtn = container.querySelector('#back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('companies');
      });
    }
    
    // Create Emails button
    const createEmailsBtn = container.querySelector('#create-emails-btn');
    if (createEmailsBtn) {
      createEmailsBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('emails');
      });
    }
    
    // Add Manually button
    const addManually = container.querySelector('.bubo-add-manually');
    if (addManually) {
      addManually.addEventListener('click', () => {
        alert('Manual contact entry will be available in a future version');
      });
    }
    
    // Role filter tabs
    const filterTabs = container.querySelectorAll('.bubo-tab[data-filter]');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove selected class from all tabs
        filterTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
        filterTabs.forEach(t => t.classList.add('bubo-tab-default'));
        
        // Add selected class to clicked tab
        tab.classList.add('bubo-tab-selected');
        tab.classList.remove('bubo-tab-default');
        
        // Alert for future functionality
        const filter = tab.dataset.filter;
        if (filter !== 'all') {
          alert(`The "${filter}" filter will be available in a future version.`);
          
          // Reset to all tab
          filterTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
          filterTabs.forEach(t => t.classList.add('bubo-tab-default'));
          filterTabs[0].classList.add('bubo-tab-selected');
          filterTabs[0].classList.remove('bubo-tab-default');
        }
      });
    });
  }, 0);
};

// Add initialization function to run when everything is loaded
window.ContactDiscoveryBehaviors.init = function() {
  // Store the original render function
  const originalRender = window.ContactDiscoveryStructure.render;
  
  // Replace with a new function that attaches behaviors
  window.ContactDiscoveryStructure.render = function(state) {
    const container = originalRender(state);
    window.ContactDiscoveryBehaviors.attachEventListeners(container);
    return container;
  };
};