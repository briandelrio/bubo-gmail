// Utility formatters for Bubo Email Extension

/**
 * Format a date string or timestamp to a user-friendly format
 * @param {string|number|Date} dateInput - The date to format
 * @param {string} format - Optional format (short, long, time)
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, format = 'short') {
  if (!dateInput) return '';
  
  let date;
  
  // Convert input to Date object
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return '';
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // Format based on requested format
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
      
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    case 'time':
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
      
    case 'datetime':
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString(undefined, {
               hour: '2-digit',
               minute: '2-digit'
             });
             
    case 'relative':
      return getRelativeTimeString(date);
      
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Get a relative time string (e.g., "5 minutes ago")
 * @param {Date} date - The date to convert to relative time
 * @returns {string} Relative time string
 */
function getRelativeTimeString(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date, 'short');
  }
}

/**
 * Format a number as a percentage
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return value.toFixed(decimals) + '%';
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength) + '...';
}

/**
 * Apply personalization tokens to a template string
 * @param {string} template - Template with tokens like {{name}}
 * @param {Object} data - Data object with values to replace tokens
 * @returns {string} Personalized string
 */
export function personalizeTemplate(template, data = {}) {
  if (!template) return '';
  
  // Create a safe data object (even if data is null/undefined)
  const safeData = data || {};
  
  // Replace tokens in the format {{tokenName}}
  return template.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
    // Check if the token exists in the data object
    if (safeData[token] !== undefined) {
      return safeData[token];
    }
    
    // Special case for firstName (extract from full name)
    if (token === 'firstName' && safeData.name) {
      const firstName = safeData.name.split(' ')[0];
      return firstName;
    }
    
    // If token doesn't exist, return the original token
    return match;
  });
}

/**
 * Format campaign status with appropriate styling class
 * @param {string} status - Campaign status (active, paused, etc.)
 * @returns {Object} Object with status text and CSS class
 */
export function formatCampaignStatus(status) {
  if (!status) return { text: 'Unknown', className: 'bubo-status-unknown' };
  
  // Normalize status to lowercase
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
      return { text: 'Active', className: 'bubo-status-active' };
      
    case 'paused':
      return { text: 'Paused', className: 'bubo-status-paused' };
      
    case 'completed':
      return { text: 'Completed', className: 'bubo-status-complete' };
      
    case 'scheduled':
      return { text: 'Scheduled', className: 'bubo-status-scheduled' };
      
    case 'draft':
      return { text: 'Draft', className: 'bubo-status-draft' };
      
    case 'stopped':
    case 'cancelled':
      return { text: 'Cancelled', className: 'bubo-status-cancelled' };
      
    default:
      return { text: 'Unknown', className: 'bubo-status-unknown' };
  }
}

/**
 * Clean HTML for safe display (removes scripts, etc.)
 * @param {string} html - HTML string to clean
 * @returns {string} Cleaned HTML string
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  
  // Create a temporary div
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script tags
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove style tags
  const styles = tempDiv.querySelectorAll('style');
  styles.forEach(style => style.remove());
  
  // Remove on* attributes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return tempDiv.innerHTML;
}