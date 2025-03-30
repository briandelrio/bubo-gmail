// Onboarding component structure

window.OnboardingStructure = {};

window.OnboardingStructure.render = function(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module';
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Bubo</span>
      <span class="bubo-tagline">Smart Outreach</span>
    </div>
    <button id="bubo-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  content.innerHTML = `
    <h2 class="bubo-title bubo-centered-title">Welcome to Bubo</h2>
    <p class="bubo-subtitle bubo-centered-text">Let's set up your account in 2 simple steps</p>
    
    <!-- Hunter.io connection -->
    <div class="bubo-connection-card">
      <div class="bubo-connection-number ${state.apiStatus.hunterConnected ? 'bubo-connected' : ''}">
        <span>1</span>
      </div>
      <div class="bubo-connection-info">
        <p class="bubo-connection-title">Connect to Hunter.io</p>
        <p class="bubo-connection-desc">To find the right contacts for your outreach</p>
      </div>
      <button id="connect-hunter" class="bubo-connection-btn ${state.apiStatus.hunterConnected ? 'bubo-connected-btn' : ''}">
        ${state.apiStatus.hunterConnected ? 'Connected' : 'Connect'}
      </button>
    </div>
    
    <!-- Gmail connection -->
    <div class="bubo-connection-card">
      <div class="bubo-connection-number ${state.apiStatus.gmailConnected ? 'bubo-connected' : 'bubo-inactive'}">
        <span>2</span>
      </div>
      <div class="bubo-connection-info">
        <p class="bubo-connection-title">Connect Gmail</p>
        <p class="bubo-connection-desc">To send emails and track responses</p>
      </div>
      <button id="connect-gmail" class="bubo-connection-btn ${state.apiStatus.gmailConnected ? 'bubo-connected-btn' : 'bubo-inactive-btn'}">
        ${state.apiStatus.gmailConnected ? 'Connected' : 'Connect'}
      </button>
    </div>
    
    <!-- Skip option -->
    <div class="bubo-skip-container">
      <button id="skip-setup" class="bubo-link">Skip setup and explore Bubo</button>
    </div>
  `;
  
  // Assemble
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
};