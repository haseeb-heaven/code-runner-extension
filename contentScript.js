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
    "c++": ".cpp",
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
    "csharp": ".cs",
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
    "basic": "freebasic",
};

// Create a method which takes color name and returns hex code.
function colourNameToHex(colour) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const colorHex = "#" + data[0].toString(16).padStart(2, '0') +
        data[1].toString(16).padStart(2, '0') +
        data[2].toString(16).padStart(2, '0');
    return colorHex;
}

// Utility function to apply the same theme to buttons

function applyButtonTheme(button, colorStyle = "green", backgroundColorStyle = "gray", displayStyle = "inline-block") {
    button.classList.add("flex", "ml-auto", "gap-2");
    button.style.padding = "2px 10px";
    button.style.border = "1px solid #fff";
    button.style.borderRadius = "20px";
    button.style.color = colourNameToHex(colorStyle);
    button.style.backgroundColorStyle = colourNameToHex(backgroundColorStyle);
    button.style.fontWeight = "300";
    button.style.marginRight = "10px";
    button.style.display = displayStyle;
}

// Creating the save and run code buttons.
function createSaveFileButton() {
    const button = document.createElement("button");
    button.textContent = "Save code";
    button.id = "save-code-btn";
    applyButtonTheme(button, "green", "gray");
    return button;
}

function createRunCodeButton() {
    const button = document.createElement("button");
    button.textContent = "Run code";
    button.id = "run-code-btn";
    applyButtonTheme(button);
    return button;
}

// Removing the SVG icon from the Copy button.
function removeSvgIcon() {
    const svgIcon = document.querySelector('button.flex.ml-auto.gap-2 svg');
    if (svgIcon) {
        svgIcon.parentNode.removeChild(svgIcon);
    }
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

// Handle the run code button click.
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
            runCode(language, languageCode, clipboardData);
        } catch (err) {
            console.error("Failed to read clipboard data:", err);
        }
    }
}

// Display the output in the code container.
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

// Create the output element.
function createOutputElement(text) {
    const outputElement = document.createElement('div');
    outputElement.classList.add('output-text');
    outputElement.textContent = text;
    return outputElement;
}

// Get the Api Key and Secret from the storage.
async function getApiKeyAndSecret() {
    try {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['apiKey', 'apiSecret'], (result) => {
                if (!result.apiKey || !result.apiSecret) {
                    const errorMsg = "API Key or Secret not set\nPlease go to extension options and set them";
                    console.error(errorMsg);
                    alert(errorMsg);
                    reject(new Error(errorMsg));
                } else {
                    resolve({ clientId: result.apiKey, clientSecret: result.apiSecret });
                }
            });
        });
    } catch (error) {
        console.error("Error while getting API Key and Secret: ", error.errorMsg);
        alert("Error while getting API Key and Secret\nPlease check console for more details");
    }
}

// Run the code using JDoodle Compiler API.
async function runCode(language, languageCode, code) {
    console.log("Running code: ", code, " in language: ", language, " with language code: ", languageCode);
    const { clientId, clientSecret } = await getApiKeyAndSecret();

    chrome.runtime.sendMessage({ type: 'runCode', languageCode, code, clientId, clientSecret }, (response) => {
        if (response && response.status === 200) {
            console.log("Response from Compiler: ", response);
            let outputResponse = "Compiler output: \n" + response;
            displayOutput(outputResponse, language);
        } else {
            console.error("Error while running code: ", response.error);
            alert("Error while running code\nPlease check console for more details");
        }
    });
}


// Method to save the code to a file.
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
        const copyButton = container.querySelector('button[class="flex ml-auto gap-2"]');
        applyButtonTheme(copyButton);
        removeSvgIcon();
    });

}

// Add buttons to existing code containers.
//setInterval(addButtonToContainers, 5000);

// Creating the observer to add buttons to new code containers.
const observer = new MutationObserver(addButtonToContainers);
observer.observe(document.body, { childList: true, subtree: true });

