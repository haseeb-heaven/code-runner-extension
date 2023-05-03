// Brief : This file contains the background script for the extension.
// This uses JDoodle Compiler API to run the code and return the output.
// Author: HeavenHM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === 'runCode') {
    const { languageCode, code, clientId, clientSecret } = request;
    console.log("Running code: ", code, " in language code: ", languageCode);
    const compilerApiUrl = "https://api.jdoodle.com/v1/execute";
    console.log("API URL: ", compilerApiUrl)

    fetch(compilerApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: code,
        language: languageCode,
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
