import { handleCommand } from './terminal-logic.js';

// Initialize input handling for the terminal interface
export function setupInput(hiddenInput, userInputSpan, terminal) {
  // Automatically focus hidden input when the user clicks anywhere on the document
  document.addEventListener('click', () => hiddenInput.focus());

  // Update the visible user input span to reflect typed characters in real time
  hiddenInput.addEventListener('input', (e) => {
    userInputSpan.textContent = e.target.value;
  });

  // Handle Enter key to execute terminal commands
  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return; // Ignore other keys

    const input = e.target.value.trim(); // Get cleaned input

    // Create and echo the typed command to the terminal interface
    const echoed = document.createElement('div');
    echoed.className = 'line';
    echoed.textContent = `$ ${input}`;
    terminal.insertBefore(echoed, terminal.lastElementChild);

    // Process the input and check if the terminal should be cleared
    const { clear } = handleCommand(input, terminal);

    // If command cleared the terminal, reconnect the span reference for input
    if (clear) {
      userInputSpan = document.getElementById('user-input');
    }

    // Reset the hidden input and clear the visible span
    e.target.value = '';
    userInputSpan.textContent = '';
  });
}
