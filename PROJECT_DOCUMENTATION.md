# Bubo Gmail Extension - Project Documentation

## Project Overview

Bubo is a Chrome extension that enhances Gmail with AI-powered email outreach capabilities. It allows users to create campaigns, discover contacts, write personalized emails, and manage follow-ups, all directly integrated into the Gmail interface.

## Project Structure

```
bubo-gmail-main/
├── assets/                      # Static assets
│   └── icons/                   # Application icons
├── background/                  # Background script
│   ├── index.js                 # Background entry point
│   └── services/
│       └── messaging.js         # Message handling service
├── content/                     # Content scripts (injected into Gmail)
│   ├── components/              # UI components
│   │   ├── bubo-analysis/       # Email analysis module
│   │   ├── bubo-followups/      # Follow-up management
│   │   ├── campaign-detail/     # Campaign details view
│   │   ├── campaign-launch/     # Campaign launch screen
│   │   ├── campaign-management/ # Campaign management
│   │   ├── company-selection/   # Company selection UI
│   │   ├── contact-discovery/   # Contact discovery UI
│   │   ├── dashboard/           # Main dashboard
│   │   ├── email-config/        # Email configuration
│   │   ├── email-creation/      # Email creation UI
│   │   ├── email-editor/        # Email editing UI
│   │   ├── followup-editor/     # Follow-up editing UI
│   │   ├── followup-setup/      # Follow-up setup UI
│   │   ├── initial-bubo/        # Initial setup UI
│   │   ├── onboarding/          # User onboarding
│   │   ├── purpose-definition/  # Define campaign purpose
│   │   └── shared/              # Shared components
│   │       ├── error-state.js   # Error display component
│   │       └── loading-state.js # Loading state component
│   ├── core/                    # Core functionality
│   │   ├── injection.js         # DOM injection utilities
│   │   ├── position.js          # UI positioning logic
│   │   └── state.js             # State management
│   ├── index.js                 # Content script entry point
│   ├── services/                # Frontend services
│   │   └── api.js               # API services layer
│   ├── styles/                  # Stylesheets
│   │   └── base.css             # Base styles
│   └── utils/                   # Utility functions
│       └── formatters.js        # Data formatting utilities
├── manifest.json                # Extension manifest
├── popup/                       # Popup UI
│   ├── index.html               # Popup HTML
│   ├── popup.css                # Popup styles
│   └── popup.js                 # Popup script
├── test.html                    # Test environment
└── test.sh                      # Test launcher script
```

## Architecture Overview

The Bubo Gmail extension follows a modular architecture with these key components:

### 1. Background Script

The background script runs in the extension's background context and is responsible for:

- Handling message passing between the content script and popup
- Managing Chrome storage for persistent data
- Processing API requests
- Simulating backend operations (for prototype)

The background script initializes storage with sample data on first run and exposes a message-based API for the content script to interact with.

**Key Files:**
- `/background/index.js` - Main entry point
- `/background/services/messaging.js` - Message handling

### 2. Content Script

The content script is injected into Gmail and handles:

- UI component rendering and management
- Gmail compose window detection
- State management
- User interaction

The content script follows a component-based architecture where each feature has its own directory with structure (HTML), behaviors (JS), and styling (CSS).

**Key Files:**
- `/content/index.js` - Main entry point
- `/content/core/state.js` - State management
- `/content/core/position.js` - UI positioning

### 3. Popup

A lightweight popup UI that appears when clicking the extension icon. Currently minimal but could be expanded for settings or quick actions.

**Key Files:**
- `/popup/index.html` - Popup UI
- `/popup/popup.js` - Popup logic

## Data Flow

The extension uses a layered data flow architecture:

1. **UI Components** - Render data and capture user input
2. **State Management** - Central state store using a pub/sub pattern
3. **API Service Layer** - Abstracts communication with background script
4. **Background Script** - Processes requests and interacts with storage
5. **Chrome Storage** - Persistent data storage

## State Management

