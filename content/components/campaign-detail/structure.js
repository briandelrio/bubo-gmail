import './style.css';
import * as behaviors from './behaviors';
import BuboState from '../../core/state';

export function render(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-campaign-detail';
  
  // Get current campaign
  const campaign = state.currentCampaign || {};
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Campaign Details</span>
      <span class="bubo-campaign-name">${campaign.name || 'Unnamed Campaign'}</span>
    </div>
    <button id="bubo-campaign-detail-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'bubo-tabs';
  tabs.innerHTML = `
    <button class="bubo-tab bubo-tab-selected" data-tab="overview">Overview</button>
    <button class="bubo-tab bubo-tab-default" data-tab="contacts">Contacts</button>
    <button class="bubo-tab bubo-tab-default" data-tab="emails">Emails</button>
    <button class="bubo-tab bubo-tab-default" data-tab="settings">Settings</button>
  `;
  
  // Tab content container
  const tabContent = document.createElement('div');
  tabContent.className = 'bubo-tab-content';
  
  // Overview tab content (default)
  const overviewContent = document.createElement('div');
  overviewContent.className = 'bubo-tab-panel bubo-tab-panel-active';
  overviewContent.setAttribute('data-tab-panel', 'overview');
  
  // Campaign status
  const statusContainer = document.createElement('div');
  statusContainer.className = 'bubo-status-container';
  statusContainer.innerHTML = `
    <div class="bubo-status-header">
      <h3 class="bubo-subtitle">Campaign Status</h3>
      <span class="bubo-status-badge bubo-status-${campaign.status || 'active'}">${campaign.status || 'Active'}</span>
    </div>
    <div class="bubo-status-controls">
      ${campaign.status === 'paused' ? 
        '<button id="bubo-resume-campaign" class="bubo-btn bubo-btn-accent">Resume Campaign</button>' : 
        '<button id="bubo-pause-campaign" class="bubo-btn bubo-btn-secondary">Pause Campaign</button>'
      }
      <button id="bubo-cancel-campaign" class="bubo-btn bubo-btn-secondary">Cancel Campaign</button>
    </div>
  `;
  
  // Performance metrics
  const metricsContainer = document.createElement('div');
  metricsContainer.className = 'bubo-metrics-container';
  metricsContainer.innerHTML = `
    <h3 class="bubo-subtitle">Performance</h3>
    <div class="bubo-metrics-grid">
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.delivered || 0}</span>
        <span class="bubo-metric-label">Delivered</span>
      </div>
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.opened || 0}</span>
        <span class="bubo-metric-label">Opened</span>
        <span class="bubo-metric-rate">${calculateRate(campaign.metrics?.opened, campaign.metrics?.delivered)}%</span>
      </div>
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.replied || 0}</span>
        <span class="bubo-metric-label">Replied</span>
        <span class="bubo-metric-rate">${calculateRate(campaign.metrics?.replied, campaign.metrics?.delivered)}%</span>
      </div>
      <div class="bubo-metric-card">
        <span class="bubo-metric-value">${campaign.metrics?.clicked || 0}</span>
        <span class="bubo-metric-label">Clicked</span>
        <span class="bubo-metric-rate">${calculateRate(campaign.metrics?.clicked, campaign.metrics?.delivered)}%</span>
      </div>
    </div>
  `;
  
  // Timeline
  const timelineContainer = document.createElement('div');
  timelineContainer.className = 'bubo-timeline-container';
  timelineContainer.innerHTML = `
    <h3 class="bubo-subtitle">Email Sequence</h3>
    <div class="bubo-timeline">
      ${renderTimeline(campaign.emails || [], campaign.followups || [])}
    </div>
  `;
  
  // Recent activity
  const activityContainer = document.createElement('div');
  activityContainer.className = 'bubo-activity-container';
  activityContainer.innerHTML = `
    <h3 class="bubo-subtitle">Recent Activity</h3>
    <div class="bubo-activity-list">
      ${renderActivity(campaign.activity || [])}
    </div>
  `;
  
  // Contacts tab content
  const contactsContent = document.createElement('div');
  contactsContent.className = 'bubo-tab-panel';
  contactsContent.setAttribute('data-tab-panel', 'contacts');
  contactsContent.innerHTML = `
    <div class="bubo-contacts-header">
      <h3 class="bubo-subtitle">Campaign Contacts</h3>
      <div class="bubo-contacts-actions">
        <button id="bubo-add-contacts" class="bubo-btn bubo-btn-secondary">Add Contacts</button>
        <div class="bubo-search-container">
          <input type="text" placeholder="Search contacts..." class="bubo-input bubo-search-input" id="bubo-contact-search">
        </div>
      </div>
    </div>
    <div class="bubo-contacts-list">
      ${renderContacts(campaign.contacts || [])}
    </div>
  `;
  
  // Emails tab content
  const emailsContent = document.createElement('div');
  emailsContent.className = 'bubo-tab-panel';
  emailsContent.setAttribute('data-tab-panel', 'emails');
  emailsContent.innerHTML = `
    <div class="bubo-emails-header">
      <h3 class="bubo-subtitle">Campaign Emails</h3>
    </div>
    <div class="bubo-email-sequence">
      <div class="bubo-email-card bubo-initial-email">
        <div class="bubo-email-header">
          <h4 class="bubo-email-title">Initial Email</h4>
          <div class="bubo-email-actions">
            <button class="bubo-btn-icon bubo-edit-email" data-email-id="${campaign.emails?.[0]?.id || ''}">
              <span class="bubo-icon">✏️</span>
            </button>
          </div>
        </div>
        <div class="bubo-email-preview">
          <p class="bubo-email-subject"><strong>Subject:</strong> ${campaign.emails?.[0]?.subject || 'No subject'}</p>
          <div class="bubo-email-body-preview">${truncateHTML(campaign.emails?.[0]?.body || 'No content', 150)}</div>
        </div>
      </div>
      
      ${renderFollowupEmails(campaign.followups || [])}
      
      <button id="bubo-add-followup" class="bubo-btn bubo-btn-secondary bubo-add-followup-btn">+ Add Follow-up Email</button>
    </div>
  `;
  
  // Settings tab content
  const settingsContent = document.createElement('div');
  settingsContent.className = 'bubo-tab-panel';
  settingsContent.setAttribute('data-tab-panel', 'settings');
  settingsContent.innerHTML = `
    <div class="bubo-settings-group">
      <h3 class="bubo-subtitle">Campaign Settings</h3>
      <div class="bubo-setting-row">
        <label class="bubo-label">Campaign Name</label>
        <div class="bubo-setting-value">
          <input type="text" id="bubo-campaign-name" class="bubo-input" value="${campaign.name || ''}">
        </div>
      </div>
      <div class="bubo-setting-row">
        <label class="bubo-label">Send From</label>
        <div class="bubo-setting-value">
          <select id="bubo-send-from" class="bubo-select">
            <option value="default" ${!campaign.sendFrom || campaign.sendFrom === 'default' ? 'selected' : ''}>Default Gmail Account</option>
            <option value="alias1" ${campaign.sendFrom === 'alias1' ? 'selected' : ''}>Alias 1</option>
            <option value="alias2" ${campaign.sendFrom === 'alias2' ? 'selected' : ''}>Alias 2</option>
          </select>
        </div>
      </div>
      <div class="bubo-setting-row">
        <label class="bubo-label">Tracking</label>
        <div class="bubo-setting-value">
          <div class="bubo-checkbox-group">
            <input type="checkbox" id="bubo-track-opens" class="bubo-checkbox" ${campaign.trackOpens ? 'checked' : ''}>
            <label for="bubo-track-opens" class="bubo-checkbox-label">Track opens</label>
          </div>
          <div class="bubo-checkbox-group">
            <input type="checkbox" id="bubo-track-clicks" class="bubo-checkbox" ${campaign.trackClicks ? 'checked' : ''}>
            <label for="bubo-track-clicks" class="bubo-checkbox-label">Track clicks</label>
          </div>
        </div>
      </div>
      <div class="bubo-setting-row">
        <label class="bubo-label">Daily Sending Limit</label>
        <div class="bubo-setting-value">
          <input type="number" id="bubo-daily-limit" class="bubo-input" value="${campaign.dailyLimit || 50}" min="1" max="500">
        </div>
      </div>
    </div>
    
    <div class="bubo-settings-actions">
      <button id="bubo-save-settings" class="bubo-btn bubo-btn-accent">Save Settings</button>
      <button id="bubo-duplicate-campaign" class="bubo-btn bubo-btn-secondary">Duplicate Campaign</button>
      <button id="bubo-delete-campaign" class="bubo-btn bubo-btn-secondary bubo-btn-danger">Delete Campaign</button>
    </div>
  `;
  
  // Assemble the tabs and content
  overviewContent.appendChild(statusContainer);
  overviewContent.appendChild(metricsContainer);
  overviewContent.appendChild(timelineContainer);
  overviewContent.appendChild(activityContainer);
  
  tabContent.appendChild(overviewContent);
  tabContent.appendChild(contactsContent);
  tabContent.appendChild(emailsContent);
  tabContent.appendChild(settingsContent);
  
  content.appendChild(tabs);
  content.appendChild(tabContent);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    behaviors.attachEventListeners(container, state);
  }, 0);
  
  return container;
}

