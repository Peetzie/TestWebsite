const journeyCloseBtn = document.getElementById('close-btn-journey');

if (journeyCloseBtn) {
  journeyCloseBtn.addEventListener('click', () => {
    const journeyWindow = document.getElementById('journey-window');
    if (journeyWindow) {
      journeyWindow.style.display = 'none';
    }
  });
}
