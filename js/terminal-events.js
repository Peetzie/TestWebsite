import { handleCommand, commandList } from './terminal-logic.js';

// Command history support
export let commandHistory = []; // Export the array
let historyIndex = -1;

// Export a function to reset the command history from other modules
export function resetCommandHistory() {
  commandHistory = [];
  historyIndex = -1;
}

// Initialize input handling for the terminal interface
export function setupInput(hiddenInput, terminal) {
  // Focus the hidden input when the terminal is clicked
  terminal.addEventListener('click', (e) => {
    // Only focus if not clicking on a link or interactive element
    if (!e.target.closest('a, button')) {
      hiddenInput.focus();
    }
  });

  // Update the visible user input span to reflect typed characters in real time
  hiddenInput.addEventListener('input', () => {
    const userInputSpan = document.getElementById('user-input');
    if (userInputSpan) {
      userInputSpan.textContent = hiddenInput.value;
    }
  });

  // Handle keydown for arrows and Enter - make the handler async
  hiddenInput.addEventListener('keydown', async (e) => {
    const userInputSpan = document.getElementById('user-input');

    // Autocomplete with Ctrl+A
    if (e.ctrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const currentInput = hiddenInput.value.trim();
      if (!currentInput) return;

      const allCommands = commandList.map(c => c.cmd);
      const matches = allCommands.filter(c => c.startsWith(currentInput.toLowerCase()));

      if (matches.length === 1) {
        // Single match: complete it
        hiddenInput.value = matches[0] + ' ';
        if (userInputSpan) userInputSpan.textContent = hiddenInput.value;
        setTimeout(() => hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length), 0);
      } else if (matches.length > 1) {
        // Multiple matches: display them
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'line completion-suggestions';
        suggestionsDiv.textContent = matches.join('   ');
        
        const currentPrompt = userInputSpan.closest('.prompt');
        if (currentPrompt) {
          currentPrompt.insertAdjacentElement('beforebegin', suggestionsDiv);
        } else {
          terminal.appendChild(suggestionsDiv);
        }
        terminal.scrollTop = terminal.scrollHeight;
      }
      return;
    }

    // Ctrl+L: Clear the terminal
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      // We can directly call handleCommand to clear the screen
      await handleCommand('clear', terminal);
      hiddenInput.value = ''; // Also clear the hidden input
      return;
    }

    // Up arrow: previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      hiddenInput.value = commandHistory[historyIndex];
      if (userInputSpan) userInputSpan.textContent = hiddenInput.value;
      setTimeout(() => hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length), 0);
      return;
    }

    // Down arrow: next command or clear input
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length === 0 || historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        hiddenInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        hiddenInput.value = '';
      }
      if (userInputSpan) userInputSpan.textContent = hiddenInput.value;
      setTimeout(() => hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length), 0);
      return;
    }

    // Enter: submit command
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = hiddenInput.value.trim();

      // Make the current input line static by removing its ID and cursor
      if (userInputSpan) {
        const oldCursor = userInputSpan.nextElementSibling;
        if (oldCursor && oldCursor.classList.contains('cursor')) {
          oldCursor.remove(); // Remove the old cursor
        }
        userInputSpan.removeAttribute('id');
      }

      // Only process a command if the input is not empty
      if (input !== '') {
        // Await the command handler to get the result and new directory
        const { clear, currentDirectory } = await handleCommand(input, terminal);

        // If the command was 'clear', it handles its own new prompt.
        if (clear) {
          commandHistory.push(input);
          historyIndex = -1;
          hiddenInput.value = '';
          terminal.scrollTop = terminal.scrollHeight;
          return; // Stop here
        }
        
        commandHistory.push(input);
        // After processing, create the new prompt with the updated directory
        createNewPrompt(terminal, currentDirectory);
      } else {
        // For empty commands, get the last directory and create a new prompt
        const lastPromptDir = terminal.querySelector('.line.prompt:last-child .prompt-dir');
        const currentDirText = lastPromptDir ? lastPromptDir.textContent : '~';
        createNewPrompt(terminal, currentDirText.replace('~', '/').replace('//', '/'));
      }

      historyIndex = -1; // Reset history index
      hiddenInput.value = '';
      terminal.scrollTop = terminal.scrollHeight;
    }
  });
}

// Helper function to create a new prompt line
function createNewPrompt(terminal, path) {
  const newPrompt = document.createElement('div');
  newPrompt.className = 'line prompt';
  const dirText = `~${path === '/' ? '' : path}`;
  newPrompt.innerHTML = `
      <span class="prompt-user">guest@peetzie</span><span class="prompt-host">:</span><span class="prompt-dir">${dirText}</span><span class="prompt-symbol">$</span>
      <span id="user-input"></span><span class="cursor">|</span>
    `;
  terminal.appendChild(newPrompt);
}
