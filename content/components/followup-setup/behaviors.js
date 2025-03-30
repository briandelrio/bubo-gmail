// Followup Setup component behaviors

window.FollowupSetupBehaviors = {};

window.FollowupSetupBehaviors.attachEventListeners = function(container) {
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
    
    // Edit buttons for followups
    const editButtons = container.querySelectorAll('.bubo-timeline-edit');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        alert('Followup editing will be available in a future version');
      });
    });
    
    // Add another followup
    const addFollowupBtn = container.querySelector('.bubo-add-followup');
    if (addFollowupBtn) {
      addFollowupBtn.addEventListener('click', () => {
        alert('Adding additional followups will be available in a future version');
      });
    }
    
    // Back button
    const backBtn = container.querySelector('#back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('emails');
      });
    }
    
    // Schedule Campaign button
    const scheduleBtn = container.querySelector('#schedule-btn');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('send');
      });
    }
  }, 0);
};

// Auto-attach event listeners after rendering
window.FollowupSetupStructure.render = (function(originalRender) {
  return function(state) {
    const container = originalRender(state);
    window.FollowupSetupBehaviors.attachEventListeners(container);
    return container;
  };
})(window.FollowupSetupStructure.render);