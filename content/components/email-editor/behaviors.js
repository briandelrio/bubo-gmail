import BuboState from '../../core/state';

export function attachEventListeners(container, state) {
  // Close button
  const closeBtn = container.querySelector('#bubo-email-editor-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Return to previous screen, typically email-creation
      if (state.previousScreen) {
        BuboState.goToScreen(state.previousScreen);
      } else {
        BuboState.goToScreen('emails');
      }
    });
  }
  
  // Cancel button
  const cancelBtn = container.querySelector('#bubo-email-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Prompt user if there are unsaved changes
      const confirmed = confirm('Discard changes to this email?');
      if (confirmed) {
        // Return to previous screen without saving
        if (state.previousScreen) {
          BuboState.goToScreen(state.previousScreen);
        } else {
          BuboState.goToScreen('emails');
        }
      }
    });
  }
  
  // Save button
  const saveBtn = container.querySelector('#bubo-email-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // Save updated email content to state
      if (state.currentEmail) {
        const updatedEmail = {
          ...state.currentEmail,
          subject,
          body
        };
        
        // Update the email in the emails array
        const updatedEmails = state.emails.map(email => {
          if (email.id === updatedEmail.id) {
            return updatedEmail;
          }
          return email;
        });
        
        BuboState.setState({
          emails: updatedEmails,
          currentEmail: null
        });
      }
      
      // Return to previous screen
      if (state.previousScreen) {
        BuboState.goToScreen(state.previousScreen);
      } else {
        BuboState.goToScreen('emails');
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
  
  // Template loading
  const templateSelect = container.querySelector('#bubo-templates');
  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      const templateId = templateSelect.value;
      if (templateId) {
        // In a real implementation, we would load template content from storage
        // For now, we'll use hardcoded examples
        const templates = {
          template1: {
            subject: 'Introduction: {{firstName}} from {{company}}',
            body: 'Hi {{firstName}},<br><br>I hope this email finds you well. I wanted to reach out and introduce myself. I work with companies in your industry to help them improve their outreach and lead generation.<br><br>Would you be open to a quick call to discuss how we might be able to help {{company}}?<br><br>Best regards,<br>[Your Name]'
          },
          template2: {
            subject: 'Following up: {{company}} opportunity',
            body: 'Hi {{firstName}},<br><br>I wanted to follow up on my previous email about helping {{company}} with outreach and lead generation. I understand you might be busy, so I thought I would check in again.<br><br>Would you have 15 minutes for a quick call this week?<br><br>Best regards,<br>[Your Name]'
          },
          template3: {
            subject: 'Meeting request: {{firstName}} + [Your Name]',
            body: 'Hi {{firstName}},<br><br>I would like to schedule a meeting to discuss how we can help {{company}} improve your outreach strategy. Would any of the following times work for you?<br><br>- Tuesday at 10:00 AM<br>- Wednesday at 2:00 PM<br>- Thursday at 11:00 AM<br><br>Looking forward to speaking with you.<br><br>Best regards,<br>[Your Name]'
          }
        };
        
        const template = templates[templateId];
        if (template) {
          container.querySelector('#bubo-subject').value = template.subject;
          container.querySelector('#bubo-body').innerHTML = template.body;
        }
        
        // Reset select
        templateSelect.value = '';
      }
    });
  }
  
  // Save as template button
  const saveTemplateBtn = container.querySelector('#bubo-save-template');
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener('click', () => {
      const subject = container.querySelector('#bubo-subject').value;
      const body = container.querySelector('#bubo-body').innerHTML;
      
      // In a real implementation, we would save to storage
      // For prototype, just show confirmation
      if (subject && body) {
        const templateName = prompt('Enter a name for this template:');
        if (templateName) {
          // Simulate saving the template
          alert(`Template "${templateName}" saved successfully.`);
          
          // In real implementation, update template list
          // const newOption = document.createElement('option');
          // newOption.value = 'new-template-id';
          // newOption.textContent = templateName;
          // templateSelect.appendChild(newOption);
        }
      } else {
        alert('Please add content before saving as template.');
      }
    });
  }
}