document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
  
    const form = document.getElementById('settings-form');
    form.addEventListener('submit', saveOptions);
  });
  
  function saveOptions(e) {
    e.preventDefault();
    
    const apiKey = document.getElementById('api-key').value;
    const apiSecret = document.getElementById('api-secret').value;
    // Check for empty values
    if (!apiKey || !apiSecret) {
        alert('Please enter both API Key and API Secret');
        return;
    }
    
    chrome.storage.sync.set({ apiKey, apiSecret }, () => {
      console.log('Settings saved');
      alert('Settings saved');
    });
  }
  
  function restoreOptions() {
    chrome.storage.sync.get(['apiKey', 'apiSecret'], (result) => {
      if (result.apiKey) {
        document.getElementById('api-key').value = result.apiKey;
      }
  
      if (result.apiSecret) {
        document.getElementById('api-secret').value = result.apiSecret;
      }
    });
  }
  