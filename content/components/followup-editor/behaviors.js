import BuboState from '../../core/state';

export function attachEventListeners(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-followup-editor-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Return to previous screen, typically followup-setup
      if (state.previousScreen) {
        BuboState.goToScreen(state.previousScreen);
      } else {
        BuboState.goToScreen('followups');
      }
    });
  }
  
  // Cancel button
  const cancelBtn = container.querySelector('#bubo-followup-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Prompt user if there are unsaved changes
      const confirmed = confirm('Discard changes to this follow-up?');
      if (confirmed) {
        // Return to previous screen without saving
        if (state.previousScreen) {
          BuboState.goToScreen(state.previousScreen);
        } else {
          BuboState.goToScreen('followups');
        }
      }
    });
  }
  
  // Save button
  const saveBtn = container.querySelector('#bubo-followup-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const days = parseInt(container.querySelector('#bubo-days').value, 10);
      const time = container.querySelector('#bubo-time').value;
      const stopIfReplied = container.querySelector('#bubo-condition-replied').checked;
      const stopIfOpened = container.querySelector('#bubo-condition-opened').checked;
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // Validate inputs
      if (!days || days < 1) {
        alert('Please enter a valid number of days (minimum 1)');
        return;
      }
      
      if (!subject) {
        alert('Please enter a subject line');
        return;
      }
      
      if (!body) {
        alert('Please enter email content');
        return;
      }
      
      // Save updated followup content to state
      if (state.currentFollowup) {
        const updatedFollowup = {
          ...state.currentFollowup,
          days,
          time,
          stopIfReplied,
          stopIfOpened,
          subject,
          body
        };
        
        // Update the followup in the followups array
        const updatedFollowups = state.followups.map(followup => {
          if (followup.id === updatedFollowup.id) {
            return updatedFollowup;
          }
          return followup;
        });
        
        BuboState.setState({
          followups: updatedFollowups,
          currentFollowup: null
        });
      }
      
      // Return to previous screen
      if (state.previousScreen) {
        BuboState.goToScreen(state.previousScreen);
      } else {
        BuboState.goToScreen('followups');
      }
    });
  }
  
  // Format buttons
  const formatBtns = container.querySelectorAll('.bubo-toolbar-btn');
  if (formatBtns.length) {
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.getAttribute('data-format');
        
        if (format === 'createLink') {
          const url = prompt('Enter URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
        } else {
          document.execCommand(format, false, null);
        }
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      });
    });
  }
  
  // Personalization dropdown
  const personalizationSelect = container.querySelector('#bubo-personalization');
  if (personalizationSelect) {
    personalizationSelect.addEventListener('change', () => {
      const token = personalizationSelect.value;
      if (token) {
        document.execCommand('insertText', false, token);
        personalizationSelect.value = '';
        
        // Focus back on editor
        const editor = container.querySelector('#bubo-body');
        if (editor) {
          editor.focus();
        }
      }
    });
  }
  
  // Days input validation
  const daysInput = container.querySelector('#bubo-days');
  if (daysInput) {
    daysInput.addEventListener('input', () => {
      const value = parseInt(daysInput.value, 10);
      if (value < 1) {
        daysInput.value = 1;
      } else if (value > 30) {
        daysInput.value = 30;
      }
    });
  }
}