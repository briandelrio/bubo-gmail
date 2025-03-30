// Campaign Launch component behaviors

window.CampaignLaunchBehaviors = {};

window.CampaignLaunchBehaviors.attachEventListeners = function(container) {
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
    
    // Test button
    const testBtn = container.querySelector('#test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        alert('Test email sending will be available in a future version');
      });
    }
    
    // Schedule button
    const scheduleBtn = container.querySelector('#schedule-btn');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        alert('Campaign scheduling will be available in a future version');
      });
    }
    
    // Send Now button
    const sendNowBtn = container.querySelector('#send-now-btn');
    if (sendNowBtn) {
      sendNowBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('complete');
      });
    }
    
    // Save as Template button
    const saveTemplateBtn = container.querySelector('#save-template-btn');
    if (saveTemplateBtn) {
      saveTemplateBtn.addEventListener('click', () => {
        alert('Template saving will be available in a future version');
      });
    }
    
    // Save as Draft button
    const saveDraftBtn = container.querySelector('#save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        alert('Draft saving will be available in a future version');
      });
    }
  }, 0);
};

// Auto-attach event listeners after rendering
window.CampaignLaunchStructure.render = (function(originalRender) {
  return function(state) {
    const container = originalRender(state);
    window.CampaignLaunchBehaviors.attachEventListeners(container);
    return container;
  };
})(window.CampaignLaunchStructure.render);