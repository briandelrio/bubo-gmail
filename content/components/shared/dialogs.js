// Dialog system for Bubo

// Create a modal dialog
export function createDialog(options = {}) {
  const {
    title = '',
    content = '',
    width = '400px',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = true,
    confirmCallback = null,
    cancelCallback = null,
    closeOnBackdropClick = true,
    className = ''
  } = options;
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'bubo-dialog-overlay';
  
  // Create dialog container
  const dialog = document.createElement('div');
  dialog.className = `bubo-dialog ${className}`;
  dialog.style.width = width;
  
  // Dialog header
  let dialogHTML = '';
  if (title) {
    dialogHTML += `
      <div class="bubo-dialog-header">
        <h3 class="bubo-dialog-title">${title}</h3>
        <button class="bubo-dialog-close">×</button>
      </div>
    `;
  }
  
  // Dialog content
  dialogHTML += `
    <div class="bubo-dialog-content">
      ${typeof content === 'string' ? content : ''}
    </div>
  `;
  
  // Dialog footer with actions
  dialogHTML += `
    <div class="bubo-dialog-footer">
      ${showCancel ? `<button class="bubo-btn bubo-btn-secondary bubo-dialog-cancel">${cancelText}</button>` : ''}
      <button class="bubo-btn bubo-btn-accent bubo-dialog-confirm">${confirmText}</button>
    </div>
  `;
  
  dialog.innerHTML = dialogHTML;
  
  // If content is an element, append it to content container
  if (typeof content === 'object' && content instanceof Element) {
    const contentContainer = dialog.querySelector('.bubo-dialog-content');
    contentContainer.innerHTML = '';
    contentContainer.appendChild(content);
  }
  
  // Add dialog to overlay
  overlay.appendChild(dialog);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .bubo-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    
    .bubo-dialog {
      background-color: var(--color-content);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      max-width: 90%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .bubo-dialog-header {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .bubo-dialog-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    
    .bubo-dialog-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: 4px 8px;
    }
    
    .bubo-dialog-content {
      padding: var(--spacing-md);
      overflow-y: auto;
      max-height: 60vh;
    }
    
    .bubo-dialog-footer {
      padding: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
    }
  `;
  
  dialog.appendChild(style);
  document.body.appendChild(overlay);
  
  // Event handlers
  const closeDialog = () => {
    document.body.removeChild(overlay);
  };
  
  // Close button
  const closeBtn = dialog.querySelector('.bubo-dialog-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (cancelCallback) cancelCallback();
      closeDialog();
    });
  }
  
  // Confirm button
  const confirmBtn = dialog.querySelector('.bubo-dialog-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
      closeDialog();
    });
  }
  
  // Cancel button
  const cancelBtn = dialog.querySelector('.bubo-dialog-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (cancelCallback) cancelCallback();
      closeDialog();
    });
  }
  
  // Close on backdrop click
  if (closeOnBackdropClick) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        if (cancelCallback) cancelCallback();
        closeDialog();
      }
    });
  }
  
  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (cancelCallback) cancelCallback();
      closeDialog();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  
  // Return methods to control the dialog
  return {
    close: closeDialog,
    getElement: () => dialog
  };
}

// Confirmation dialog
export function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    const dialogOptions = {
      title: options.title || 'Confirm',
      content: message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
      confirmCallback: () => resolve(true),
      cancelCallback: () => resolve(false),
      width: options.width || '400px',
      className: options.className || ''
    };
    
    createDialog(dialogOptions);
  });
}

// Alert dialog
export function showAlertDialog(message, options = {}) {
  return new Promise((resolve) => {
    const dialogOptions = {
      title: options.title || 'Alert',
      content: message,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
      confirmCallback: () => resolve(true),
      width: options.width || '400px',
      className: options.className || ''
    };
    
    createDialog(dialogOptions);
  });
}

// Create a toast notification
export function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.bubo-toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'bubo-toast-container';
    
    const containerStyle = document.createElement('style');
    containerStyle.textContent = `
      .bubo-toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .bubo-toast {
        padding: 12px 16px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        min-width: 200px;
        max-width: 400px;
        animation: bubo-toast-slide-in 0.3s, bubo-toast-fade-out 0.3s forwards;
        animation-delay: 0s, ${(duration - 300) / 1000}s;
      }
      
      .bubo-toast-info {
        background-color: #E3F2FD;
        color: #0D47A1;
        border-left: 4px solid #2196F3;
      }
      
      .bubo-toast-success {
        background-color: #E8F5E9;
        color: #1B5E20;
        border-left: 4px solid #4CAF50;
      }
      
      .bubo-toast-warning {
        background-color: #FFF8E1;
        color: #FF8F00;
        border-left: 4px solid #FFC107;
      }
      
      .bubo-toast-error {
        background-color: #FFEBEE;
        color: #B71C1C;
        border-left: 4px solid #F44336;
      }
      
      @keyframes bubo-toast-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes bubo-toast-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    
    document.body.appendChild(containerStyle);
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `bubo-toast bubo-toast-${type}`;
  toast.textContent = message;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    
    // Remove container if empty
    if (toastContainer.children.length === 0) {
      document.body.removeChild(toastContainer);
    }
  }, duration);
  
  // Return function to dismiss early
  return () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  };
}