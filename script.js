const outputs = document.querySelectorAll('.output');
let i = 0;
function typeEffect(elem, speed) {
  const text = elem.textContent;
  elem.textContent = '';
  let idx = 0;
  const interval = setInterval(() => {
    if (idx < text.length) {
      elem.textContent += text[idx++];
    } else {
      clearInterval(interval);
    }
  }, speed);
}
outputs.forEach(el => typeEffect(el, 50));
