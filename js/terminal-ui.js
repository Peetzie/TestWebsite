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
  const winW = window.innerWidth, winH = window.innerHeight;
  const elW = windowEl.offsetWidth, elH = windowEl.offsetHeight;
  windowEl.style.left = `${(winW - elW) / 2}px`;
  windowEl.style.top = `${(winH - elH) / 2}px`;
}

// Window controls: close, minimize, maximize, reopen
export function setupWindowControls(windowEl, closeBtn, minimizeBtn, maximizeBtn, reopenIcon) {
  let previousPosition = { left: null, top: null };

  closeBtn.addEventListener('click', () => {
    windowEl.style.display = 'none';
    reopenIcon.style.display = 'block';
  });

  minimizeBtn.addEventListener('click', () => {
    windowEl.classList.toggle('minimized');
  });

  maximizeBtn.addEventListener('click', () => {
    const isMax = windowEl.classList.contains('maximized');
    windowEl.classList.add('animate');

    if (!isMax) {
      previousPosition.left = windowEl.style.left;
      previousPosition.top = windowEl.style.top;
      windowEl.style.left = '0px';
      windowEl.style.top = '0px';
      windowEl.classList.add('maximized');
    } else {
      windowEl.classList.remove('maximized');
      windowEl.style.left = previousPosition.left || `${(window.innerWidth - windowEl.offsetWidth) / 2}px`;
      windowEl.style.top = previousPosition.top || `${(window.innerHeight - windowEl.offsetHeight) / 2}px`;
    }

    setTimeout(() => windowEl.classList.remove('animate'), 400);
  });

  reopenIcon.addEventListener('click', () => {
    windowEl.style.display = 'block';
    reopenIcon.style.display = 'none';
  });
}