The state management system uses a custom implementation with pub/sub pattern:

```javascript
// Simplified example
const componentData = {
  data: {}, // Application state
  listeners: {}, // Callback functions
  
  setState(newState) { /* Update state and notify */ },
  getState() { /* Return current state */ },
  subscribe(key, callback) { /* Add listener */ },
  notifyListeners() { /* Call listeners with new state */ },
  
  // Domain-specific methods
  goToScreen(screen) { /* Navigate to screen */ },
  toggleCompanySelection(id) { /* Toggle company selection */ },
  // ...etc
};
```

State changes trigger re-renders of affected components through the subscription system.

## Component Structure

Each UI component follows a consistent pattern:

1. **Structure** - Defines the HTML structure
2. **Behaviors** - Contains event handlers and logic
3. **Styles** - Component-specific CSS

Example component rendering pattern:

```javascript
// Render component
function renderComponent(state) {
  const container = document.createElement('div');
  // Set up structure
  container.innerHTML = `...`;
  // Attach behaviors
  attachBehaviors(container, state);
  return container;
}

// Attach behaviors
function attachBehaviors(container, state) {
  // Add event listeners
  container.querySelector('#some-button').addEventListener('click', () => {
    // Handle event
  });
}
```

## API Service Layer

The API service layer abstracts communication with the background script:

```javascript
// API service example
const CompanyAPI = {
  async getCompanies(filters = {}) {
    // Send message to background script
    const response = await sendMessage({ 
      type: 'GET_COMPANIES',
      filters 
    });
    
    // Process response
    if (response.success) {
      return response.data;
    } else {
      // Handle error
      throw new Error(response.error);
    }
  },
  // ...other methods
};
```

This creates a clean separation between UI and data layers.

## User Flow

The extension supports the following user flow:

1. **Dashboard** - Overview of campaigns and metrics
2. **Define Purpose** - Set campaign goals
3. **Company Selection** - Select target companies
4. **Contact Discovery** - Find contacts at selected companies
5. **Email Creation** - Create email content
6. **Follow-up Setup** - Configure follow-up emails
7. **Campaign Launch** - Launch the campaign
8. **Campaign Management** - Monitor and manage active campaigns

Each step has its own UI component with navigation between steps.

## Loading and Error States

The application has standardized loading and error states:

```javascript
// Loading state example
function showLoadingState(container, message = 'Loading...') {
  container.innerHTML = '';
  const loadingState = createLoadingState(message);
  container.appendChild(loadingState);
}

// Error state example
function showErrorState(container, message, retryAction) {
  container.innerHTML = '';
  const errorState = createErrorState(message, retryAction);
  container.appendChild(errorState);
}
```

These are used consistently across the application to provide feedback during asynchronous operations.

## Data Models

The application uses the following key data models:

### Company

```javascript
{
  id: Number,
  name: String,
  industry: String,
  employees: String,
  selected: Boolean
}
```

### Contact

```javascript
{
  id: Number,
  name: String,
  role: String,
  email: String,
  company: String,
  company_id: Number,
  match: Number,
  selected: Boolean
}
```

### Email Template

```javascript
{
  id: String,
  name: String,
  subject: String,
  body: String
}
```

### Follow-up

```javascript
{
  id: String,
  days: Number,
  time: String,
  stopIfReplied: Boolean,
  stopIfOpened: Boolean,
  subject: String,
  body: String
}
```

### Campaign

```javascript
{
  id: String,
  name: String,
  status: String,
  purpose: String,
  created: String,
  sendFrom: String,
  trackOpens: Boolean,
  trackClicks: Boolean,
  dailyLimit: Number,
  metrics: {
    delivered: Number,
    opened: Number,
    replied: Number,
    clicked: Number,
    openRate: Number,
    replyRate: Number,
    clickRate: Number
  },
  companies: Array,
  contacts: Array,
  emails: Array,
  followups: Array,
  activity: [
    { 
      type: String, 
      message: String, 
      timestamp: String 
    }
  ]
}
```

