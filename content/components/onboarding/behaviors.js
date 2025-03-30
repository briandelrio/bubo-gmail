// Onboarding component behaviors

window.OnboardingBehaviors = {};

window.OnboardingBehaviors.attachEventListeners = function(container) {
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
    
    // Connect Hunter button
    const connectHunterBtn = container.querySelector('#connect-hunter');
    if (connectHunterBtn) {
      connectHunterBtn.addEventListener('click', () => {
        const state = window.BuboState.getState();
        if (!state.apiStatus.hunterConnected) {
          // Simulate API connection
          window.BuboState.setState({
            apiStatus: {
              ...state.apiStatus,
              hunterConnected: true
            }
          });
        }
      });
    }
    
    // Connect Gmail button
    const connectGmailBtn = container.querySelector('#connect-gmail');
    if (connectGmailBtn) {
      connectGmailBtn.addEventListener('click', () => {
        const state = window.BuboState.getState();
        if (state.apiStatus.hunterConnected && !state.apiStatus.gmailConnected) {
          // Simulate API connection
          window.BuboState.setState({
            apiStatus: {
              ...state.apiStatus,
              gmailConnected: true
            }
          });
          
          // Navigate to dashboard after both connections are established
          setTimeout(() => {
            window.BuboState.goToScreen('dashboard');
          }, 500);
        }
      });
    }
    
    // Skip setup button
    const skipSetupBtn = container.querySelector('#skip-setup');
    if (skipSetupBtn) {
      skipSetupBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('purpose');
      });
    }
  }, 0);
};

// Add initialization function to run when everything is loaded
window.OnboardingBehaviors.init = function() {
  // Store the original render function
  const originalRender = window.OnboardingStructure.render;
  
  // Replace with a new function that attaches behaviors
  window.OnboardingStructure.render = function(state) {
    const container = originalRender(state);
    window.OnboardingBehaviors.attachEventListeners(container);
    return container;
  };
};