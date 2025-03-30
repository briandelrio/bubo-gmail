// Email Creation component behaviors

window.EmailCreationBehaviors = {};

window.EmailCreationBehaviors.attachEventListeners = function(container) {
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
    
    // Tone selector tabs
    const toneTabs = container.querySelectorAll('.bubo-tab[data-tone]');
    toneTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove selected class from all tabs
        toneTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
        toneTabs.forEach(t => t.classList.add('bubo-tab-default'));
        
        // Add selected class to clicked tab
        tab.classList.add('bubo-tab-selected');
        tab.classList.remove('bubo-tab-default');
        
        // Alert for future functionality
        const tone = tab.dataset.tone;
        if (tone !== 'professional') {
          alert(`The "${tone}" tone will be available in a future version.`);
          
          // Reset to professional tab
          toneTabs.forEach(t => t.classList.remove('bubo-tab-selected'));
          toneTabs.forEach(t => t.classList.add('bubo-tab-default'));
          toneTabs[0].classList.add('bubo-tab-selected');
          toneTabs[0].classList.remove('bubo-tab-default');
        }
      });
    });
    
    // Edit button
    const editBtn = container.querySelector('#edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        alert('Email editing will be available in a future version');
      });
    }
    
    // Skip button
    const skipBtn = container.querySelector('#skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        alert('Skipping to next email will be available in a future version');
      });
    }
    
    // Accept button
    const acceptBtn = container.querySelector('#accept-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        alert('Email accepted');
      });
    }
    
    // Previous email button
    const prevEmailBtn = container.querySelector('#prev-email');
    if (prevEmailBtn) {
      prevEmailBtn.addEventListener('click', () => {
        alert('Navigation between emails will be available in a future version');
      });
    }
    
    // Next email button
    const nextEmailBtn = container.querySelector('#next-email');
    if (nextEmailBtn) {
      nextEmailBtn.addEventListener('click', () => {
        alert('Navigation between emails will be available in a future version');
      });
    }
    
    // Accept all drafts
    const acceptAllBtn = container.querySelector('#accept-all-btn');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        window.BuboState.goToScreen('followups');
      });
    }
  }, 0);
};

// Auto-attach event listeners after rendering
window.EmailCreationStructure.render = (function(originalRender) {
  return function(state) {
    const container = originalRender(state);
    window.EmailCreationBehaviors.attachEventListeners(container);
    return container;
  };
})(window.EmailCreationStructure.render);