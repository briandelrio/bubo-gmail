// UI Injection for Bubo extension
(function() {
  // Global variables for tracking
  let buboToggleButton = null;
  let buboContainer = null;
  let observerInitialized = false;
  
  // Create and inject the toggle button next to Gmail's compose button
  function injectToggleButton() {
    // Don't inject if already exists
    if (buboToggleButton && document.contains(buboToggleButton)) return;
    
    // Find the compose button container
    const composeContainer = document.querySelector('div.aic');
    if (!composeContainer) {
      console.error('Could not find Gmail compose button container');
      return;
    }
    
    // Create toggle button container (match Gmail's structure)
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'z0';
    toggleContainer.style.marginLeft = '8px';
    
    // Create the actual button
    buboToggleButton = document.createElement('div');
    buboToggleButton.className = 'T-I T-I-KE L3';
    buboToggleButton.style.backgroundColor = '#8E5ADF';
    buboToggleButton.style.color = 'white';
    buboToggleButton.setAttribute('role', 'button');
    buboToggleButton.setAttribute('tabindex', '0');
    buboToggleButton.setAttribute('jslog', 'bubo:compose');
    buboToggleButton.setAttribute('aria-label', 'Open Bubo');
    buboToggleButton.style.userSelect = 'none';
    buboToggleButton.innerText = 'Bubo';
    
    // Add click handler to open Bubo interface
    buboToggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      createBuboContainer();
    });
    
    // Assemble and inject
    toggleContainer.appendChild(buboToggleButton);
    composeContainer.appendChild(toggleContainer);
    
    console.log('Bubo toggle button injected next to Gmail compose button');
  }
  
  // Create the Bubo container that replaces Gmail's compose window
  function createBuboContainer() {
    if (buboContainer && document.contains(buboContainer)) {
      // Container already exists, just show it
      buboContainer.style.display = 'block';
      return;
    }
    
    // Create container that mimics Gmail's compose window
    buboContainer = document.createElement('div');
    buboContainer.id = 'bubo-container';
    buboContainer.className = 'nH nn';
    buboContainer.setAttribute('role', 'dialog');
    buboContainer.style.position = 'fixed';
    buboContainer.style.bottom = '0';
    buboContainer.style.right = '12px';
    buboContainer.style.width = '568px';
    buboContainer.style.height = '655px';
    buboContainer.style.zIndex = '999';
    buboContainer.style.backgroundColor = 'white';
    buboContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    buboContainer.style.borderRadius = '8px 8px 0 0';
    buboContainer.style.overflow = 'hidden';
    
    // Create inner structure to match Gmail's compose window structure
    buboContainer.innerHTML = `
      <div class="nH">
        <div class="nH Hd" role="dialog">
          <div class="nH Hy aXJ">
            <div class="nH">
              <div class="pi" style="height: 3px;">
                <div class="ph p" style="width: 3px;"></div>
                <div class="ph q" style="width: 3px;"></div>
                <div class="l o"></div>
              </div>
              <div class="l m">
                <div class="l n" style="margin-left: 3px;">
                  <div class="k" style="padding: 0px 0px 4px; margin: 0px 3px 0px 0px;">
                    <div class="aCk">
                      <div class="nH Njo3Cf">
                        <table cellpadding="0" class="cf Ht">
                          <tbody>
                            <tr>
                              <td>
                                <div class="Hp">
                                  <h2 class="a3E">
                                    <div class="a3I">Bubo:</div>
                                    <div class="aYF" style="width:476px">
                                      <span id="bubo-title">Email Campaign Manager</span>
                                    </div>
                                  </h2>
                                </div>
                              </td>
                              <td class="Hm">
                                <img id="bubo-minimize" class="Hl" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" alt="Minimize" data-tooltip="Minimize" aria-label="Minimize" data-tooltip-delay="800">
                                <img id="bubo-popup" class="Hq aUG" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" alt="Pop-out" aria-label="Full screen" data-tooltip-delay="800" data-tooltip="Full screen">
                                <img id="bubo-close" class="Ha" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" alt="Close" aria-label="Close" data-tooltip-delay="800" data-tooltip="Close">
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="bubo-content-area" class="bubo-content" style="height: calc(100% - 60px); overflow: auto; padding: 16px; background-color: var(--color-background, #F9F8F7);"></div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(buboContainer);
    
    // Add event listeners for window controls
    document.getElementById('bubo-minimize').addEventListener('click', minimizeBuboContainer);
    document.getElementById('bubo-popup').addEventListener('click', expandBuboContainer);
    document.getElementById('bubo-close').addEventListener('click', closeBuboContainer);
    
    // Initialize UI
    if (window.BuboState) {
      window.BuboState.goToScreen('dashboard');
      renderCurrentScreen();
      window.BuboState.subscribe('main', renderCurrentScreen);
    } else {
      console.error('BuboState not initialized');
      document.getElementById('bubo-content-area').innerHTML = '<div class="bubo-error">Failed to initialize BuboState</div>';
    }
    
    console.log('Bubo container created and displayed');
  }
  
  // Minimize the Bubo container
  function minimizeBuboContainer() {
    if (!buboContainer) return;
    
    buboContainer.style.height = '40px';
    buboContainer.classList.add('minimized');
    
    // Replace minimize button with expand button
    const minimizeBtn = document.getElementById('bubo-minimize');
    if (minimizeBtn) {
      minimizeBtn.style.display = 'none';
    }
    
    // Create or show expand button
    let expandBtn = document.getElementById('bubo-expand');
    if (!expandBtn) {
      expandBtn = document.createElement('img');
      expandBtn.id = 'bubo-expand';
      expandBtn.className = 'Hl';
      expandBtn.src = '//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif';
      expandBtn.alt = 'Expand';
      expandBtn.setAttribute('data-tooltip', 'Expand');
      expandBtn.setAttribute('aria-label', 'Expand');
      expandBtn.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z\' fill=\'%235C5C5B\'/%3E%3C/svg%3E")';
      expandBtn.style.backgroundSize = 'contain';
      expandBtn.style.backgroundPosition = 'center';
      expandBtn.style.backgroundRepeat = 'no-repeat';
      expandBtn.addEventListener('click', restoreBuboContainer);
      
      // Find the container for the minimize button
      const minimizeContainer = minimizeBtn.parentNode;
      if (minimizeContainer) {
        minimizeContainer.insertBefore(expandBtn, minimizeBtn);
      }
    } else {
      expandBtn.style.display = 'inline-block';
    }
    
    // Hide content area
    const contentArea = document.getElementById('bubo-content-area');
    if (contentArea) {
      contentArea.style.display = 'none';
    }
  }
  
  // Restore minimized Bubo container
  function restoreBuboContainer() {
    if (!buboContainer) return;
    
    buboContainer.style.height = '655px';
    buboContainer.classList.remove('minimized');
    
    // Show minimize button
    const minimizeBtn = document.getElementById('bubo-minimize');
    if (minimizeBtn) {
      minimizeBtn.style.display = 'inline-block';
    }
    
    // Hide expand button
    const expandBtn = document.getElementById('bubo-expand');
    if (expandBtn) {
      expandBtn.style.display = 'none';
    }
    
    // Show content area
    const contentArea = document.getElementById('bubo-content-area');
    if (contentArea) {
      contentArea.style.display = 'block';
    }
  }
  
  // Expand Bubo container to full screen
  function expandBuboContainer() {
    if (!buboContainer) return;
    
    if (buboContainer.classList.contains('fullscreen')) {
      // Restore to normal size
      buboContainer.style.top = 'auto';
      buboContainer.style.left = 'auto';
      buboContainer.style.width = '568px';
      buboContainer.style.height = '655px';
      buboContainer.style.bottom = '0';
      buboContainer.style.right = '12px';
      buboContainer.classList.remove('fullscreen');
    } else {
      // Make fullscreen
      buboContainer.style.top = '5%';
      buboContainer.style.left = '5%';
      buboContainer.style.width = '90%';
      buboContainer.style.height = '90%';
      buboContainer.style.bottom = 'auto';
      buboContainer.style.right = 'auto';
      buboContainer.classList.add('fullscreen');
    }
  }
  
  // Close Bubo container
  function closeBuboContainer() {
    if (!buboContainer) return;
    
    buboContainer.style.display = 'none';
  }
  
  // Render the current screen based on BuboState
  function renderCurrentScreen() {
    if (!buboContainer || !window.BuboState) return;
    
    const contentArea = document.getElementById('bubo-content-area');
    if (!contentArea) return;
    
    const state = window.BuboState.getState();
    const currentScreen = state.currentScreen;
    
    // Update title
    const titleElement = document.getElementById('bubo-title');
    if (titleElement) {
      switch (currentScreen) {
        case 'dashboard':
          titleElement.innerText = 'Email Campaign Dashboard';
          break;
        case 'onboarding':
          titleElement.innerText = 'Welcome to Bubo';
          break;
        case 'purpose':
          titleElement.innerText = 'Define Campaign Purpose';
          break;
        case 'companies':
          titleElement.innerText = 'Select Target Companies';
          break;
        case 'contacts':
          titleElement.innerText = 'Discover Contacts';
          break;
        case 'emails':
          titleElement.innerText = 'Create Email Templates';
          break;
        case 'followups':
          titleElement.innerText = 'Set Up Follow-ups';
          break;
        case 'send':
          titleElement.innerText = 'Launch Campaign';
          break;
        case 'complete':
          titleElement.innerText = 'Campaign Created';
          break;
        default:
          titleElement.innerText = 'Bubo Email Campaign Manager';
      }
    }
    
    // Clear content area
    contentArea.innerHTML = '';
    
    // Make sure CSS is loaded for this screen
    if (window.BuboLoadCSS) {
      window.BuboLoadCSS(currentScreen);
    }
    
    let renderedComponent = null;
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
      renderedComponent = structureObj.render(state);
      contentArea.appendChild(renderedComponent);
      
      console.log(`Rendered ${currentScreen} component`);
    } else {
      console.error(`Failed to render ${currentScreen} component`);
      contentArea.innerHTML = `<div class="bubo-error">Screen not found: ${currentScreen}</div>`;
    }
    
    // As a fallback, manually attach event listeners if needed
    if (renderedComponent && window.BuboAttachEvents) {
      window.BuboAttachEvents(currentScreen, renderedComponent);
    }
  }
  
  // Remove Bubo UI elements
  function removeUI() {
    if (buboToggleButton && document.contains(buboToggleButton)) {
      // Find the parent z0 div we created
      const parent = buboToggleButton.parentElement;
      if (parent && parent.className === 'z0') {
        parent.remove();
      } else {
        buboToggleButton.remove();
      }
      buboToggleButton = null;
    }
    
    if (buboContainer && document.contains(buboContainer)) {
      buboContainer.remove();
      buboContainer = null;
    }
  }
  
  // Initialize MutationObserver to detect Gmail interface loading
  function initializeObserver() {
    if (observerInitialized) return;
    
    console.log('Initializing observer');
    
    // Create observer
    const observer = new MutationObserver((mutations) => {
      // Check if compose button container exists
      const composeContainer = document.querySelector('div.aic');
      if (composeContainer && (!buboToggleButton || !document.contains(buboToggleButton))) {
        injectToggleButton();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Set flag
    observerInitialized = true;
    
    // Also check immediately
    injectToggleButton();
    
    // Check periodically as well (backup)
    setInterval(() => {
      if (!buboToggleButton || !document.contains(buboToggleButton)) {
        injectToggleButton();
      }
    }, 2000);
    
    console.log('Observer initialized');
  }
  
  // Export functions
  window.BuboInjection = {
    initializeObserver,
    injectToggleButton,
    createBuboContainer,
    closeBuboContainer,
    minimizeBuboContainer,
    expandBuboContainer,
    removeUI
  };
  
  console.log('BuboInjection initialized');
})();