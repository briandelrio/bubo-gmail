// Campaign Complete component structure

window.CampaignCompleteStructure = {};

window.CampaignCompleteStructure.render = function(state) {
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
  content.className = 'bubo-content bubo-complete-content';
  
  content.innerHTML = `
    <div class="bubo-complete-checkmark">✓</div>
    
    <h2 class="bubo-complete-title">Campaign Launched!</h2>
    <p class="bubo-complete-message">Your emails are on their way to recipients.</p>
    
    <p class="bubo-complete-note">You'll be notified when you receive responses.</p>
    
    <button id="view-dashboard-btn" class="bubo-btn bubo-btn-primary bubo-btn-full">
      View Dashboard
    </button>
    
    <button id="start-another-btn" class="bubo-link">
      Start Another Campaign
    </button>
  `;
  
  // Assemble
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
};