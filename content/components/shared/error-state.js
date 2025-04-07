// Error state component for Bubo Extension

/**
 * Create an error state component
 * @param {string} message - Error message to display
 * @param {Function} retryAction - Optional function to call when retry button is clicked
 * @returns {HTMLElement} The error state container
 */
export function createErrorState(message = 'Something went wrong', retryAction = null) {
  const container = document.createElement('div');
  container.className = 'bubo-error-state';
  
  const icon = document.createElement('div');
  icon.className = 'bubo-error-icon';
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `;
  
  const messageElement = document.createElement('p');
  messageElement.className = 'bubo-error-message';
  messageElement.textContent = message;
  
  container.appendChild(icon);
  container.appendChild(messageElement);
  
  // Add retry button if retry function is provided
  if (typeof retryAction === 'function') {
    const retryButton = document.createElement('button');
    retryButton.className = 'bubo-btn bubo-btn-secondary bubo-retry-btn';
    retryButton.textContent = 'Try Again';
    retryButton.addEventListener('click', retryAction);
    
    container.appendChild(retryButton);
  }
  
  // Add necessary CSS if not already added
  addErrorStateStyles();
  
  return container;
}

/**
 * Replace content with error state
 * @param {HTMLElement} container - Container to replace content
 * @param {string} message - Error message to display
 * @param {Function} retryAction - Optional function to call when retry button is clicked
 * @returns {Function} Function to restore original content
 */
export function showErrorState(container, message = 'Something went wrong', retryAction = null) {
  if (!container) return () => {};
  
  // Store original content
  const originalContent = container.innerHTML;
  
  // Clear container
  container.innerHTML = '';
  
  // Add error state
  const errorState = createErrorState(message, retryAction);
  container.appendChild(errorState);
  
  // Return function to restore original content
  return function restoreContent() {
    container.innerHTML = originalContent;
  };
}

/**
 * Add error state CSS styles if not already added
 */
function addErrorStateStyles() {
  // Check if styles already exist
  if (document.getElementById('bubo-error-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'bubo-error-styles';
  
  // Add CSS rules
  style.textContent = `
    .bubo-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    
    .bubo-error-icon {
      color: #F44336;
      margin-bottom: 12px;
    }
    
    .bubo-error-message {
      margin: 0 0 16px 0;
      color: var(--color-text-primary, #5C5C5B);
      font-size: 14px;
    }
    
    .bubo-retry-btn {
      padding: 8px 16px;
      font-size: 14px;
    }
  `;
  
  // Add styles to document
  document.head.appendChild(style);
}