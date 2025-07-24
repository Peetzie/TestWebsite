import { showWelcomeMessage, typeAnimatedText } from './terminal-ui.js';
// Import commandHistory to be used by the 'history' command
import { resetCommandHistory, commandHistory } from './terminal-events.js';

// Centralized command list for help and autocomplete
export const commandList = [
  { cmd: '.', desc: 'Open the source code repository from current directory' },
  { cmd: 'about', desc: 'Learn about me and my background' },
  { cmd: 'cat', desc: 'Display content of a file (e.g., cat README.md)' },
  { cmd: 'cd', desc: 'Change directory (e.g., cd js, cd ..)' },
  { cmd: 'clear', desc: 'Clear the terminal' },
  { cmd: 'echo', desc: 'Print text to the terminal' },
  { cmd: 'education', desc: 'Show my educational background' },
  { cmd: 'email', desc: 'Open your email client to contact me' },
  { cmd: 'github', desc: 'Open my GitHub profile' },
  { cmd: 'help', desc: 'Show this help message' },
  { cmd: 'history', desc: 'Show command history' },
  { cmd: 'journey', desc: 'Show my professional journey' },
  { cmd: 'linkedin', desc: 'Open my LinkedIn profile' },
  { cmd: 'ls', desc: 'List directory contents' },
  { cmd: 'pwd', desc: 'Print current working directory' },
  { cmd: 'themes', desc: 'Change the terminal theme (coming soon)' },
  { cmd: 'welcome', desc: 'Display the welcome message' },
  { cmd: 'whoami', desc: 'Display the current user' },
];

let currentDirectory = '/'; // Initial directory
const fileSystemCache = new Map(); // Cache for API responses