// Helper functions
function calculateRate(numerator, denominator) {
  if (!numerator || !denominator) return '0';
  return ((numerator / denominator) * 100).toFixed(1);
}

function truncateHTML(html, length) {
  // Create a temporary div to strip HTML tags
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Truncate text
  if (text.length <= length) return html;
  return text.substring(0, length) + '...';
}

function renderTimeline(emails, followups) {
  // Create initial email node
  let timelineHTML = `
    <div class="bubo-timeline-node bubo-timeline-node-sent">
      <div class="bubo-timeline-icon">📧</div>
      <div class="bubo-timeline-content">
        <div class="bubo-timeline-title">Initial Email</div>
        <div class="bubo-timeline-date">Sent on ${emails[0]?.sentDate || 'pending'}</div>
      </div>
    </div>
  `;
  
  // Add followup nodes
  followups.forEach((followup, index) => {
    const status = followup.sent ? 'sent' : (followup.scheduled ? 'scheduled' : 'pending');
    const date = followup.sentDate || followup.scheduledDate || `Day ${followup.days} after initial email`;
    
    timelineHTML += `
      <div class="bubo-timeline-connector"></div>
      <div class="bubo-timeline-node bubo-timeline-node-${status}">
        <div class="bubo-timeline-icon">📧</div>
        <div class="bubo-timeline-content">
          <div class="bubo-timeline-title">Follow-up #${index + 1}</div>
          <div class="bubo-timeline-date">${status === 'sent' ? 'Sent on' : 'Scheduled for'} ${date}</div>
        </div>
      </div>
    `;
  });
  
  return timelineHTML;
}

