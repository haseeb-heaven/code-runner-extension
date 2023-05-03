document.addEventListener('DOMContentLoaded', () => {
    // Your existing popup code
  
    const optionsLink = document.getElementById('options-link');
    optionsLink.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  });
  