// --- GitHub API Helper ---
async function getDirectoryContents(path) {
  if (fileSystemCache.has(path)) {
    return fileSystemCache.get(path);
  }
  try {
    const response = await fetch(`https://api.github.com/repos/Peetzie/TestWebsite/contents${path}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    fileSystemCache.set(path, data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- GitHub API Helper for Files ---
async function getFileContent(path) {
  if (fileSystemCache.has(path)) {
    const cachedData = fileSystemCache.get(path);
    // Ensure we're not returning directory data from cache
    if (cachedData.content) {
      try {
        return atob(cachedData.content);
      } catch (e) {
        console.error('Error decoding cached content:', e);
        return 'Error: Could not decode file content.';
      }
    }
  }
  try {
    const response = await fetch(`https://api.github.com/repos/Peetzie/TestWebsite/contents${path}`);
    if (!response.ok) {
      return null; // File not found or other error
    }
    const data = await response.json();
    if (data.type !== 'file' || !data.content) {
      return null; // It's a directory or has no content
    }
    fileSystemCache.set(path, data); // Cache the raw response
    return atob(data.content); // Decode base64 content
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Add the missing resetTerminal function and export it
export function resetTerminal(terminal) {
  // Clear existing content
  terminal.innerHTML = '';
  
  // Show the welcome message
  showWelcomeMessage(terminal);
  
  // Reset command history
  resetCommandHistory();
  
  // Reset directory state
  currentDirectory = '/';
  fileSystemCache.clear();
  
  // Create the initial prompt
  const prompt = document.createElement('div');
  prompt.className = 'line prompt';
  prompt.innerHTML = `
    <span class="prompt-user">guest@peetzie</span><span class="prompt-host">:</span><span class="prompt-dir">~${currentDirectory === '/' ? '' : currentDirectory}</span><span class="prompt-symbol">$</span>
    <span id="user-input"></span><span class="cursor">|</span>
  `;
  terminal.appendChild(prompt);
}

// Main command handler
export async function handleCommand(input, terminal) {
  const trimmedInput = input.trim();
  const [command, ...args] = trimmedInput.split(' ');
  const normalizedCommand = command.toLowerCase();

  // --- Main Command Switch ---
  switch (normalizedCommand) {
    case '.':
      const repoResponse = document.createElement('div');
      repoResponse.className = 'line';
      repoResponse.textContent = `Opening directory '${currentDirectory}' in repository...`;
      terminal.appendChild(repoResponse);
      // Construct the URL based on the current directory
      const repoUrl = `https://github.com/Peetzie/TestWebsite/tree/main${currentDirectory}`;
      setTimeout(() => window.open(repoUrl, '_blank'), 700);
      break;

    case 'ls':
      const contents = await getDirectoryContents(currentDirectory);
      if (contents) {
        contents.forEach(item => {
          const itemLine = document.createElement('div');
          itemLine.className = 'line';
          if (item.type === 'dir') {
            itemLine.innerHTML = `<span class="dir">${item.name}</span>`;
          } else {
            itemLine.textContent = item.name;
          }
          terminal.appendChild(itemLine);
        });
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'line';
        errorLine.textContent = 'Error: Could not list directory contents.';
        terminal.appendChild(errorLine);
      }
      break;

    case 'cat':
      const fileName = args[0];
      if (!fileName) {
        const errorLine = document.createElement('div');
        errorLine.className = 'line';
        errorLine.textContent = 'cat: missing operand';
        terminal.appendChild(errorLine);
        break;
      }

      const filePath = currentDirectory === '/' ? `/${fileName}` : `${currentDirectory}/${fileName}`;
      const fileContent = await getFileContent(filePath);

      if (fileContent !== null) {
        const contentPre = document.createElement('pre');
        contentPre.className = 'line file-content';
        contentPre.textContent = fileContent;
        terminal.appendChild(contentPre);
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'line';
        errorLine.textContent = `cat: ${fileName}: No such file or directory`;
        terminal.appendChild(errorLine);
      }
      break;

    case 'cd':
      const targetDir = args[0] || '/';
      let newPath;

      if (targetDir === '..') {
        newPath = currentDirectory.substring(0, currentDirectory.lastIndexOf('/')) || '/';
      } else if (targetDir.startsWith('/')) {
        newPath = targetDir;
      } else {
        newPath = currentDirectory === '/' ? `/${targetDir}` : `${currentDirectory}/${targetDir}`;
      }

      // Verify the new path is a directory
      const parentPath = newPath.substring(0, newPath.lastIndexOf('/')) || '/';
      const dirName = newPath.substring(newPath.lastIndexOf('/') + 1);
      const parentContents = await getDirectoryContents(parentPath);
      const targetIsDirectory = parentContents && parentContents.find(item => item.name === dirName && item.type === 'dir');

      if (newPath === '/' || targetIsDirectory) {
        currentDirectory = newPath;
      } else {
        const errorLine = document.createElement('div');
        errorLine.className = 'line';
        errorLine.textContent = `cd: no such file or directory: ${targetDir}`;
        terminal.appendChild(errorLine);
      }
      break;

    case 'clear':
      terminal.innerHTML = '';
      const prompt = document.createElement('div');
      prompt.className = 'line prompt';
      prompt.innerHTML = `
        <span class="prompt-user">guest@peetzie</span><span class="prompt-host">:</span><span class="prompt-dir">~${currentDirectory === '/' ? '' : currentDirectory}</span><span class="prompt-symbol">$</span>
        <span id="user-input"></span><span class="cursor">|</span>
      `;
      terminal.appendChild(prompt);
      return { clear: true }; // Special return for 'clear'

    case 'help':
      const title = document.createElement('div');
      title.className = 'line';
      title.textContent = 'Available commands:';
      terminal.appendChild(title);
      terminal.appendChild(document.createElement('br')); // For a blank line

      commandList.forEach(({ cmd, desc }) => {
        const helpDiv = document.createElement('div');
        helpDiv.className = 'line help-line';
        helpDiv.innerHTML = `
          <span class="cmd">${cmd}</span>
          <span class="cmd-desc">* ${desc}</span>
        `;
        terminal.appendChild(helpDiv);
      });

      const tipContainer = document.createElement('div');
      tipContainer.className = 'line';
      tipContainer.style.marginTop = '1em'; // Add some space before the tips
      tipContainer.innerHTML = `
        <div class="line pro-tip">✨ Pro-Tip: Use <span class="cmd">Ctrl+L</span> to clear the terminal screen.</div>
      `;
      terminal.appendChild(tipContainer);
      
      break;

    case 'history':
      commandHistory.forEach((cmd, i) => {
        const historyLine = document.createElement('div');
        historyLine.className = 'line';
        historyLine.innerHTML = `<span style="color: var(--comment);">${i + 1}</span>&nbsp;&nbsp;${cmd}`;
        terminal.appendChild(historyLine);
      });
      break;

    case 'github':
      const githubResponse = document.createElement('div');
      githubResponse.className = 'line';
      githubResponse.textContent = 'Opening GitHub profile in a new window...';
      terminal.appendChild(githubResponse);
      setTimeout(() => window.open('https://github.com/Peetzie', '_blank'), 1300);
      break;

    case 'journey':
      const journeyWindow = document.getElementById('journey-window');
      if (journeyWindow) journeyWindow.style.display = 'flex';
      break;

    case 'linkedin':
      const linkedInResponse = document.createElement('div');
      linkedInResponse.className = 'line';
      linkedInResponse.textContent = 'Opening LinkedIn profile...';
      terminal.appendChild(linkedInResponse);
      setTimeout(() => window.open('https://www.linkedin.com/in/frederikpeetzschoularsen/', '_blank'), 700);
      break;

    case 'pwd':
      const pwdLine = document.createElement('div');
      pwdLine.className = 'line';
      pwdLine.textContent = 'home/guest' + currentDirectory;
      terminal.appendChild(pwdLine);
      break;

    case 'themes':
      const themeLine = document.createElement('div');
      themeLine.className = 'line';
      themeLine.textContent = 'Theme switching functionality is coming soon!';
      terminal.appendChild(themeLine);
      break;

    case 'welcome':
      showWelcomeMessage(terminal);
      break;

    case 'whoami':
      const whoamiLine = document.createElement('div');
      whoamiLine.className = 'line';
      whoamiLine.textContent = 'guest';
      terminal.appendChild(whoamiLine);
      break;

    default:
      // Handle multi-word commands that might have been missed
      if (trimmedInput.toLowerCase() === 'about me') {
        const age = calculateAge('1996-10-17');
        const aboutText =
          `I'm ${age} years old with a Bachelor in Software Technology and a Master's in Human-Centered AI focused on big data. ` +
          `I have over a year of experience at PwC, working at the intersection of data science and IT audits (ISAE 3402/3000). ` +
          `Based in Hedehusene, I enjoy running, cooking, and value an active social life.`;
        typeAnimatedText(terminal, aboutText);
        break;
      }
      // Handle unknown commands
      const defaultResponse = document.createElement('div');
      defaultResponse.className = 'line';
      defaultResponse.textContent = `Command not found: ${trimmedInput}`;
      terminal.appendChild(defaultResponse);
      break;
  }

  // --- Final Return ---
  // Return the outcome and the current state of the directory
  return { clear: false, currentDirectory };
}

// Helper function to calculate age
function calculateAge(birthDateString) {
  const birth = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}