// Purpose Definition component structure

window.PurposeDefinitionStructure = {};

window.PurposeDefinitionStructure.render = function(state) {
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
    <h2 class="bubo-title">Define your outreach purpose</h2>
    
    <!-- Purpose input -->
    <textarea
      id="purpose-input"
      class="bubo-purpose-input"
      placeholder="I'm looking to sell to German companies in Berlin gym equipment..."
    >${state.purpose}</textarea>
    
    <!-- Segment options -->
    <h2 class="bubo-title bubo-segment-title">Segment by (optional)</h2>
    
    <div class="bubo-segment-options">
      <button class="bubo-segment-option ${state.segmentation.size ? 'bubo-segment-selected' : ''}" data-segment="size">
        <span class="bubo-segment-indicator"></span>
        Size
      </button>
      <button class="bubo-segment-option ${state.segmentation.employees ? 'bubo-segment-selected' : ''}" data-segment="employees">
        <span class="bubo-segment-indicator"></span>
        Employees
      </button>
      <button class="bubo-segment-option ${state.segmentation.location ? 'bubo-segment-selected' : ''}" data-segment="location">
        <span class="bubo-segment-indicator"></span>
        Location
      </button>
      <button class="bubo-segment-option ${state.segmentation.industry ? 'bubo-segment-selected' : ''}" data-segment="industry">
        <span class="bubo-segment-indicator"></span>
        Industry
      </button>
    </div>
    
    <!-- Action button -->
    <button id="find-companies-btn" class="bubo-btn bubo-btn-primary bubo-btn-full ${!state.purpose ? 'bubo-btn-disabled' : ''}">
      Find Companies
    </button>
  `;
  
  // Assemble
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
};