function renderActivity(activities) {
  if (!activities || activities.length === 0) {
    return '<div class="bubo-empty-state">No recent activity for this campaign</div>';
  }
  
  let activityHTML = '';
  
  activities.forEach(activity => {
    const timestamp = activity.timestamp || new Date().toLocaleString();
    const icon = getActivityIcon(activity.type);
    
    activityHTML += `
      <div class="bubo-activity-item">
        <div class="bubo-activity-icon">${icon}</div>
        <div class="bubo-activity-content">
          <div class="bubo-activity-message">${activity.message}</div>
          <div class="bubo-activity-time">${timestamp}</div>
        </div>
      </div>
    `;
  });
  
  return activityHTML;
}

function getActivityIcon(type) {
  const icons = {
    'sent': '📤',
    'opened': '👁️',
    'clicked': '🔗',
    'replied': '↩️',
    'bounced': '↪️',
    'status': '🔄',
    'error': '⚠️',
    'default': '📝'
  };
  
  return icons[type] || icons.default;
}

function renderContacts(contacts) {
  if (!contacts || contacts.length === 0) {
    return '<div class="bubo-empty-state">No contacts added to this campaign</div>';
  }
  
  let contactsHTML = '';
  
  contacts.forEach(contact => {
    // Determine status icon
    let statusIcon = '⏳'; // Pending by default
    let statusClass = 'bubo-status-pending';
    
    if (contact.replied) {
      statusIcon = '↩️';
      statusClass = 'bubo-status-replied';
    } else if (contact.opened) {
      statusIcon = '👁️';
      statusClass = 'bubo-status-opened';
    } else if (contact.bounced) {
      statusIcon = '↪️';
      statusClass = 'bubo-status-bounced';
    } else if (contact.sent) {
      statusIcon = '📤';
      statusClass = 'bubo-status-sent';
    }
    
    contactsHTML += `
      <div class="bubo-contact-card">
        <div class="bubo-contact-name">${contact.name}</div>
        <div class="bubo-contact-info">
          <div class="bubo-contact-email">${contact.email}</div>
          <div class="bubo-contact-company">${contact.company}</div>
        </div>
        <div class="bubo-contact-status ${statusClass}">
          <span class="bubo-status-icon">${statusIcon}</span>
          <span class="bubo-status-text">${getContactStatus(contact)}</span>
        </div>
        <div class="bubo-contact-actions">
          <button class="bubo-btn-icon bubo-view-contact" data-contact-id="${contact.id}">
            <span class="bubo-icon">👁️</span>
          </button>
        </div>
      </div>
    `;
  });
  
  return contactsHTML;
}

function getContactStatus(contact) {
  if (contact.replied) return 'Replied';
  if (contact.bounced) return 'Bounced';
  if (contact.opened) return 'Opened';
  if (contact.sent) return 'Sent';
  return 'Pending';
}

function renderFollowupEmails(followups) {
  if (!followups || followups.length === 0) {
    return '';
  }
  
  let followupsHTML = '';
  
  followups.forEach((followup, index) => {
    followupsHTML += `
      <div class="bubo-email-connector"></div>
      <div class="bubo-email-card bubo-followup-email">
        <div class="bubo-email-header">
          <h4 class="bubo-email-title">Follow-up #${index + 1}</h4>
          <div class="bubo-email-timing">After ${followup.days} day${followup.days !== 1 ? 's' : ''}</div>
          <div class="bubo-email-actions">
            <button class="bubo-btn-icon bubo-edit-followup" data-followup-id="${followup.id}">
              <span class="bubo-icon">✏️</span>
            </button>
            <button class="bubo-btn-icon bubo-delete-followup" data-followup-id="${followup.id}">
              <span class="bubo-icon">🗑️</span>
            </button>
          </div>
        </div>
        <div class="bubo-email-preview">
          <p class="bubo-email-subject"><strong>Subject:</strong> ${followup.subject || 'No subject'}</p>
          <div class="bubo-email-body-preview">${truncateHTML(followup.body || 'No content', 150)}</div>
        </div>
      </div>
    `;
  });
  
  return followupsHTML;
}