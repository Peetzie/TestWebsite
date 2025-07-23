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
