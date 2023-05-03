// Brief : This file contains the background script for the extension.
// This uses JDoodle Compiler API to run the code and return the output.
// Author: HeavenHM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === 'runCode') {
    const { language, code, clientId, clientSecret } = request;
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = corsProxy + "https://api.jdoodle.com/v1/execute";
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        language: language,
        versionIndex: '0',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.output) {
          console.log('Service worker sending response:', data.output);
          sendResponse(data.output);
        } else {
          console.error('Unexpected API response:', data);
        }
      })
      .catch((error) => {
        console.error('Error while fetching data from JDoodle API', error);
      });

    return true; // Indicate that the response will be sent asynchronously
  }
});
