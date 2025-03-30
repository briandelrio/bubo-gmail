# Bubo Gmail Extension

An AI-powered email outreach assistant for Gmail that enhances your email campaigns with smart follow-ups and engagement tracking.

## Project Structure

The extension is built with a modular architecture:

- **Background Scripts**: Handle extension-level events and state
- **Content Scripts**: Inject UI and functionality into Gmail
- **Components**: Modular UI components with separated structure, behavior, and style

## Implementation Details

The implementation follows a component-based architecture where each screen is composed of:

- **structure.js**: Defines the HTML structure of the component
- **behaviors.js**: Adds event handlers and interactions
- **style.css**: Component-specific styles

### State Management

The application uses a simple state management system in `content/core/state.js` that:

- Maintains application state
- Provides methods to update state
- Notifies listeners of state changes

### User Flow

The extension implements a comprehensive outreach workflow:

1. **Dashboard**: Shows campaign metrics and quick actions
2. **Onboarding**: First-time setup connecting to APIs
3. **Purpose Definition**: Define outreach purpose and segmentation
4. **Company Selection**: Search and select target companies
5. **Contact Discovery**: Find and select contacts within companies
6. **Email Creation**: Create personalized, effective emails
7. **Follow-up Setup**: Configure follow-up sequences
8. **Campaign Launch**: Start and manage email campaigns
9. **Campaign Complete**: Confirmation of campaign launch
10. **Campaign Management**: Track campaign performance

## Features

- **Email Composition Assistance**: Create personalized, effective emails quickly
- **Smart Follow-ups**: Set up automated follow-up sequences
- **Contact Discovery**: Find and manage contacts within targeted companies
- **Campaign Management**: Track and manage your email outreach campaigns
- **Analytics Dashboard**: View engagement metrics and optimize your approach

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. Navigate to Gmail and open a compose window to see the Bubo toggle button

## Development

The extension is built as a set of HTML, CSS, and JavaScript files with no build process required. All components are loaded dynamically when the extension initializes.

### Component Structure

Each component follows the same pattern:

```
/components/component-name/
  ├── structure.js  # Defines the UI structure
  ├── behaviors.js  # Handles interactions and events
  └── style.css     # Component-specific styling
```

### Testing

To test the extension:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension directory
4. Navigate to Gmail and open a compose window
5. Look for the Bubo toggle button next to your compose window
6. Click the toggle button to open the Bubo interface

## Future Enhancements

- API integration for real data fetching
- Enhanced email analytics
- A/B testing for email campaigns
- Integration with CRM systems