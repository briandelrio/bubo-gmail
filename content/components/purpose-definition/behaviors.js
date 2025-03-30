// Purpose Definition component behaviors

window.PurposeDefinitionBehaviors = {};

window.PurposeDefinitionBehaviors.attachEventListeners = function(container) {
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
    
    // Purpose input
    const purposeInput = container.querySelector('#purpose-input');
    if (purposeInput) {
      purposeInput.addEventListener('input', (e) => {
        const purpose = e.target.value;
        window.BuboState.setState({ purpose });
        
        // Enable/disable find companies button
        const findCompaniesBtn = container.querySelector('#find-companies-btn');
        if (findCompaniesBtn) {
          if (purpose.trim()) {
            findCompaniesBtn.classList.remove('bubo-btn-disabled');
          } else {
            findCompaniesBtn.classList.add('bubo-btn-disabled');
          }
        }
      });
    }
    
    // Segment options
    const segmentOptions = container.querySelectorAll('.bubo-segment-option');
    segmentOptions.forEach(option => {
      option.addEventListener('click', () => {
        const segment = option.dataset.segment;
        const state = window.BuboState.getState();
        
        // Toggle selection
        window.BuboState.setState({
          segmentation: {
            ...state.segmentation,
            [segment]: !state.segmentation[segment]
          }
        });
      });
    });
    
    // Find Companies button
    const findCompaniesBtn = container.querySelector('#find-companies-btn');
    if (findCompaniesBtn) {
      findCompaniesBtn.addEventListener('click', () => {
        const state = window.BuboState.getState();
        if (state.purpose.trim()) {
          window.BuboState.goToScreen('companies');
        }
      });
    }
  }, 0);
};

// Add initialization function to run when everything is loaded
window.PurposeDefinitionBehaviors.init = function() {
  // Store the original render function
  const originalRender = window.PurposeDefinitionStructure.render;
  
  // Replace with a new function that attaches behaviors
  window.PurposeDefinitionStructure.render = function(state) {
    const container = originalRender(state);
    window.PurposeDefinitionBehaviors.attachEventListeners(container);
    return container;
  };
};