## Chrome Storage Structure

The extension uses Chrome's storage.local API for persistance with the following structure:

```javascript
{
  companies: Array,              // List of companies
  contacts: Array,               // List of contacts
  emailTemplates: Array,         // Email templates
  followupTemplates: Array,      // Follow-up templates
  emails: Array,                 // Email drafts
  followups: Array,              // Follow-up drafts
  activeCampaigns: Array,        // Active campaigns
  userSettings: Object,          // User settings
  apiConnections: Object,        // API connection status
  initialized: Boolean           // Whether storage has been initialized
}
```

## API Integration Points

The extension is designed to integrate with several external APIs for enhanced functionality:

### 1. Email Finding/Verification API

**Potential APIs:**
- Hunter.io
- Clearbit
- RocketReach
- Apollo.io
- Email Verifier APIs

**Integration Points:**
- `/content/services/api.js` - API service layer
- `/background/services/messaging.js` - Message handler

**Data Required:**
- Company name/domain
- Person name/title
- API keys

### 2. Company Information API

**Potential APIs:**
- Clearbit
- Crunchbase
- LinkedIn API
- ZoomInfo
- Apollo.io

**Integration Points:**
- Company search functionality
- Company profile enrichment

**Data Required:**
- Company name/domain
- Industry information
- Company size

### 3. Email Tracking API

**Potential APIs:**
- Mailgun
- SendGrid
- Custom tracking service

**Integration Points:**
- Campaign monitoring
- Email sending
- Open/click tracking

**Data Required:**
- Email content
- Recipient information
- Tracking pixels/links

### 4. Gmail API

**Integration Points:**
- Email sending
- Draft creation
- Email retrieval
- Label management

**Data Required:**
- Gmail API scope permissions
- Authentication

### 5. AI Content Generation API

**Potential APIs:**
- OpenAI API
- Claude API
- Gemini API

**Integration Points:**
- Email content generation
- Follow-up content generation

**Data Required:**
- API keys
- Campaign context
- Personalization data

## Implementation Status

### Completed
- ✅ Core extension architecture
- ✅ Basic UI components
- ✅ State management system
- ✅ Gmail integration
- ✅ Campaign creation flow
- ✅ Email editor
- ✅ Follow-up editor
- ✅ Campaign detail view
- ✅ API service layer
- ✅ Loading/error states
- ✅ Chrome storage integration

### In Progress
- 🔄 Data persistence
- 🔄 API integrations
- 🔄 Dynamic data loading

### Pending
- ⏳ Email tracking implementation
- ⏳ Contact discovery API integration
- ⏳ AI writing assistance
- ⏳ Advanced campaign analytics
- ⏳ Email template management

## Future Considerations

1. **Security** - The extension will need secure API key management and OAuth flows
2. **Rate Limiting** - External API integrations will need proper rate limiting
3. **Caching** - Implement caching strategies for API responses
4. **Offline Support** - Enhance offline capabilities with IndexedDB
5. **Analytics** - Add detailed campaign analytics and reporting
6. **Authentication** - User authentication for accessing paid features
7. **Permissions** - Manage and request appropriate permissions

## Testing Environment

A test environment is available for development:

- `/test.html` - Simulates Gmail interface
- `/test.sh` - Script to launch test environment

The test environment allows testing components without loading the extension into Gmail.

## API Integration Strategy

Based on the current architecture, the recommended API integration strategy is:

1. **Extend the API Service Layer** - Add specific methods for each external API
2. **Update Background Script Handlers** - Implement handlers for new API requests
3. **Add Authentication Flow** - For APIs requiring authentication
4. **Implement Error Handling** - For API-specific errors
5. **Add Caching** - To reduce API calls and improve performance
6. **Create UI for API Settings** - Allow users to enter API keys and configure integration settings

## Conclusion

The Bubo Gmail extension is well-structured for API integrations with a clean separation of concerns between UI, state management, and data access. The modular architecture makes it straightforward to extend with new capabilities as external APIs are integrated.