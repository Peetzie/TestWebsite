import { initDrag, centerWindow, setupWindowControls } from './terminal-ui.js';
import { setupInput } from './terminal-events.js';
import { resetTerminal } from './terminal-logic.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing terminal UI...');

  // Get all DOM elements
  const windowEl = document.querySelector('.window');
  const titleBar = windowEl.querySelector('.title-bar');
  const terminal = document.getElementById('terminal');
  const closeBtn = document.getElementById('close-btn');
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const reopenIcon = document.getElementById('reopen-icon');
  const hiddenInput = document.getElementById('hidden-input');

  // --- Initial Setup ---
  centerWindow(windowEl);
  resetTerminal(terminal);
  initDrag(windowEl, titleBar);
  // Setup input handling once and for all
  setupInput(hiddenInput, terminal);
  setupWindowControls(windowEl, closeBtn, minimizeBtn, maximizeBtn, reopenIcon);

  // --- Event Listeners ---

  // Recenter on resize
  window.addEventListener('resize', () => {
    if (!windowEl.classList.contains('maximized')) {
      centerWindow(windowEl);
    }
  });

  // Override the default close logic to hide the window
  closeBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation(); // Prevent default close from terminal-ui
    windowEl.style.display = 'none';
    reopenIcon.style.display = 'block';
  });

  // Handle reopening the terminal
  reopenIcon.addEventListener('click', () => {
    windowEl.style.display = 'block';
    reopenIcon.style.display = 'none';
    resetTerminal(terminal); // Reset the terminal state
    hiddenInput.focus(); // Re-focus the hidden input
  });

  console.log('Terminal UI setup complete. Ready for commands!');
});