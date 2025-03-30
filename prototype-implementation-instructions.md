Bubo Chrome Extension: Front-End Implementation Guide
Based on your current file structure, I've prepared detailed instructions for implementing our user flow while maintaining your existing architecture. This guide will help your engineering team build out the complete Bubo UI system we've designed.
Overview of Implementation Approach
Your current structure divides components into separate modules, each with structure (HTML), behaviors (JS), and styling (CSS). We'll maintain this pattern while implementing our new user flow.
1. Update File Structure
First, create the following new component folders to accommodate our full user flow:
Copycontent
└── components
    ├── dashboard                  # NEW: Dashboard/home view
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── onboarding                 # NEW: API connection setup
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── purpose-definition         # NEW: Define outreach purpose
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── company-selection          # NEW: Select target companies
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── contact-discovery          # NEW: Find and select contacts
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── email-creation             # NEW: Create/edit email content
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── followup-setup             # MODIFY existing bubo-followups
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── campaign-launch            # NEW: Final send/schedule step
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    ├── campaign-management        # NEW: Campaign list/details
    │   ├── behaviors.js
    │   ├── structure.js
    │   └── style.css
    └── shared                     # NEW: Shared components
        ├── loading.js
        ├── error-state.js
        └── empty-state.js
2. Create Base Styles
Add our design system to content/styles/base.css:
cssCopy/* Base color palette */
:root {
  --color-background: #F9F8F7;    /* seasalt - module background */
  --color-content: #FDFDFD;       /* white - card background */
  --color-border: #E8E7E6;        /* light gray - borders */
  --color-text-primary: #5C5C5B;  /* dark gray - primary text */
  --color-text-secondary: #838382; /* medium gray - secondary text */
  --color-text-tertiary: #A4A3A2; /* light gray - tertiary text */
  --color-accent: #8E5ADF;        /* purple - accent color */
  --color-accent-light: #F6F0FF;  /* light purple - selected states */
  --color-selected-bg: #ECE9F3;   /* light purple - selected tab background */
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --radius-sm: 6px;    /* buttons */
  --radius-md: 10px;   /* cards */
  --radius-lg: 12px;   /* containers */
  --radius-round: 999px; /* pills/chips */
  
  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.04);
}

/* Base styles */
.bubo-module {
  width: 400px;
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text-primary);
}

.bubo-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bubo-content {
  padding: var(--spacing-md);
}

