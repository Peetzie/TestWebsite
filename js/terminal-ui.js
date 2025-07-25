// Drag terminal window via title bar
export function initDrag(windowEl, titleBar) {
  let isDragging = false, dragStartX, dragStartY;

  titleBar.addEventListener('mousedown', (e) => {
    if (windowEl.classList.contains('maximized')) return;
    isDragging = true;
    dragStartX = e.clientX - windowEl.offsetLeft;
    dragStartY = e.clientY - windowEl.offsetTop;
    windowEl.style.position = 'absolute';
    windowEl.style.margin = 0;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      windowEl.style.left = `${e.clientX - dragStartX}px`;
      windowEl.style.top = `${e.clientY - dragStartY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Center terminal in viewport
export function centerWindow(windowEl) {
  windowEl.style.position = 'fixed'; // Ensure positioning is relative to the viewport
  const winW = window.innerWidth, winH = window.innerHeight;
  const elW = windowEl.offsetWidth, elH = windowEl.offsetHeight;
  windowEl.style.left = `${(winW - elW) / 2}px`;
  windowEl.style.top = `${(winH - elH) / 2}px`;
}

// Helper function to type text with animation
export function typeAnimatedText(terminal, text) {
  const response = document.createElement('div');
  response.className = 'line';
  terminal.appendChild(response);
  
  let index = 0;
  const typingSpeed = 30; // milliseconds per character
  
  function typeChar() {
    if (index < text.length) {
      response.textContent += text.charAt(index);
      index++;
      setTimeout(typeChar, typingSpeed);
    }
  }
  
  typeChar();
}

// Helper function to display the welcome message
export function showWelcomeMessage(terminal) {
  const asciiArtLeft = String.raw`
    ______              __          _ __          __                             
   / ____/_______  ____/ /__  _____(_) /__       / /   ____ ______________  ____ 
  / /_  / ___/ _ \/ __  / _ \/ ___/ / //_/      / /   / __ \`/ ___/ ___/ _ \/ __ \
 / __/ / /  /  __/ /_/ /  __/ /  / / ,<        / /___/ /_/ / /  (__  )  __/ / / /
/_/   /_/   \___/\__,_/\___/_/  /_/_/|_|      /_____/\__,_/_/  /____/\___/_/ /_/ 
                                                                                                                                                    
`;
  // TO BE ADDED
  const asciiArtRight = `

`;

  // Create main container for the welcome message
  const welcomeContainer = document.createElement('div');
  welcomeContainer.className = 'welcome-container';

  // --- Left Column ---
  const leftColumn = document.createElement('div');
  leftColumn.className = 'welcome-left';

  const preLeft = document.createElement('pre');
  preLeft.className = 'ascii-art';
  preLeft.textContent = asciiArtLeft;
  leftColumn.appendChild(preLeft);

  const welcomeLines = [
    'Welcome to my interactive terminal!',
    'Type <span class="cmd">help</span> to see a list of available commands.',
    '----------------------------------------------------'
  ];
  welcomeLines.forEach(line => {
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = line;
    leftColumn.appendChild(div);
  });

  // --- Right Column ---
  const rightColumn = document.createElement('pre');
  rightColumn.className = 'welcome-right ascii-art';
  rightColumn.textContent = asciiArtRight;

  // --- Assemble and Append ---
  welcomeContainer.appendChild(leftColumn);
  welcomeContainer.appendChild(rightColumn);
  terminal.appendChild(welcomeContainer);
}

// Window controls: close, minimize, maximize, reopen
export function setupWindowControls(windowEl, closeBtn, minimizeBtn, maximizeBtn, reopenIcon) {
  // For this example, we'll only implement maximize.
  // You can add logic for close and minimize later.

  maximizeBtn.addEventListener('click', () => {
    const isMaximized = windowEl.classList.contains('maximized');

    if (isMaximized) {
      // If it's currently maximized, we want to re-center it after it shrinks.
      // We listen for the transition to end before centering.
      const onTransitionEnd = () => {
        centerWindow(windowEl);
        // Important: Remove the event listener so it doesn't fire again
        windowEl.removeEventListener('transitionend', onTransitionEnd);
      };
      windowEl.addEventListener('transitionend', onTransitionEnd);
    }
    
    // Toggle the class to start the transition (either maximizing or shrinking)
    windowEl.classList.toggle('maximized');
  });

  // Example for a reopen icon if you add minimize functionality
  if (reopenIcon) {
    reopenIcon.addEventListener('click', () => {
      windowEl.style.display = 'flex';
      reopenIcon.style.display = 'none';
    });
  }
}
