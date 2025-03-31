import './style.css';
import * as behaviors from './behaviors';
import BuboState from '../../core/state';

export function render(state) {
  const container = document.createElement('div');
  container.className = 'bubo-module bubo-email-editor';
  
  // Header
  const header = document.createElement('div');
  header.className = 'bubo-header';
  header.innerHTML = `
    <div class="bubo-brand">
      <span class="bubo-logo">Edit Email</span>
    </div>
    <button id="bubo-email-editor-close" class="bubo-close">×</button>
  `;
  
  // Content
  const content = document.createElement('div');
  content.className = 'bubo-content';
  
  // Email form
  const emailForm = document.createElement('div');
  emailForm.className = 'bubo-email-form';
  
  // Subject line
  const subjectContainer = document.createElement('div');
  subjectContainer.className = 'bubo-subject-container';
  subjectContainer.innerHTML = `
    <label for="bubo-subject" class="bubo-label">Subject Line</label>
    <input type="text" id="bubo-subject" class="bubo-input" value="${state.currentEmail?.subject || ''}" placeholder="Enter email subject...">
  `;
  
  // Formatting toolbar
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
    <div id="bubo-body" class="bubo-editor" contenteditable="true">${state.currentEmail?.body || ''}</div>
  `;
  
  // Template management
  const templateContainer = document.createElement('div');
  templateContainer.className = 'bubo-template-container';
  templateContainer.innerHTML = `
    <div class="bubo-template-controls">
      <select id="bubo-templates" class="bubo-select">
        <option value="">Load template...</option>
        <option value="template1">Introduction Email</option>
        <option value="template2">Follow-up Template</option>
        <option value="template3">Meeting Request</option>
      </select>
      <button id="bubo-save-template" class="bubo-btn bubo-btn-secondary">Save as Template</button>
    </div>
  `;
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'bubo-actions';
  actions.innerHTML = `
    <button id="bubo-email-cancel" class="bubo-btn bubo-btn-secondary">Cancel</button>
    <button id="bubo-email-save" class="bubo-btn bubo-btn-accent">Save Changes</button>
  `;
  
  // Assemble the email editor
  emailForm.appendChild(subjectContainer);
  emailForm.appendChild(toolbar);
  emailForm.appendChild(bodyContainer);
  emailForm.appendChild(templateContainer);
  emailForm.appendChild(actions);
  
  content.appendChild(emailForm);
  container.appendChild(header);
  container.appendChild(content);
  
  // Attach behaviors
  setTimeout(() => {
    behaviors.attachEventListeners(container, state);
  }, 0);
  
  return container;
}