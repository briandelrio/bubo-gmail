// UI Injection for Bubo extension
(function() {
  // Global variables for tracking
  let activeComposeWindow = null;
  let buboToggleButton = null;
  let buboContainer = null;
  let observerInitialized = false;
  
  // Create and inject the toggle button
  function injectToggleButton(composeWindow) {
    if (!composeWindow) return;
    
    // Create toggle button
    buboToggleButton = document.createElement('button');
    buboToggleButton.className = 'bubo-toggle-btn';
    buboToggleButton.innerText = 'B';
    buboToggleButton.title = 'Open Bubo';
    buboToggleButton.style.position = 'absolute';
    buboToggleButton.style.zIndex = '9999';
    buboToggleButton.style.width = '32px';
    buboToggleButton.style.height = '32px';
    buboToggleButton.style.borderRadius = '50%';
    buboToggleButton.style.backgroundColor = '#8E5ADF';
    buboToggleButton.style.color = 'white';
    buboToggleButton.style.border = 'none';
    buboToggleButton.style.fontWeight = 'bold';
    buboToggleButton.style.cursor = 'pointer';
    buboToggleButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    
    // Append button to body
    document.body.appendChild(buboToggleButton);
    
    // Position button in the top-right corner of compose window
    updateButtonPosition(composeWindow);
    
    // Add click handler to toggle Bubo container
    buboToggleButton.addEventListener('click', () => {
      toggleBuboContainer();
    });
  }
  
  // Update toggle button position
  function updateButtonPosition(composeWindow) {
    if (!composeWindow || !buboToggleButton) return;
    
    const rect = composeWindow.getBoundingClientRect();
    
    buboToggleButton.style.top = `${rect.top + 8}px`;
    buboToggleButton.style.right = `${window.innerWidth - rect.right + 8}px`;
  }
  
  // Create or show Bubo container
  function toggleBuboContainer() {
    if (!buboContainer) {
      // Create container if it doesn't exist
      buboContainer = document.createElement('div');
      buboContainer.id = 'bubo-container';
      document.body.appendChild(buboContainer);
      
      // Initialize UI
      if (window.BuboState) {
        window.BuboState.goToScreen('dashboard');
        renderCurrentScreen();
        
        // Set up listeners for state changes
        window.BuboState.subscribe('main', renderCurrentScreen);
      } else {
        console.error('BuboState not initialized');
        buboContainer.innerHTML = '<div class="bubo-error">Failed to initialize UI</div>';
      }
    } else {
      // Toggle visibility
      if (buboContainer.style.display === 'none') {
        buboContainer.style.display = 'block';
      } else {
        buboContainer.style.display = 'none';
      }
    }
    
    // Position next to compose window
    if (buboContainer.style.display !== 'none' && window.BuboPosition) {
      window.BuboPosition.positionNextToGmailCompose(buboContainer, activeComposeWindow);
      window.BuboPosition.setupPositionListeners(buboContainer, activeComposeWindow);
    }
  }
  
  // Render current screen based on state
  function renderCurrentScreen() {
    if (!buboContainer || !window.BuboState) return;
    
    const state = window.BuboState.getState();
    const currentScreen = state.currentScreen;
    
    // Clear container
    buboContainer.innerHTML = '';
    
    // Make sure CSS is loaded for this screen
    if (window.BuboLoadCSS) {
      window.BuboLoadCSS(currentScreen);
    }
    
    let renderedContainer = null;
    let structureObj = null;
    
    // Render appropriate component
    switch (currentScreen) {
      case 'dashboard':
        structureObj = window.DashboardStructure;
        break;
      case 'onboarding':
        structureObj = window.OnboardingStructure;
        break;
      case 'purpose':
        structureObj = window.PurposeDefinitionStructure;
        break;
      case 'companies':
        structureObj = window.CompanySelectionStructure;
        break;
      case 'contacts':
        structureObj = window.ContactDiscoveryStructure;
        break;
      case 'emails':
        structureObj = window.EmailCreationStructure;
        break;
      case 'followups':
        structureObj = window.FollowupSetupStructure;
        break;
      case 'send':
        structureObj = window.CampaignLaunchStructure;
        break;
      case 'complete':
        structureObj = window.CampaignCompleteStructure;
        break;
    }
    
    if (structureObj && typeof structureObj.render === 'function') {
      renderedContainer = structureObj.render(state);
      buboContainer.appendChild(renderedContainer);
      
      console.log(`Rendered ${currentScreen} component`);
    } else {
      console.error(`Failed to render ${currentScreen} component`);
      buboContainer.innerHTML = `<div class="bubo-error">Screen not found: ${currentScreen}</div>`;
    }
    
    // As a fallback, manually attach event listeners if needed
    if (renderedContainer && window.BuboAttachEvents) {
      window.BuboAttachEvents(currentScreen, renderedContainer);
    }
  }
  
  // Remove Bubo UI elements
  function removeFloatingUI() {
    if (buboToggleButton) {
      buboToggleButton.remove();
      buboToggleButton = null;
    }
    
    if (buboContainer) {
      buboContainer.remove();
      buboContainer = null;
    }
  }
  
  // Check for Gmail compose windows
  function checkForComposeWindows() {
    // Check for Gmail compose windows
    const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"]');
    
    if (composeWindows.length === 0) {
      // No compose windows, remove any existing UI
      removeFloatingUI();
      activeComposeWindow = null;
      return;
    }
    
    // Get the first compose window if there are multiple
    const composeWindow = composeWindows[0];
    
    // If it's the same window we already processed, just update positioning
    if (composeWindow === activeComposeWindow && buboToggleButton) {
      updateButtonPosition(composeWindow);
      return;
    }
    
    // New compose window detected, clean up any existing UI
    removeFloatingUI();
    
    // Set this as the active window and inject UI
    activeComposeWindow = composeWindow;
    injectToggleButton(composeWindow);
  }
  
  // Initialize MutationObserver to detect compose windows
  function initializeObserver() {
    if (observerInitialized) return;
    
    console.log('Initializing observer');
    
    // Create observer
    const observer = new MutationObserver((mutations) => {
      checkForComposeWindows();
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Set flag
    observerInitialized = true;
    
    // Also check immediately
    checkForComposeWindows();
    
    // Check periodically as well (backup)
    setInterval(checkForComposeWindows, 1000);
    
    console.log('Observer initialized');
  }
  
  // Export functions
  window.BuboInjection = {
    initializeObserver,
    checkForComposeWindows,
    removeFloatingUI
  };
  
  console.log('BuboInjection initialized');
})();