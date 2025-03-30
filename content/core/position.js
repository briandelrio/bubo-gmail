// Positioning functions for Bubo UI
(function() {
  // Position UI element next to Gmail compose window
  function positionNextToGmailCompose(element, composeWindow) {
    if (!composeWindow) {
      // Find the first compose window if not provided
      composeWindow = document.querySelector('div.nH.Hd[role="dialog"]');
    }
    
    if (!composeWindow || !element) return;
    
    // Get compose window's position
    const composeRect = composeWindow.getBoundingClientRect();
    
    // Position to the right of the compose window
    element.style.position = 'fixed';
    element.style.top = `${composeRect.top}px`;
    element.style.left = `${composeRect.right + 16}px`; // 16px gap
    element.style.zIndex = '9999';
    
    // Make sure it's on screen
    const elementRect = element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    if (elementRect.right > windowWidth) {
      // Not enough room on right, position on left
      element.style.left = `${composeRect.left - elementRect.width - 16}px`;
    }
  }
  
  // Update position when window resizes or scrolls
  function updateUIPosition(element, composeWindow) {
    if (!element || !composeWindow) return;
    positionNextToGmailCompose(element, composeWindow);
  }
  
  // Listen for window resize and scroll events
  function setupPositionListeners(element, composeWindow) {
    if (!element || !composeWindow) return;
    
    // Update on resize
    window.addEventListener('resize', () => {
      updateUIPosition(element, composeWindow);
    });
    
    // Update on scroll
    window.addEventListener('scroll', () => {
      updateUIPosition(element, composeWindow);
    });
  }
  
  // Public API
  window.BuboPosition = {
    positionNextToGmailCompose,
    updateUIPosition,
    setupPositionListeners
  };
  
  console.log('BuboPosition initialized');
})();