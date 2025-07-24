import { resetCommandHistory } from './terminal-events.js'; // Import the new function

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

// Function to reset the terminal to its initial state
export function resetTerminal(terminal) {
  welcomeActive = true;
  terminal.innerHTML = ''; // Clear all content
  showWelcomeMessage(terminal); // Show the welcome message
  resetCommandHistory(); // Reset the command history
  // Add the initial input line back
  const prompt = document.createElement('div');
  prompt.className = 'line';
  prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
  terminal.appendChild(prompt);
}

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

  // If welcome message is active, clear it before processing the command
  if (welcomeActive) {
    clearWelcomeMessage(terminal);
    welcomeActive = false;
  }

  // Handle CV language prompt (this must come before other commands)
  if (awaitingCVLang) {
    awaitingCVLang = false;
    const response = document.createElement('div');
    response.className = 'line';
    if (normalizedInput === 'dk' || normalizedInput === 'danish') {
      response.textContent = 'Downloading Danish CV...';
      downloadFile('assets/CV_DK.pdf');
    } else if (normalizedInput === 'eng' || normalizedInput === 'english') {
      response.textContent = 'Downloading English CV...';
      downloadFile('assets/CV_eng.pdf');
    } else {
      response.textContent = 'Invalid language selection. Please choose either ENG or DK.';
    }
    terminal.insertBefore(response, terminal.lastElementChild);
    return { clear: false, handled: true };
  }

  // --- Main Command Switch ---
  switch (normalizedInput) {
    case 'clear':
      terminal.innerHTML = '';
      const prompt = document.createElement('div');
      prompt.className = 'line';
      prompt.innerHTML = '$ <span id="user-input"></span><span class="cursor">▮</span>';
      terminal.appendChild(prompt);
      return { clear: true }; // Special return for 'clear'

    case 'help':
      const helpLines = [
        'Available commands:', '',
        '<span class="cmd">help</span>      <span class="cmd-desc">Show this help message</span>',
        '<span class="cmd">clear</span>     <span class="cmd-desc">Clear the terminal</span>',
        '<span class="cmd">about me</span>  <span class="cmd-desc">Learn about me and my background</span>',
        '<span class="cmd">linkedin</span>  <span class="cmd-desc">Open my LinkedIn profile</span>',
        '<span class="cmd">github</span>    <span class="cmd-desc">Open my GitHub profile</span>',
        '<span class="cmd">email me</span>  <span class="cmd-desc">Open your email client to contact me</span>',
        '<span class="cmd">journey</span>   <span class="cmd-desc">Show my professional journey</span>',
        '<span class="cmd">cv</span>        <span class="cmd-desc">Download my resume (choose DK or ENG)</span>',
      ];
      helpLines.forEach(line => {
        const helpDiv = document.createElement('div');
        helpDiv.className = 'line';
        helpDiv.innerHTML = line;
        terminal.insertBefore(helpDiv, terminal.lastElementChild);
      });
      break;

    case 'about':
    case 'about me':
      const age = calculateAge('1996-10-17');
      const aboutText =
        `I'm ${age} years old with a Bachelor in Software Technology and a Master's in Human-Centered AI focused on big data. ` +
        `I have over a year of experience at PwC, working at the intersection of data science and IT audits (ISAE 3402/3000). ` +
        `Based in Hedehusene, I enjoy running, cooking, and value an active social life.`;
      typeAnimatedText(terminal, aboutText);
      break;

    case 'linkedin':
      const linkedInResponse = document.createElement('div');
      linkedInResponse.className = 'line';
      linkedInResponse.textContent = 'Opening LinkedIn profile...';
      terminal.insertBefore(linkedInResponse, terminal.lastElementChild);
      setTimeout(() => window.open('https://www.linkedin.com/in/frederikpeetzschoularsen/', '_blank'), 700);
      break;

    case 'email me':
      const emailResponse = document.createElement('div');
      emailResponse.className = 'line';
      emailResponse.textContent = 'Opening your email client...';
      terminal.insertBefore(emailResponse, terminal.lastElementChild);
      setTimeout(() => window.open('mailto:contact.pungent127@silomails.com', '_blank'), 900);
      break;

    case 'github':
      const githubResponse = document.createElement('div');
      githubResponse.className = 'line';
      githubResponse.textContent = 'Opening GitHub profile in a new window...';
      terminal.insertBefore(githubResponse, terminal.lastElementChild);
      setTimeout(() => window.open('https://github.com/Peetzie', '_blank'), 1300);
      break;

    case 'journey':
      showJourneyWindow();
      break;

    case 'cv':
      const cvPrompt = document.createElement('div');
      cvPrompt.className = 'line';
      cvPrompt.innerHTML = 'Which version would you like? (<span class="cmd">DK</span> / <span class="cmd">ENG</span>)';
      terminal.insertBefore(cvPrompt, terminal.lastElementChild);
      awaitingCVLang = true;
      break;

    default:
      // Handle unknown commands
      const defaultResponse = document.createElement('div');
      defaultResponse.className = 'line';
      defaultResponse.textContent = `Command not found: ${input}`;
      terminal.insertBefore(defaultResponse, terminal.lastElementChild);
      break;
  }

  return { clear: false }; // Default return
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

// Helper function to calculate age from birthdate
function calculateAge(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to type text with animation
function typeAnimatedText(terminal, text) {
  const response = document.createElement('div');
  response.className = 'line';
  terminal.insertBefore(response, terminal.lastElementChild);
  
  let index = 0;
  const typingSpeed = 30; // milliseconds per character
  
  function typeNextChar() {
    if (index < text.length) {
      response.textContent += text.charAt(index);
      index++;
      setTimeout(typeNextChar, typingSpeed);
    }
  }
  
  typeNextChar();
}