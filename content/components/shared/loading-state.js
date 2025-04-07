// Loading state component for Bubo Extension

/**
 * Create a loading state component
 * @param {string} message - Optional loading message
 * @returns {HTMLElement} The loading state container
 */
export function createLoadingState(message = 'Loading...') {
  const container = document.createElement('div');
  container.className = 'bubo-loading-state';
  
  const spinner = document.createElement('div');
  spinner.className = 'bubo-spinner';
  
  // Create spinner inner elements
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('div');
    dot.className = 'bubo-dot';
    spinner.appendChild(dot);
  }
  
  const messageElement = document.createElement('p');
  messageElement.className = 'bubo-loading-message';
  messageElement.textContent = message;
  
  container.appendChild(spinner);
  container.appendChild(messageElement);
  
  // Add necessary CSS if not already added
  addLoadingStateStyles();
  
  return container;
}

/**
 * Replace content with loading state
 * @param {HTMLElement} container - Container to replace content
 * @param {string} message - Optional loading message
 * @returns {Function} Function to restore original content
 */
export function showLoadingState(container, message = 'Loading...') {
  if (!container) return () => {};
  
  // Store original content
  const originalContent = container.innerHTML;
  
  // Clear container
  container.innerHTML = '';
  
  // Add loading state
  const loadingState = createLoadingState(message);
  container.appendChild(loadingState);
  
  // Return function to restore original content
  return function restoreContent() {
    container.innerHTML = originalContent;
  };
}

/**
 * Add loading state CSS styles if not already added
 */
function addLoadingStateStyles() {
  // Check if styles already exist
  if (document.getElementById('bubo-loading-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'bubo-loading-styles';
  
  // Add CSS rules
  style.textContent = `
    .bubo-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    
    .bubo-spinner {
      display: flex;
      position: relative;
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }
    
    .bubo-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-accent, #8E5ADF);
      opacity: 0.8;
    }
    
    .bubo-dot:nth-child(1) {
      top: 0;
      left: 0;
      animation: bubo-pulse 1.2s infinite ease-in-out;
    }
    
    .bubo-dot:nth-child(2) {
      top: 0;
      right: 0;
      animation: bubo-pulse 1.2s infinite ease-in-out 0.3s;
    }
    
    .bubo-dot:nth-child(3) {
      bottom: 0;
      right: 0;
      animation: bubo-pulse 1.2s infinite ease-in-out 0.6s;
    }
    
    .bubo-dot:nth-child(4) {
      bottom: 0;
      left: 0;
      animation: bubo-pulse 1.2s infinite ease-in-out 0.9s;
    }
    
    @keyframes bubo-pulse {
      0%, 50%, 100% {
        transform: scale(1);
        opacity: 0.8;
      }
      25% {
        transform: scale(1.5);
        opacity: 1;
      }
    }
    
    .bubo-loading-message {
      margin: 0;
      color: var(--color-text-secondary, #838382);
      font-size: 14px;
    }
  `;
  
  // Add styles to document
  document.head.appendChild(style);
}