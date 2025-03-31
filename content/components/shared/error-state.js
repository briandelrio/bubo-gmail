// Error states for Bubo

// Create an error message element
export function createErrorElement(message, details = null, retryCallback = null) {
  const container = document.createElement('div');
  container.className = 'bubo-error';
  
  const icon = document.createElement('div');
  icon.className = 'bubo-error-icon';
  icon.innerHTML = '⚠️';
  
  const content = document.createElement('div');
  content.className = 'bubo-error-content';
  
  const title = document.createElement('div');
  title.className = 'bubo-error-title';
  title.textContent = message;
  
  content.appendChild(title);
  
  if (details) {
    const detailsElement = document.createElement('div');
    detailsElement.className = 'bubo-error-details';
    detailsElement.textContent = details;
    content.appendChild(detailsElement);
  }
  
  const actions = document.createElement('div');
  actions.className = 'bubo-error-actions';
  
  if (retryCallback) {
    const retryButton = document.createElement('button');
    retryButton.className = 'bubo-btn bubo-btn-secondary';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', retryCallback);
    actions.appendChild(retryButton);
  }
  
  container.appendChild(icon);
  container.appendChild(content);
  container.appendChild(actions);
  
  // Add inline styles for the error
  const style = document.createElement('style');
  style.textContent = `
    .bubo-error {
      display: flex;
      align-items: flex-start;
      padding: var(--spacing-md);
      background-color: #FFEBEE;
      border: 1px solid #FFCDD2;
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
    }
    
    .bubo-error-icon {
      font-size: 24px;
      margin-right: var(--spacing-md);
      line-height: 1;
    }
    
    .bubo-error-content {
      flex: 1;
    }
    
    .bubo-error-title {
      font-weight: 500;
      color: #C62828;
      margin-bottom: var(--spacing-xs);
      font-size: 14px;
    }
    
    .bubo-error-details {
      color: var(--color-text-secondary);
      font-size: 12px;
      margin-bottom: var(--spacing-sm);
    }
    
    .bubo-error-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--spacing-sm);
    }
  `;
  
  container.appendChild(style);
  
  return container;
}

// Show a validation error under a form field
export function showFieldError(inputElement, errorMessage) {
  // Remove any existing error message
  const existingError = inputElement.parentNode.querySelector('.bubo-field-error');
  if (existingError) {
    existingError.parentNode.removeChild(existingError);
  }
  
  // Add error class to input
  inputElement.classList.add('bubo-input-error');
  
  // Create and add error message
  const errorElement = document.createElement('div');
  errorElement.className = 'bubo-field-error';
  errorElement.textContent = errorMessage;
  errorElement.style.cssText = `
    color: #C62828;
    font-size: 12px;
    margin-top: 4px;
    margin-bottom: 8px;
  `;
  
  // Insert after the input
  inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
  
  // Return a function to clear the error
  return () => {
    inputElement.classList.remove('bubo-input-error');
    const error = inputElement.parentNode.querySelector('.bubo-field-error');
    if (error) {
      error.parentNode.removeChild(error);
    }
  };
}

// Show an API error message
export function createApiErrorElement(error, retryCallback = null) {
  let errorMessage = 'An error occurred while connecting to the API.';
  let errorDetails = null;
  
  // Parse error to get meaningful message
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && error.message) {
    errorMessage = error.message;
    
    if (error.response) {
      // Handle HTTP errors with response details
      errorDetails = `Status: ${error.response.status}`;
      if (error.response.data && error.response.data.message) {
        errorDetails += ` - ${error.response.data.message}`;
      }
    }
  }
  
  return createErrorElement(errorMessage, errorDetails, retryCallback);
}

// Empty state with optional action
export function createEmptyStateElement(message, actionButtonText = null, actionCallback = null) {
  const container = document.createElement('div');
  container.className = 'bubo-empty-state';
  
  const icon = document.createElement('div');
  icon.className = 'bubo-empty-icon';
  icon.innerHTML = '📭';
  
  const textElement = document.createElement('div');
  textElement.className = 'bubo-empty-text';
  textElement.textContent = message;
  
  container.appendChild(icon);
  container.appendChild(textElement);
  
  if (actionButtonText && actionCallback) {
    const actionButton = document.createElement('button');
    actionButton.className = 'bubo-btn bubo-btn-secondary bubo-empty-action';
    actionButton.textContent = actionButtonText;
    actionButton.addEventListener('click', actionCallback);
    container.appendChild(actionButton);
  }
  
  // Add inline styles
  const style = document.createElement('style');
  style.textContent = `
    .bubo-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
      background-color: var(--color-background);
      border-radius: var(--radius-md);
      text-align: center;
    }
    
    .bubo-empty-icon {
      font-size: 32px;
      margin-bottom: var(--spacing-md);
    }
    
    .bubo-empty-text {
      color: var(--color-text-secondary);
      font-size: 14px;
      margin-bottom: var(--spacing-md);
    }
    
    .bubo-empty-action {
      margin-top: var(--spacing-sm);
    }
  `;
  
  container.appendChild(style);
  
  return container;
}