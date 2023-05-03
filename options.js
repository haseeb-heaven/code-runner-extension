document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  const form = document.getElementById('settings-form');
  form.addEventListener('submit', saveOptions);
});

function saveOptions(e) {
  e.preventDefault();

  // Save new settings
  const apiKey = document.getElementById('api-key').value;
  const apiSecret = document.getElementById('api-secret').value;
  const theme = document.getElementById('theme').value;
  const fileName = document.getElementById('file-name').value;
  const fileExtension = document.getElementById('file-extension').value;
  const outputType = document.getElementById('output-type').value;

  // Check for empty values
  if (!apiKey || !apiSecret || !theme || !fileName || !fileExtension || !outputType) {
    alert('Please fill in all the settings fields');
    return;
  }

  chrome.storage.sync.set(
    { apiKey, apiSecret, theme, fileName, fileExtension, outputType },
    () => {
      console.log('Settings saved');
      alert('Settings saved');
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    ['apiKey', 'apiSecret', 'theme', 'fileName', 'fileExtension', 'outputType'],
    (result) => {
      if (result.apiKey) {
        document.getElementById('api-key').value = result.apiKey;
      }

      if (result.apiSecret) {
        document.getElementById('api-secret').value = result.apiSecret;
      }

      if (result.theme) {
        document.getElementById('theme').value = result.theme;
      }

      if (result.fileName) {
        document.getElementById('file-name').value = result.fileName;
      }

      if (result.fileExtension) {
        document.getElementById('file-extension').value = result.fileExtension;
      }

      if (result.outputType) {
        document.getElementById('output-type').value = result.outputType;
      }
    }
  );
}

