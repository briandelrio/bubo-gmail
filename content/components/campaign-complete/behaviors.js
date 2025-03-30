// Campaign Complete component behaviors

window.CampaignCompleteBehaviors = {};

window.CampaignCompleteBehaviors.attachEventListeners = function(container) {
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
    
    // View Dashboard button
    const viewDashboardBtn = container.querySelector('#view-dashboard-btn');
    if (viewDashboardBtn) {
      viewDashboardBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('dashboard');
      });
    }
    
    // Start Another Campaign button
    const startAnotherBtn = container.querySelector('#start-another-btn');
    if (startAnotherBtn) {
      startAnotherBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('purpose');
      });
    }
  }, 0);
};

// Auto-attach event listeners after rendering
window.CampaignCompleteStructure.render = (function(originalRender) {
  return function(state) {
    const container = originalRender(state);
    window.CampaignCompleteBehaviors.attachEventListeners(container);
    return container;
  };
})(window.CampaignCompleteStructure.render);