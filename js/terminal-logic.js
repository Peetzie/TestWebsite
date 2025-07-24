const journeyWindow = document.getElementById('journey-window');
const journeyCloseBtn = document.getElementById('journey-close-btn');
const journeyPath = document.getElementById('journey-path');

// Command history support
let commandHistory = [];
let historyIndex = -1;

// Listen for keydown events on the document
document.addEventListener('keydown', function(e) {
  const userInput = document.getElementById('user-input');
  if (!userInput || document.activeElement !== userInput) return;

  // Up arrow: show previous command
  if (e.key === 'ArrowUp') {
    if (commandHistory.length === 0) return;
    if (historyIndex === -1) {
      historyIndex = commandHistory.length - 1;
    } else if (historyIndex > 0) {
      historyIndex--;
    }
    userInput.textContent = commandHistory[historyIndex];
    placeCaretAtEnd(userInput);
    e.preventDefault();
  }

  // Down arrow: show next command or clear input
  if (e.key === 'ArrowDown') {
    if (commandHistory.length === 0) return;
    if (historyIndex === -1) return;
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      userInput.textContent = commandHistory[historyIndex];
    } else {
      historyIndex = -1;
      userInput.textContent = '';
    }
    placeCaretAtEnd(userInput);
    e.preventDefault();
  }

  // Enter: submit command
  if (e.key === 'Enter') {
    e.preventDefault();
    const input = userInput.textContent.trim();
    if (input !== '') {
      commandHistory.push(input);
      historyIndex = -1;
      // ...handle the command here...
      // For example:
      // processCommand(input);
    }
    userInput.textContent = '';
  }
});

// Helper to place caret at end of contenteditable
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Track if welcome message is currently shown
let welcomeActive = true;

// Welcome message function
export function showWelcomeMessage(terminal) {
  welcomeActive = true;
  const lines = [
    '<span class="welcome-title">Welcome to Frederik Peetz Schou Larsen\'s Interactive Terminal!</span>',
    '',
    'This terminal lets you explore my professional journey, contact me, and find my profiles.',
    'Type <span class="cmd">help</span> to see all available commands.',
    '',
    'You can use the up/down arrows to browse your command history, just like a real terminal.',
    '',
    'Feel free to look around, and thank you for visiting from LinkedIn, my CV, or elsewhere!'
  ];
  lines.forEach(line => {
    const div = document.createElement('div');
    div.className = 'line welcome-line';
    div.innerHTML = line;
    terminal.appendChild(div);
  });
}

// Helper to clear only the welcome message
function clearWelcomeMessage(terminal) {
  const welcomeLines = terminal.querySelectorAll('.welcome-line');
  welcomeLines.forEach(line => terminal.removeChild(line));
  welcomeActive = false;
}

// Add this variable to track if we're awaiting a CV language selection
let awaitingCVLang = false;

