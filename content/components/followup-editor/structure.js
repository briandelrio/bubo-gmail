import './style.css';
import * as behaviors from './behaviors';
import BuboState from '../../core/state';

export function render(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-followup-editor';
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Edit Follow-up</span>
    </div>
    <button id="bubo-followup-editor-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Follow-up form
  const followupForm = document.createElement('div');
  followupForm.className = 'bubo-followup-form';
  
  // Timing settings
  const timingContainer = document.createElement('div');
  timingContainer.className = 'bubo-timing-container';
  timingContainer.innerHTML = `
    <h3 class="bubo-subtitle">Timing</h3>
    <div class="bubo-timing-controls">
      <div class="bubo-timing-group">
        <label for="bubo-days" class="bubo-label">Days After Previous Email</label>
        <input type="number" id="bubo-days" class="bubo-input" min="1" max="30" value="${state.currentFollowup?.days || 3}" />
      </div>
      <div class="bubo-timing-group">
        <label for="bubo-time" class="bubo-label">Time</label>
        <select id="bubo-time" class="bubo-select">
          <option value="morning" ${state.currentFollowup?.time === 'morning' ? 'selected' : ''}>Morning (9 AM)</option>
          <option value="midday" ${state.currentFollowup?.time === 'midday' ? 'selected' : ''}>Midday (12 PM)</option>
          <option value="afternoon" ${state.currentFollowup?.time === 'afternoon' ? 'selected' : ''}>Afternoon (3 PM)</option>
        </select>
      </div>
    </div>
  `;
  
  // Conditions
  const conditionsContainer = document.createElement('div');
  conditionsContainer.className = 'bubo-conditions-container';
  conditionsContainer.innerHTML = `
    <h3 class="bubo-subtitle">Conditions</h3>
    <div class="bubo-condition-options">
      <div class="bubo-checkbox-group">
        <input type="checkbox" id="bubo-condition-replied" class="bubo-checkbox" ${state.currentFollowup?.stopIfReplied ? 'checked' : ''} />
        <label for="bubo-condition-replied" class="bubo-checkbox-label">Stop sequence if recipient replied</label>
      </div>
      <div class="bubo-checkbox-group">
        <input type="checkbox" id="bubo-condition-opened" class="bubo-checkbox" ${state.currentFollowup?.stopIfOpened ? 'checked' : ''} />
        <label for="bubo-condition-opened" class="bubo-checkbox-label">Stop sequence if recipient opened the email</label>
      </div>
    </div>
  `;
  
  // Email subject
  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'bubo-subject-container';
  subjectContainer.innerHTML = `
    <h3 class="bubo-subtitle">Email Content</h3>
    <label for="bubo-subject" class="bubo-label">Subject Line</label>
    <input type="text" id="bubo-subject" class="bubo-input" value="${state.currentFollowup?.subject || ''}" placeholder="Enter follow-up subject...">
  `;
  
  // Formatting toolbar (reusing from email-editor)
  const toolbar = document.createElement('div');
  toolbar.className = 'bubo-toolbar';
  toolbar.innerHTML = `
    <button class="bubo-toolbar-btn" data-format="bold"><strong>B</strong></button>
    <button class="bubo-toolbar-btn" data-format="italic"><em>I</em></button>
    <button class="bubo-toolbar-btn" data-format="underline"><u>U</u></button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="insertUnorderedList">• List</button>
    <button class="bubo-toolbar-btn" data-format="insertOrderedList">1. List</button>
    <span class="bubo-toolbar-divider"></span>
    <button class="bubo-toolbar-btn" data-format="createLink">Link</button>
    <span class="bubo-toolbar-divider"></span>
    <select id="bubo-personalization" class="bubo-select">
      <option value="">Insert personalization...</option>
      <option value="{{firstName}}">First Name</option>
      <option value="{{company}}">Company</option>
      <option value="{{title}}">Job Title</option>
    </select>
  `;
  
  // Email body
  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'bubo-body-container';
  bodyContainer.innerHTML = `
    <label for="bubo-body" class="bubo-label">Email Body</label>
    <div id="bubo-body" class="bubo-editor" contenteditable="true">${state.currentFollowup?.body || ''}</div>
  `;
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'bubo-actions';
  actions.innerHTML = `
    <button id="bubo-followup-cancel" class="bubo-btn bubo-btn-secondary">Cancel</button>
    <button id="bubo-followup-save" class="bubo-btn bubo-btn-accent">Save Changes</button>
  `;
  
  // Assemble the followup editor
  followupForm.appendChild(timingContainer);
  followupForm.appendChild(conditionsContainer);
  followupForm.appendChild(subjectContainer);
  followupForm.appendChild(toolbar);
  followupForm.appendChild(bodyContainer);
  followupForm.appendChild(actions);
  
  content.appendChild(followupForm);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    behaviors.attachEventListeners(container, state);
  }, 0);
  
  return container;
}