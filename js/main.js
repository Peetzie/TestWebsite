import { initDrag, centerWindow, setupWindowControls } from './terminal-ui.js';
import { setupInput } from './terminal-events.js';
const journeyWindow = document.getElementById('journey-window');
const journeyPath = document.getElementById('journey-path');
const windowEl = document.querySelector('.window');
const titleBar = windowEl.querySelector('.title-bar');
const terminal = document.getElementById('terminal');
const closeBtn = document.getElementById('close-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const reopenIcon = document.getElementById('reopen-icon');

const hiddenInput = document.getElementById('hidden-input');
let userInputSpan = document.getElementById('user-input');

console.log('Initializing terminal UI...');

window.addEventListener('load', () => {
  centerWindow(windowEl);
});

window.addEventListener('resize', () => {
  if (!windowEl.classList.contains('maximized')) {
    centerWindow(windowEl);
  }
});

initDrag(windowEl, titleBar);

setupInput(hiddenInput, userInputSpan, terminal);
setupWindowControls(windowEl, closeBtn, minimizeBtn, maximizeBtn, reopenIcon);

console.log('Terminal UI setup complete.. Ready for commands!');