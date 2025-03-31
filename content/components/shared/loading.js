// Loading component for Bubo
export function createLoadingElement(message = 'Loading...', size = 'medium') {
  const container = document.createElement('div');
  container.className = `bubo-loading bubo-loading-${size}`;
  
  const spinner = document.createElement('div');
  spinner.className = 'bubo-spinner';
  
  const loadingText = document.createElement('div');
  loadingText.className = 'bubo-loading-text';
  loadingText.textContent = message;
  
  container.appendChild(spinner);
  container.appendChild(loadingText);
  
  // Add inline styles for the spinner and loading indicator
  const style = document.createElement('style');
  style.textContent = `
    .bubo-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }
    
    .bubo-loading-small {
      padding: var(--spacing-sm);
    }
    
    .bubo-loading-medium {
      padding: var(--spacing-md);
    }
    
    .bubo-loading-large {
      padding: var(--spacing-lg);
    }
    
    .bubo-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(142, 90, 223, 0.1);
      border-radius: 50%;
      border-top-color: var(--color-accent);
      animation: bubo-spin 1s ease-in-out infinite;
      margin-bottom: var(--spacing-md);
    }
    
    .bubo-loading-small .bubo-spinner {
      width: 20px;
      height: 20px;
      border-width: 2px;
      margin-bottom: var(--spacing-sm);
    }
    
    .bubo-loading-large .bubo-spinner {
      width: 60px;
      height: 60px;
      border-width: 4px;
      margin-bottom: var(--spacing-lg);
    }
    
    .bubo-loading-text {
      color: var(--color-text-secondary);
      font-size: 14px;
    }
    
    @keyframes bubo-spin {
      to { transform: rotate(360deg); }
    }
  `;
  
  container.appendChild(style);
  
  return container;
}

// Shows a loading overlay on top of a container
export function showLoadingOverlay(container, message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = 'bubo-loading-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  const loadingElement = createLoadingElement(message);
  overlay.appendChild(loadingElement);
  
  // Make sure container has position relative for absolute positioning to work
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === 'static') {
    container.style.position = 'relative';
  }
  
  container.appendChild(overlay);
  
  // Return a function to remove the overlay
  return () => {
    container.removeChild(overlay);
  };
}

// Creates a loading button that shows a spinner inside the button
export function createLoadingButton(buttonElement, loadingText = 'Loading...') {
  const originalText = buttonElement.textContent;
  const originalDisabled = buttonElement.disabled;
  
  // Create spinner
  const spinner = document.createElement('span');
  spinner.className = 'bubo-button-spinner';
  spinner.style.cssText = `
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: bubo-spin 1s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  `;
  
  // Show loading state
  const setLoading = () => {
    buttonElement.disabled = true;
    buttonElement.textContent = '';
    buttonElement.appendChild(spinner);
    buttonElement.appendChild(document.createTextNode(loadingText));
  };
  
  // Restore original state
  const resetLoading = () => {
    buttonElement.disabled = originalDisabled;
    buttonElement.textContent = originalText;
  };
  
  return {
    setLoading,
    resetLoading
  };
}