// Process a terminal command and update the UI with appropriate output
export function handleCommand(input, terminal) {
  // Convert all input to lowercase for matching
  const normalizedInput = input.trim().toLowerCase();

  // If welcome message is active, clear the terminal and set up for first command
  if (welcomeActive) {
    terminal.innerHTML = ''; // Clear everything (welcome + prompt)
    welcomeActive = false;

    // Echo the command as the first line
    const echoed = document.createElement('div');
    echoed.className = 'line';
    echoed.textContent = `$ ${input}`;
    terminal.appendChild(echoed);

    // Add the prompt line for next input
    const prompt = document.createElement('div');
    prompt.className = 'line';
    prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
    terminal.appendChild(prompt);

    // Add to history if not empty
    if (input.trim() !== '') {
      commandHistory.push(input);
      historyIndex = -1;
    }

    // Now process the command as if the terminal was just cleared
    // (but don't echo again in the input handler)
    // Handle 'clear' as a special case: don't process further
    if (input === 'clear') {
      return { clear: true };
    }

    // Process the command as normal, but insert output before the prompt
    const response = document.createElement('div');
    response.className = 'line';

    // Special case: if the input is 'clear', reset the terminal content
    if (input === 'clear') {
      terminal.innerHTML = ''; // Remove all existing lines

      // Reinsert the prompt line to keep the terminal functional
      const prompt = document.createElement('div');
      prompt.className = 'line';
      prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
      terminal.appendChild(prompt);

      return { clear: true };
    }

    // New command: open LinkedIn in a new window
    if (input === 'linkedIn') {
      response.textContent = 'Opening LinkedIn profile...';
      terminal.insertBefore(response, terminal.lastElementChild);

      setTimeout(() => {
        window.open('https://www.linkedin.com/in/frederikpeetzschoularsen/', '_blank');
      }, 700); // 700ms delay

      return { clear: false, handled: true }; // Prevent immediate new line
    }

    // New command: open default mail client with your email
    if (input === 'email me') {
      response.textContent = 'Opening your email client...';
      terminal.insertBefore(response, terminal.lastElementChild);

      setTimeout(() => {
        window.open('mailto:contact.pungent127@silomails.com', '_blank');
      }, 900); // 700ms delay

      return { clear: false, handled: true }; // Prevent immediate new line
    }
if (input === 'github') {
  response.textContent = 'Opening GitHub profile in a new window...';
  
  setTimeout(() => {
    window.open('https://github.com/Peetzie', '_blank');
  }, 1300); // Delay to simulate processing time
  terminal.insertBefore(response, terminal.lastElementChild);
  return { clear: false };
}
if (input === 'journey') {
  showJourneyWindow();
  return { clear: false };
}   
    // Help command: show available commands
    if (input === 'help') {
      const helpLines = [
        'Available commands:',
        '',
        '<span class="cmd">help</span>      <span class="cmd-desc">Show this help message</span>',
        '<span class="cmd">clear</span>     <span class="cmd-desc">Clear the terminal</span>',
        '<span class="cmd">linkedIn</span>  <span class="cmd-desc">Open my LinkedIn profile</span>',
        '<span class="cmd">github</span>    <span class="cmd-desc">Open my GitHub profile</span>',
        '<span class="cmd">email me</span>  <span class="cmd-desc">Open your email client to contact me</span>',
        '<span class="cmd">journey</span>   <span class="cmd-desc">Show my professional journey</span>',
        '<span class="cmd">CV</span>        <span class="cmd-desc">Download my resume (choose DK or ENG)</span>',
      ];
      helpLines.forEach(line => {
        const helpDiv = document.createElement('div');
        helpDiv.className = 'line';
        helpDiv.innerHTML = line;
        terminal.insertBefore(helpDiv, terminal.lastElementChild);
      });
      return { clear: true, handled: true };
    }

    // Determine the response content for supported commands or default message
    response.textContent = {
      ls: 'file1.txt  file2.csv  notes.md',            // List mock files
      pwd: '/home/user/projects'                      // Show mock working directory
    }[input] || (                                     // Use matching key if available
      input.startsWith('echo ') ?                     // Echo command: output substring
        input.slice(5) :                              // Remove 'echo ' prefix
        `Command not found: ${input}`                 // Fallback for unknown commands
    );

    terminal.insertBefore(response, terminal.lastElementChild);

    return { clear: true };
  }

  // If we reach here, welcome message is not active, process normally

  // Create a new DOM element to display the command response
  const response = document.createElement('div');
  response.className = 'line';

  // Special case: if the input is 'clear', reset the terminal content
  if (input === 'clear') {
    terminal.innerHTML = ''; // Remove all existing lines

    // Reinsert the prompt line to keep the terminal functional
    const prompt = document.createElement('div');
    prompt.className = 'line';
    prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
    terminal.appendChild(prompt);

    return { clear: true };
  }

  // New command: open LinkedIn in a new window
  if (input === 'linkedIn') {
    response.textContent = 'Opening LinkedIn profile...';
    terminal.insertBefore(response, terminal.lastElementChild);

    setTimeout(() => {
      window.open('https://www.linkedin.com/in/frederikpeetzschoularsen/', '_blank');
    }, 700); // 700ms delay

    return { clear: false, handled: true }; // Prevent immediate new line
  }

  // New command: open default mail client with your email
  if (input === 'email me') {
    response.textContent = 'Opening your email client...';
    terminal.insertBefore(response, terminal.lastElementChild);

    setTimeout(() => {
      window.open('mailto:contact.pungent127@silomails.com', '_blank');
    }, 900); // 700ms delay

    return { clear: false, handled: true }; // Prevent immediate new line
  }
if (input === 'github') {
  response.textContent = 'Opening GitHub profile in a new window...';
  
  setTimeout(() => {
    window.open('https://github.com/Peetzie', '_blank');
  }, 1300); // Delay to simulate processing time
  terminal.insertBefore(response, terminal.lastElementChild);
  return { clear: false };
}
if (input === 'journey') {
  showJourneyWindow();
  return { clear: false };
}   
  // Help command: show available commands
  if (input === 'help') {
    const helpLines = [
      'Available commands:',
      '',
      '<span class="cmd">help</span>      <span class="cmd-desc">Show this help message</span>',
      '<span class="cmd">clear</span>     <span class="cmd-desc">Clear the terminal</span>',
      '<span class="cmd">linkedIn</span>  <span class="cmd-desc">Open my LinkedIn profile</span>',
      '<span class="cmd">github</span>    <span class="cmd-desc">Open my GitHub profile</span>',
      '<span class="cmd">email me</span>  <span class="cmd-desc">Open your email client to contact me</span>',
      '<span class="cmd">journey</span>   <span class="cmd-desc">Show my professional journey</span>',
      '<span class="cmd">CV</span>        <span class="cmd-desc">Download my resume (choose DK or ENG)</span>',
    ];
    helpLines.forEach(line => {
      const helpDiv = document.createElement('div');
      helpDiv.className = 'line';
      helpDiv.innerHTML = line;
      terminal.insertBefore(helpDiv, terminal.lastElementChild);
    });
    return { clear: false, handled: true };
  }

  // Handle CV language prompt
  if (awaitingCVLang) {
    awaitingCVLang = false;
    const response = document.createElement('div');
    response.className = 'line';

    let lang = normalizedInput;
    if (lang === 'dk' || lang === 'danish') {
      response.textContent = 'Downloading Danish CV...';
      terminal.insertBefore(response, terminal.lastElementChild);
      downloadFile('assets/CV_DK.pdf');
    } else {
      response.textContent = 'Downloading English CV...';
      terminal.insertBefore(response, terminal.lastElementChild);
      downloadFile('assets/CV_eng.pdf');
    }
    return { clear: false };
  }

  // CV command: prompt for language
  if (normalizedInput === 'cv') {
    const prompt = document.createElement('div');
    prompt.className = 'line';
    prompt.innerHTML = 'Which version would you like? (<span class="cmd">DK</span> / <span class="cmd">ENG</span>) <span style="color:#888;">[Default: ENG]</span>';
    terminal.insertBefore(prompt, terminal.lastElementChild);
    awaitingCVLang = true;
    return { clear: false, handled: true };
  }

  // Use normalizedInput for all command checks
  if (normalizedInput === 'clear') {
    terminal.innerHTML = '';
    const prompt = document.createElement('div');
    prompt.className = 'line';
    prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
    terminal.appendChild(prompt);
    return { clear: true };
  }

  if (normalizedInput === 'linkedin') {
    const response = document.createElement('div');
    response.className = 'line';
    response.textContent = 'Opening LinkedIn profile...';
    terminal.insertBefore(response, terminal.lastElementChild);

    setTimeout(() => {
      window.open('https://www.linkedin.com/in/frederikpeetzschoularsen/', '_blank');
    }, 700);

    return { clear: false, handled: true };
  }

  if (normalizedInput === 'email me') {
    const response = document.createElement('div');
    response.className = 'line';
    response.textContent = 'Opening your email client...';
    terminal.insertBefore(response, terminal.lastElementChild);

    setTimeout(() => {
      window.open('mailto:contact.pungent127@silomails.com', '_blank');
    }, 900);

    return { clear: false, handled: true };
  }

  if (normalizedInput === 'github') {
    const response = document.createElement('div');
    response.className = 'line';
    response.textContent = 'Opening GitHub profile in a new window...';
    setTimeout(() => {
      window.open('https://github.com/Peetzie', '_blank');
    }, 1300);
    terminal.insertBefore(response, terminal.lastElementChild);
    return { clear: false };
  }

  if (normalizedInput === 'journey') {
    showJourneyWindow();
    return { clear: false };
  }

  if (normalizedInput === 'help') {
    const helpLines = [
      'Available commands:',
      '',
      '<span class="cmd">help</span>      <span class="cmd-desc">Show this help message</span>',
      '<span class="cmd">clear</span>     <span class="cmd-desc">Clear the terminal</span>',
      '<span class="cmd">linkedIn</span>  <span class="cmd-desc">Open my LinkedIn profile</span>',
      '<span class="cmd">github</span>    <span class="cmd-desc">Open my GitHub profile</span>',
      '<span class="cmd">email me</span>  <span class="cmd-desc">Open your email client to contact me</span>',
      '<span class="cmd">journey</span>   <span class="cmd-desc">Show my professional journey</span>',
      '<span class="cmd">CV</span>        <span class="cmd-desc">Download my resume (choose DK or ENG)</span>',
    ];
    helpLines.forEach(line => {
      const helpDiv = document.createElement('div');
      helpDiv.className = 'line';
      helpDiv.innerHTML = line;
      terminal.insertBefore(helpDiv, terminal.lastElementChild);
    });
    return { clear: false, handled: true };
  }

  // Handle CV language prompt
  if (awaitingCVLang) {
    awaitingCVLang = false;
    const response = document.createElement('div');
    response.className = 'line';

    let lang = normalizedInput;
    if (lang === 'dk' || lang === 'danish') {
      response.textContent = 'Downloading Danish CV...';
      terminal.insertBefore(response, terminal.lastElementChild);
      downloadFile('assets/CV_DK.pdf');
    } else {
      response.textContent = 'Downloading English CV...';
      terminal.insertBefore(response, terminal.lastElementChild);
      downloadFile('assets/CV_eng.pdf');
    }
    return { clear: false };
  }

  // CV command: prompt for language
  if (normalizedInput === 'cv') {
    const prompt = document.createElement('div');
    prompt.className = 'line';
    prompt.innerHTML = 'Which version would you like? (<span class="cmd">DK</span> / <span class="cmd">ENG</span>) <span style="color:#888;">[Default: ENG]</span>';
    terminal.insertBefore(prompt, terminal.lastElementChild);
    awaitingCVLang = true;
    return { clear: false, handled: true };
  }

  // Determine the response content for supported commands or default message
  response.textContent = {
    ls: 'file1.txt  file2.csv  notes.md',            // List mock files
    pwd: '/home/user/projects'                      // Show mock working directory
  }[input] || (                                     // Use matching key if available
    input.startsWith('echo ') ?                     // Echo command: output substring
      input.slice(5) :                              // Remove 'echo ' prefix
      `Command not found: ${input}`                 // Fallback for unknown commands
  );

  terminal.insertBefore(response, terminal.lastElementChild);

  return { clear: false };
}

