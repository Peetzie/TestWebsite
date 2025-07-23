const windowEl = document.querySelector('.window');
const terminal = document.getElementById('terminal');
const hiddenInput = document.getElementById('hidden-input');
let userInputSpan = document.getElementById('user-input');
const closeBtn = document.getElementById('close-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const reopenIcon = document.getElementById('reopen-icon');



const terminalWindow = document.querySelector('.window');
const titleBar = terminalWindow.querySelector('.title-bar');

let isDragging = false;
let dragStartX, dragStartY;

titleBar.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX - terminalWindow.offsetLeft;
  dragStartY = e.clientY - terminalWindow.offsetTop;
  terminalWindow.style.position = 'absolute'; // ensure positioning
  terminalWindow.style.margin = 0; // reset margin if using flex centering
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    terminalWindow.style.left = `${e.clientX - dragStartX}px`;
    terminalWindow.style.top = `${e.clientY - dragStartY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});




// Focus input on click
document.addEventListener('click', () => hiddenInput.focus());

// Update visible input
hiddenInput.addEventListener('input', (e) => {
  userInputSpan.textContent = e.target.value;
});

// Handle Enter key to process command
hiddenInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = e.target.value.trim();

    // Echo typed command
    const echoed = document.createElement('div');
    echoed.className = 'line';
    echoed.textContent = `$ ${input}`;
    terminal.insertBefore(echoed, terminal.lastElementChild);

    // Command responses
    if (input === 'clear') {
      terminal.innerHTML = '';

      // Re-insert the prompt line
      const prompt = document.createElement('div');
      prompt.className = 'line';
      prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
      terminal.appendChild(prompt);

      // Reconnect span reference
      userInputSpan = document.getElementById('user-input');

      e.target.value = '';
      userInputSpan.textContent = '';
      hiddenInput.focus();

      
    return;
  }

    const response = document.createElement('div');
    response.className = 'line';

    if (input === 'ls') {
      response.textContent = 'file1.txt  file2.csv  notes.md';
    } else if (input === 'pwd') {
      response.textContent = '/home/user/projects';
    } else if (input.startsWith('echo ')) {
      response.textContent = input.slice(5);
    } else if (input === '') {
      response.textContent = '';
    } else {
      response.textContent = `Command not found: ${input}`;
    }

    terminal.insertBefore(response, terminal.lastElementChild);

    e.target.value = '';
    userInputSpan.textContent = '';
  }
});

// Close terminal
closeBtn.addEventListener('click', () => {
  windowEl.style.display = 'none';
  reopenIcon.style.display = 'block';
});

// Minimize terminal
minimizeBtn.addEventListener('click', () => {
  windowEl.classList.toggle('minimized');
});

// Maximize terminal
maximizeBtn.addEventListener('click', () => {
  windowEl.classList.toggle('maximized');
});

// Reopen terminal
reopenIcon.addEventListener('click', () => {
  windowEl.style.display = 'block';
  reopenIcon.style.display = 'none';
});


