import { handleCommand } from './terminal-logic.js';

// Command history support
let commandHistory = [];
let historyIndex = -1;

// Initialize input handling for the terminal interface
export function setupInput(hiddenInput, userInputSpan, terminal) {
  // Automatically focus hidden input when the user clicks anywhere on the document
  document.addEventListener('click', () => hiddenInput.focus());

  // Update the visible user input span to reflect typed characters in real time
  hiddenInput.addEventListener('input', (e) => {
    userInputSpan.textContent = e.target.value;
  });

  // Handle keydown for arrows and Enter
  hiddenInput.addEventListener('keydown', (e) => {
    // Up arrow: previous command
    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      hiddenInput.value = commandHistory[historyIndex];
      userInputSpan.textContent = hiddenInput.value;
      // Move cursor to end
      setTimeout(() => hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length), 0);
      e.preventDefault();
      return;
    }

    // Down arrow: next command or clear input
    if (e.key === 'ArrowDown') {
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        hiddenInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        hiddenInput.value = '';
      }
      userInputSpan.textContent = hiddenInput.value;
      setTimeout(() => hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length), 0);
      e.preventDefault();
      return;
    }

    // Enter: submit command
    if (e.key === 'Enter') {
      const input = hiddenInput.value.trim();

      // Process the input and check if the terminal should be cleared
      const { clear } = handleCommand(input, terminal);

      // Only echo the command if the terminal was NOT just cleared by handleCommand
      if (!clear) {
        const echoed = document.createElement('div');
        echoed.className = 'line';
        echoed.textContent = `$ ${input}`;
        terminal.insertBefore(echoed, terminal.lastElementChild);
      }

      // Add to history if not empty
      if (input !== '') {
        commandHistory.push(input);
        historyIndex = -1;
      }

      // If command cleared the terminal, reconnect the span reference for input
      if (clear) {
        userInputSpan = document.getElementById('user-input');
      }

      // Reset the hidden input and clear the visible span
      hiddenInput.value = '';
      userInputSpan.textContent = '';
      e.preventDefault();
    }
  });
}