function renderTimeline(events) {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';

  // Add the horizontal center line
  const centerLine = document.createElement('div');
  centerLine.className = 'timeline-center-line';
  timeline.appendChild(centerLine);

  // Wait for the center line animation to finish before adding events
  // The drawLine animation is 1.2s, so use setTimeout for 1.2s
  setTimeout(() => {
    events.forEach((event, i) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'timeline-event ' + (i % 2 === 0 ? 'up' : 'down');
      eventDiv.style.flex = '1 1 0';

      // Vertical line from center line to circle
      const vert = document.createElement('div');
      vert.className = 'timeline-vert';
      vert.style.animationDelay = `${i * 0.25}s`;

      // Circle with only the main title by default
      const circle = document.createElement('div');
      circle.className = 'timeline-circle';
      circle.innerHTML = `
  <strong>${event.title}</strong>
  <div class="circle-desc">${event.description}</div>
`;
      circle.querySelector('.circle-desc').style.display = 'none';

      // Show description and enlarge on hover
      circle.addEventListener('mouseenter', function() {
        this.classList.add('enlarged');
        this.querySelector('.circle-desc').style.display = 'block';
      });
      circle.addEventListener('mouseleave', function() {
        this.classList.remove('enlarged');
        this.querySelector('.circle-desc').style.display = 'none';
      });

      // Build event structure
      if (i % 2 === 0) {
        // Up: vertical line below, circle above
        eventDiv.appendChild(circle);
        eventDiv.appendChild(vert);
      } else {
        // Down: vertical line above, circle below
        eventDiv.appendChild(vert);
        eventDiv.appendChild(circle);
      }

      // Stagger the appearance of each event
      eventDiv.style.opacity = '0';
      eventDiv.style.transition = 'opacity 0.4s';

      setTimeout(() => {
        eventDiv.style.opacity = '1';
      }, i * 250);

      timeline.appendChild(eventDiv);
    });
  }, 1200); // Wait for center line animation (1.2s)
}

