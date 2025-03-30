// Dashboard component behaviors

window.DashboardBehaviors = {};

window.DashboardBehaviors.attachEventListeners = function(container) {
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
    
    // New campaign button
    const newCampaignBtn = container.querySelector('#bubo-new-campaign');
    if (newCampaignBtn) {
      newCampaignBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('purpose');
      });
    }
    
    // View campaigns button
    const viewCampaignsBtn = container.querySelector('#bubo-view-campaigns');
    if (viewCampaignsBtn) {
      viewCampaignsBtn.addEventListener('click', () => {
        // Navigate to campaigns screen (not implemented in this prototype)
        alert('Campaign management screen will be available in the next version');
      });
    }
  }, 0);
};

// Add initialization function to run when everything is loaded
window.DashboardBehaviors.init = function() {
  // Store the original render function
  const originalRender = window.DashboardStructure.render;
  
  // Replace with a new function that attaches behaviors
  window.DashboardStructure.render = function(state) {
    const container = originalRender(state);
    window.DashboardBehaviors.attachEventListeners(container);
    return container;
  };
};