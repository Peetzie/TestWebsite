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
let previousPosition = { left: null, top: null };
let isDragging = false;
let dragStartX, dragStartY;

titleBar.addEventListener('mousedown', (e) => {
  if (terminalWindow.classList.contains('maximized')) return;
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

// === Center terminal on page load ===
function centerTerminal() {
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const elWidth = windowEl.offsetWidth;
  const elHeight = windowEl.offsetHeight;
  
  windowEl.style.left = `${(winWidth - elWidth) / 2}px`;
  windowEl.style.top = `${(winHeight - elHeight) / 2}px`;
}

window.addEventListener('load', centerTerminal);
window.addEventListener('resize', () => {
  if (!windowEl.classList.contains('maximized')) {
    centerTerminal();
  }
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

maximizeBtn.addEventListener('click', () => {
  const isMax = windowEl.classList.contains('maximized');

  windowEl.classList.add('animate'); // enable animation

  if (!isMax) {
    previousPosition.left = windowEl.style.left;
    previousPosition.top = windowEl.style.top;
    windowEl.style.left = '0px';
    windowEl.style.top = '0px';
    windowEl.classList.add('maximized');
  } else {
    windowEl.classList.remove('maximized');
    windowEl.style.left = previousPosition.left || `${(window.innerWidth - windowEl.offsetWidth) / 2}px`;
    windowEl.style.top = previousPosition.top || `${(window.innerHeight - windowEl.offsetHeight) / 2}px`;
  }

  // Remove animation after transition ends to avoid affecting drag
  setTimeout(() => {
    windowEl.classList.remove('animate');
  }, 400); // match transition duration
});

// Reopen terminal
reopenIcon.addEventListener('click', () => {
  windowEl.style.display = 'block';
  reopenIcon.style.display = 'none';
});