// Show the Journey window
export function showJourneyWindow() {
  if (journeyWindow) {
    journeyWindow.style.display = 'block';

    // Add animated timeline with your highlights
    const journeyContent = journeyWindow.querySelector('.journey-content');
    journeyContent.innerHTML = '<div class="timeline" id="timeline"></div>';
    const events = [
      {
        title: 'Lidl \n September 2017 - September 2021',
        description: 'Butiksassistent'
      },
      {
        title: 'Københavns Kommune \n November 2021 - November 2022',
        description: 'Teknisk Servicemedarbejder'
      },
      {
        title: 'PwC Denmark \n March 2022 - October 2023',
        description: 'Student Assistant IT'
      },
      {
        title: 'PwC Denmark \n October 2023 - August 2024',
        description: 'Student assistant | Risk assurance | Digital Trust'
      },
      {
        title: 'PwC Denmark \n August 2024 - Present',
        description: 'Full time consultant | Risk assurance | Digital trust | Data analytics & Assurance'
      }
    ];
    renderTimeline(events);
  }
}

// Hide the Journey window when close button is clicked
if (journeyCloseBtn) {
  journeyCloseBtn.addEventListener('click', () => {
    journeyWindow.style.display = 'none';
  });
}

// Helper function to trigger file download
function downloadFile(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = url.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}