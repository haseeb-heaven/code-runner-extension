/* Description: This extension is used to save and run code snippets from the Chat-GPT website.
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

// List of themes supported by the extension.
const themes = [
    { name: 'emerald_water', color_fg: '#2ecc71', color_bg: '#2eec7f' },
    { name: 'midnight_sky', color_fg: '#2c3e50', color_bg: '#34495e' },
    { name: 'midnight_plum', color_fg: '#4b0082', color_bg: '#483d8b' },
    { name: 'classic', color_fg: '#808080', color_bg: '#f2f2f2' },
    { name: 'royal_purple', color_fg: '#6A1B9A', color_bg: '#9C27B0' },
    { name: 'sunny_day', color_fg: '#FFEB3B', color_bg: '#FFC107' },
    { name: 'ocean_breeze', color_fg: '#039be5', color_bg: '#03a9f4' },
    { name: 'cherry_blossom', color_fg: '#e91e63', color_bg: '#ff80ab' },
    { name: 'fire_engine', color_fg: '#d50000', color_bg: '#f44336' },
    { name: 'forest_green', color_fg: '#006400', color_bg: '#228B22' }
];


// Method to get the theme code from the theme name.
function getThemeColors(themeName) {
    const theme = themes.find((theme) => theme.name.toLowerCase() === themeName.toLowerCase());
    const themeColors = theme ? [theme.color_fg, theme.color_bg] : ['#2ecc71', '#2eec7f'];
    return themeColors;
}

// Method to convert colour name to hex code.
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
function applyButtonTheme(button, colorStyle = "green", backgroundColorStyle = "gray", rawColorsHex = false, displayStyle = "inline-block") {
    button.classList.add("flex", "ml-auto", "gap-2");
    button.style.padding = "2px 10px";
    button.style.border = "1px solid #fff";
    button.style.borderRadius = "20px";
    button.style.color = rawColorsHex ? colorStyle : colourNameToHex(colorStyle);
    button.style.backgroundColorStyle = rawColorsHex ? backgroundColorStyle : colourNameToHex(backgroundColorStyle);
    button.style.fontWeight = "300";
    button.style.marginRight = "10px";
    button.style.display = displayStyle;
}

// Creating the save and run code buttons.
function createSaveFileButton(colorStyle = "green", backgroundColorStyle = "gray", rawColorsHex = false) {
    const button = document.createElement("button");
    button.textContent = "Save code";
    button.id = "save-code-btn";
    applyButtonTheme(button, colorStyle, backgroundColorStyle, rawColorsHex);
    return button;
}

// Creating Run code button.
function createRunCodeButton(colorStyle = "green", backgroundColorStyle = "gray", rawColorsHex = false) {
    const button = document.createElement("button");
    button.textContent = "Run code";
    button.id = "run-code-btn";
    applyButtonTheme(button, colorStyle, backgroundColorStyle, rawColorsHex);
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
    const defaultFileExtension = getSettings().fileExtension;

    if (copyButton) {
        copyButton.click();
        try {
            const clipboardData = await navigator.clipboard.readText();
            const fileExtension = supportedLanguages[language] || defaultFileExtension;
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

// Helper method to get the data from the storage.
function getFromStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, resolve);
    });
}

// Method to get the settings from the storage.
async function getSettings(initialRun = false) {
    try {
        const { apiKey, apiSecret, theme, fileName, fileExtension, outputType } = await getFromStorage(['apiKey', 'apiSecret', 'theme', 'fileName', 'fileExtension', 'outputType']);

        if (!apiKey || !apiSecret) {
            if (!initialRun) {
                const errorMsg = "Chat-GPT Code Runner:\nAPI Key or Secret not set\nPlease go to extension settings and set them";
                console.error(errorMsg);
                alert(errorMsg);
                throw new Error(errorMsg);
            }
        }

        const settings = {
            clientId: apiKey,
            clientSecret: apiSecret,
            theme,
            fileName,
            fileExtension,
            outputType,
        };
        return settings;

    } catch (error) {
        console.error("Failed to get settings:", error);
    }
}


// Display the output in the code container.
function displayOutput(outputText, language) {
    try {
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
    catch (error) {
        console.error("Error in displayOutput: ", error);
        // Display the output using alert.
        alert(outputText);
    }
}

// Create the output element.
function createOutputElement(text) {
    const outputElement = document.createElement('div');
    outputElement.classList.add('output-text');
    outputElement.textContent = text;
    return outputElement;
}

// Run the code using JDoodle Compiler API.
async function runCode(language, languageCode, code) {
    console.log("Running code: in language: ", language, " with language code: ", languageCode);
    const { clientId, clientSecret, outputType } = await getSettings();

    chrome.runtime.sendMessage({ type: 'runCode', languageCode, code, clientId, clientSecret }, (response) => {
        if (response && response.status === 200) {
            console.log("Response from Compiler: ", response);
            let outputResponse = "Compiler output: \n" + response.output;
            // Print the output with type.
            if (outputType == "codeblock") {
                displayOutput(outputResponse, language);
            }
            else {
                alert(outputResponse);
            }
        } else {
            console.error("Error while running code: ", response.error);
            alert("Error while running code\nPlease check console for more details");
        }
    });
}


// Method to save the code to a file.
async function saveToFile(extension, data) {
    const settings = await getSettings();
    var { fileName, fileExtension } = settings;
    fileExtension = extension || fileExtension;

    const fileNameExtension = fileName + `${fileExtension}`;
    const file = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileNameExtension;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// Add Save and Run Code buttons to all code containers.
async function addButtonToContainers() {
    const containers = document.querySelectorAll('.flex.items-center.relative.text-gray-200.bg-gray-800.px-4.py-2.text-xs.font-sans.justify-between.rounded-t-md');

    // Get the theme settings
    const settings = await getSettings(true);
    var theme = settings.theme;
    theme = theme ? theme : "emerald_water";
    const [fgColor, bgColor] = getThemeColors(theme);

    containers.forEach(container => {
        const existingFileButton = container.querySelector("#save-code-btn");
        if (!existingFileButton) {
            const button = createSaveFileButton(fgColor, bgColor, true);
            container.appendChild(button);
            button.addEventListener("click", () => handleSaveFileClick(container));
        }

        const existingRunCodeButton = container.querySelector("#run-code-btn");
        if (!existingRunCodeButton) {
            const button = createRunCodeButton(fgColor, bgColor, true);
            container.appendChild(button);
            button.addEventListener("click", () => handleRunCodeClick(container));
        }
        const copyButton = container.querySelector('button[class="flex ml-auto gap-2"]');
        applyButtonTheme(copyButton, fgColor, bgColor, true);
        removeSvgIcon();
    });

}

// Add buttons to existing code containers.
//setInterval(addButtonToContainers, 5000);

// Creating the observer to add buttons to new code containers.
const observer = new MutationObserver(addButtonToContainers);
observer.observe(document.body, { childList: true, subtree: true });