.bubo-card {
  background-color: var(--color-content);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

/* Button styles */
.bubo-btn {
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}

.bubo-btn-primary {
  background-color: var(--color-content);
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
}

.bubo-btn-secondary {
  background-color: var(--color-content);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.bubo-btn-accent {
  background-color: var(--color-content);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

/* Tab styles */
.bubo-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.bubo-tab {
  padding: 4px 12px;
  border-radius: var(--radius-round);
  font-size: 13px;
  cursor: pointer;
}

.bubo-tab-selected {
  background-color: var(--color-selected-bg);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.bubo-tab-default {
  background-color: var(--color-content);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

/* Input styles */
.bubo-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-primary);
}

.bubo-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent-light);
}

/* Text styles */
.bubo-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.bubo-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.bubo-link {
  color: var(--color-accent);
  cursor: pointer;
  font-size: 14px;
}
3. Implement Core State Management
Create a new file content/core/state.js to manage state across components:
javascriptCopy// State management for the Bubo extension
const BuboState = (() => {
  // Main state object
  let state = {
    currentScreen: 'dashboard',
    apiStatus: {
      hunterConnected: false,
      gmailConnected: false
    },
    purpose: '',
    segmentation: {
      size: false,
      employees: false,
      location: false,
      industry: false
    },
    companies: [],
    selectedCompanies: [],
    contacts: [],
    selectedContacts: [],
    emails: [],
    followups: [],
    activeCampaigns: []
  };
  
  // Event listeners
  const listeners = {};
  
  // Update state and notify listeners
  const setState = (newState) => {
    state = { ...state, ...newState };
    notifyListeners();
  };
  
  // Get current state
  const getState = () => {
    return { ...state };
  };
  
  // Subscribe to state changes
  const subscribe = (key, callback) => {
    if (!listeners[key]) {
      listeners[key] = [];
    }
    listeners[key].push(callback);
    
    // Return unsubscribe function
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  };
  
  // Notify listeners of state changes
  const notifyListeners = () => {
    Object.keys(listeners).forEach(key => {
      listeners[key].forEach(callback => {
        callback(state);
      });
    });
  };
  
  // Navigate to screen
  const goToScreen = (screen) => {
    setState({ currentScreen: screen });
  };
  
  // Return public API
  return {
    getState,
    setState,
    subscribe,
    goToScreen
  };
})();

export default BuboState;
4. Update Content Entry Point
Modify content/index.js to handle component switching based on state:
javascriptCopyimport './styles/base.css';
import * as injection from './core/injection';
import * as position from './core/position';
import BuboState from './core/state';

// Import all components
import * as Dashboard from './components/dashboard/structure';
import * as Onboarding from './components/onboarding/structure';
import * as PurposeDefinition from './components/purpose-definition/structure';
import * as CompanySelection from './components/company-selection/structure';
import * as ContactDiscovery from './components/contact-discovery/structure';
import * as EmailCreation from './components/email-creation/structure';
import * as FollowupSetup from './components/followup-setup/structure';
import * as CampaignLaunch from './components/campaign-launch/structure';
import * as CampaignManagement from './components/campaign-management/structure';

// Component mapping
const COMPONENTS = {
  'dashboard': Dashboard,
  'onboarding': Onboarding,
  'purpose': PurposeDefinition,
  'companies': CompanySelection,
  'contacts': ContactDiscovery,
  'emails': EmailCreation,
  'followups': FollowupSetup,
  'send': CampaignLaunch,
  'campaigns': CampaignManagement
};

// Main initialization
function initialize() {
  // Check if this is first use and go to onboarding if needed
  const isFirstUse = localStorage.getItem('bubo-first-use') !== 'false';
  if (isFirstUse) {
    BuboState.goToScreen('onboarding');
    localStorage.setItem('bubo-first-use', 'false');
  }
  
  // Create container for Bubo
  const container = document.createElement('div');
  container.id = 'bubo-container';
  container.style.position = 'fixed';
  container.style.zIndex = '9999';
  container.style.right = '20px';
  container.style.top = '20px';
  document.body.appendChild(container);
  
  // Initial render
  renderCurrentView();
  
  // Subscribe to state changes
  BuboState.subscribe('main', renderCurrentView);
}

// Render the current view based on state
function renderCurrentView() {
  const state = BuboState.getState();
  const currentScreen = state.currentScreen;
  
  // Get component for current screen
  const component = COMPONENTS[currentScreen];
  if (!component) {
    console.error(`No component found for screen: ${currentScreen}`);
    return;
  }
  
  // Render component
  const container = document.getElementById('bubo-container');
  if (container) {
    container.innerHTML = '';
    const componentElement = component.render(state);
    container.appendChild(componentElement);
    
    // Position next to Gmail compose
    position.positionNextToGmailCompose(container);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
5. Implement Component Structure.js Files
Let's implement each component's structure.js file. I'll provide a sample for each to show the pattern, and your engineers can follow this for all components:
Dashboard Structure (components/dashboard/structure.js)
javascriptCopyimport './style.css';
import * as behaviors from './behaviors';
import BuboState from '../../core/state';

export function render(state) {
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
  
  // Attach behaviors
  setTimeout(() => {
    behaviors.attachEventListeners(container, state);
  }, 0);
  
  return container;
}
Dashboard Behaviors (components/dashboard/behaviors.js)
javascriptCopyimport BuboState from '../../core/state';

export function attachEventListeners(container, state) {
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
  
  // New campaign button
  const newCampaignBtn = container.querySelector('#bubo-new-campaign');
  if (newCampaignBtn) {
    newCampaignBtn.addEventListener('click', () => {
      BuboState.goToScreen('purpose');
    });
  }
  
  // View campaigns button
  const viewCampaignsBtn = container.querySelector('#bubo-view-campaigns');
  if (viewCampaignsBtn) {
    viewCampaignsBtn.addEventListener('click', () => {
      BuboState.goToScreen('campaigns');
    });
  }
}
Component CSS Example (components/dashboard/style.css)
cssCopy/* Dashboard specific styles */
.bubo-metrics {
  margin-bottom: var(--spacing-lg);
}

.bubo-stat-cards {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.bubo-stat-card {
  flex: 1;
  background-color: var(--color-content);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bubo-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.bubo-stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.bubo-btn-full {
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.bubo-activity {
  margin-top: var(--spacing-lg);
}

.bubo-empty-state {
  background-color: var(--color-content);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}
6. Component Creation Pattern for All Screens
For all remaining components, follow this same pattern:

structure.js - Contains the HTML structure generated via JavaScript
behaviors.js - Attaches event listeners and handles user interaction
style.css - Component-specific styles that extend the base styles

Each component should:

Import BuboState for state management
Render based on the current state
Attach event listeners that update state
Use consistent class naming conventions

7. Additional Technical Implementation Notes
State Flow Between Components
The user journey moves through these state transitions:
Copydashboard → purpose → companies → contacts → emails → followups → send → complete
Each component's behavior.js file should include functions to transition to the next/previous step.

. Final Notes for Engineers

Maintain Separation of Concerns: Keep structure, behavior, and style separate
Consistent Naming: Follow the established naming conventions
Progressive Enhancement: Implement core functionality first, then add features
Error Handling: Add robust error handling for API calls and user inputs
Testing: Test each component individually and the full user flow
Performance: Minimize DOM manipulations and optimize rendering
Accessibility: Ensure all UI elements are keyboard navigable and have proper ARIA attributes

This implementation plan provides a clear roadmap for building out our designed user flow within your existing architecture. By following this structure, your engineering team can systematically create a cohesive, maintainable UI system for the Bubo extension.RetryClaude can make mistakes. Please double-check responses.