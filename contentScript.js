/* Description: This extension is used to save and run code snippets from the Chat-GPT-3 website.
It uses JDoodle Compiler API to run the code and display the output.
Author : HeavenHM.
Date : 03/05/2023 */

// List of supported languages and their file extensions.
const supportedLanguages = {
    "javascript": ".js",
    "html": ".html",
    "css": ".css",
    "python": ".py",
    "java": ".java",
    "c": ".c",
    "cpp": ".cpp",
    "php": ".php",
    "ruby": ".rb",
    "swift": ".swift",
    "typescript": ".ts",
    "go": ".go",
    "kotlin": ".kt",
    "rust": ".rs",
    "scala": ".scala",
    "perl": ".pl",
    "lua": ".lua",
    "objective-c": ".m",
    "shell": ".sh",
    "sql": ".sql",
    "visual basic": ".vb",
    "c#": ".cs",
    "f#": ".fs",
    "haskell": ".hs",
};

// List of language codes supported by JDoodle Compiler API.
const languageCodes = {
    "c++": "cpp17",
    "cpp": "cpp14",
    "cs": "csharp",
    "objective-c": "objc",
    "javascript": "nodejs",
    "python": "python3",
    "basic":"freebasic",
};

// Creating Save and Run Code buttons.
function createSaveFileButton() {
    const button = document.createElement("button");
    button.textContent = "Save Code";
    button.id = "save-code-btn";
    button.style.padding = "2px 10px";
    button.style.border = "none";
    button.style.borderRadius = "20px";
    button.style.color = "#fff";
    button.style.backgroundColor = "#28a745";
    button.style.fontWeight = "300";
    button.style.marginRight = "10px";
    button.style.display = "inline-block";
    return button;
}

function createRunCodeButton() {
    const button = document.createElement("button");
    button.textContent = "Run Code";
    button.id = "run-code-btn";
    button.style.padding = "2px 10px";
    button.style.border = "none";
    button.style.borderRadius = "20px";
    button.style.color = "#fff";
    button.style.backgroundColor = "#007bff";
    button.style.fontWeight = "300";
    button.style.marginRight = "10px";
    button.style.display = "inline-block";
    return button;
}

// Creating the handler for save and run code buttons.
async function handleSaveFileClick(container) {
    const copyButton = container.querySelector('button[class="flex ml-auto gap-2"]');
    const languageSpan = container.querySelector("span");
    const language = languageSpan ? languageSpan.textContent.trim() : "";

    if (copyButton) {
        copyButton.click();
        try {
            const clipboardData = await navigator.clipboard.readText();
            const fileExtension = supportedLanguages[language] || ".txt";
            saveToFile(fileExtension, clipboardData);
        } catch (err) {
            console.error("Failed to read clipboard data:", err);
        }
    }
}

async function saveToFile(extension, data) {
    const fileName = `code${extension}`;
    const file = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

async function handleRunCodeClick(container) {
    const copyButton = container.querySelector('button[class="flex ml-auto gap-2"]');
    const languageSpan = container.querySelector("span");
    var language = languageSpan ? languageSpan.textContent.trim() : "";
    var languageCode = language;

    // check if language is langCode 
    if (language in languageCodes) {
        languageCode = languageCodes[language];
    }

    if (copyButton) {
        copyButton.click();
        try {
            const clipboardData = await navigator.clipboard.readText();
            runCode(language,languageCode,clipboardData);
        } catch (err) {
            console.error("Failed to read clipboard data:", err);
        }
    }
}

function displayOutput(outputText, language) {
    const containers = document.querySelectorAll('.p-4.overflow-y-auto');
    containers.forEach(container => {
        const languageClass = `language-${language}`;
        const hasLanguageChild = container.querySelector(`.\\!whitespace-pre.hljs.${languageClass}`);

        if (hasLanguageChild) {
            const existingOutputElement = container.querySelector(".output-text");
            if (!existingOutputElement) {
                const outputElement = createOutputElement(outputText);
                container.appendChild(outputElement);
            } else {
                existingOutputElement.textContent = outputText;
            }
        }
    });
}

function createOutputElement(text) {
    const outputElement = document.createElement('div');
    outputElement.classList.add('output-text');
    outputElement.textContent = text;
    return outputElement;
}

// Run the code using JDoodle Compiler API.
async function runCode(language,languageCode,code) {
    const clientId = "693e67ab032c13c90ff01e3dca2c6117";
    const clientSecret = "c8870a789a35e4882de3b383789e08011a1456e88dc5889261748d4b01d4a79d";
    console.log("Running code: ", code, " in language: ", language , " with language code: ", languageCode);

    try {
        chrome.runtime.sendMessage({ type: 'runCode', languageCode, code, clientId, clientSecret }, (response) => {
            // Check if repsone is valid
            if (!response) {
                console.error("Response from Compiler API is invalid");
                return;
            }
            else if (response.error) {
                console.error("Error from Compiler API: ", response.error);
                return;
            }
            else {
                console.log("Response from Compiler API: ", response);
                let outputResponse = "Compiler output: \n" + response;
                displayOutput(outputResponse,language);
            }
        });
    } catch (error) {
        console.error('Error while fetching data from JDoodle API', error);
    }
}

// Add Save and Run Code buttons to all code containers.
function addButtonToContainers() {
    const containers = document.querySelectorAll('.flex.items-center.relative.text-gray-200.bg-gray-800.px-4.py-2.text-xs.font-sans.justify-between.rounded-t-md');
    containers.forEach(container => {
        const existingFileButton = container.querySelector("#save-code-btn");
        if (!existingFileButton) {
            const button = createSaveFileButton();
            container.appendChild(button);
            button.addEventListener("click", () => handleSaveFileClick(container));
        }

        const existingRunCodeButton = container.querySelector("#run-code-btn");
        if (!existingRunCodeButton) {
            const button = createRunCodeButton();
            container.appendChild(button);
            button.addEventListener("click", () => handleRunCodeClick(container));
        }
    });
}

// Add buttons to existing code containers.
setInterval(addButtonToContainers, 3000);

// Creating the observer to add buttons to new code containers.
const observer = new MutationObserver(addButtonToContainers);
observer.observe(document.body, { childList: true, subtree: true });

