const journeyWindow = document.getElementById('journey-window');
const journeyCloseBtn = document.getElementById('journey-close-btn');
const journeyPath = document.getElementById('journey-path');

// Process a terminal command and update the UI with appropriate output
export function handleCommand(input, terminal) {
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

    // Return signal that the terminal was cleared so references can be refreshed
    return { clear: true };
  }
  
 if (input === 'journey') {
  showJourneyWindow();
  return { clear: false };
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

  // Insert the response into the terminal before the prompt line
  terminal.insertBefore(response, terminal.lastElementChild);

  // Return signal indicating no terminal reset occurred
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
      circle.innerHTML = `<strong>${event.title}</strong><div class="circle-desc">${event.description}</div>`;
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