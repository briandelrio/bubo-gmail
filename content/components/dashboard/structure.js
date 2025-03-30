// Dashboard component structure

window.DashboardStructure = {};

window.DashboardStructure.render = function(state) {
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
  
  // Metrics
  const metrics = document.createElement('div');
  metrics.className = 'bubo-metrics';
  metrics.innerHTML = `
    <h2 class="bubo-title">Dashboard</h2>
    
    <div class="bubo-stat-cards">
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">${state.activeCampaigns.length || 0}</span>
        <span class="bubo-stat-label">Active Campaigns</span>
      </div>
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">-</span>
        <span class="bubo-stat-label">Open Rate</span>
      </div>
      <div class="bubo-stat-card">
        <span class="bubo-stat-value">-</span>
        <span class="bubo-stat-label">Reply Rate</span>
      </div>
    </div>
    
    <button id="bubo-new-campaign" class="bubo-btn bubo-btn-primary bubo-btn-full">Start New Campaign</button>
    <button id="bubo-view-campaigns" class="bubo-btn bubo-btn-secondary bubo-btn-full">View All Campaigns</button>
    
    <div class="bubo-activity">
      <h3 class="bubo-title">Recent Activity</h3>
      ${state.activeCampaigns.length ? '' : '<div class="bubo-empty-state">No recent activity yet. Start your first campaign!</div>'}
    </div>
  `;
  
  // Assemble
  content.appendChild(metrics);
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
};