// Get form elements
const descriptionInput = document.getElementById("description");
const hoursInput = document.getElementById("hours");
const linksInput = document.getElementById("links");
const learningsInput = document.getElementById("learnings");
const blockersInput = document.getElementById("blockers");
const skillsInput = document.getElementById("skills");
const fillBtn = document.getElementById("fillBtn");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

// New AI elements
const apiKeyInput = document.getElementById("apiKey");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const promptInput = document.getElementById("prompt");
const aiGenerateBtn = document.getElementById("aiGenerateBtn");

// Load saved data when popup opens
chrome.storage.local.get(["formData", "geminiApiKey"], (result) => {
  if (result.formData) {
    const data = result.formData;
    descriptionInput.value = data.description || "";
    hoursInput.value = data.hours || "3";
    linksInput.value = data.links || "";
    learningsInput.value = data.learnings || "";
    blockersInput.value = data.blockers || "";
    skillsInput.value = data.skills || "";
  }

  // Load saved API key
  if (result.geminiApiKey) {
    apiKeyInput.value = result.geminiApiKey;
  }
});

// Show status message
function showStatus(message, isSuccess = true) {
  status.textContent = message;
  status.className = `status ${isSuccess ? "success" : "error"} show`;
  setTimeout(() => {
    status.classList.remove("show");
  }, 3000);
}

function showStatusHtml(message, isSuccess = true) {
  status.innerHTML = message;
  status.className = `status ${isSuccess ? "success" : "error"} show`;
  setTimeout(() => {
    status.classList.remove("show");
  }, 5000);
}

// Save button - Save data to storage
saveBtn.addEventListener("click", () => {
  const formData = {
    description: descriptionInput.value,
    hours: hoursInput.value,
    links: linksInput.value,
    learnings: learningsInput.value,
    blockers: blockersInput.value,
    skills: skillsInput.value,
  };

  chrome.storage.local.set({ formData }, () => {
    showStatus("✓ Data saved successfully!", true);
  });
});

// Save API Key button
saveKeyBtn.addEventListener("click", () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showStatus("⚠ Please enter an API key", false);
    return;
  }

  chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
    showStatus("✓ API key saved successfully!", true);
    apiKeyInput.type = "password"; // Hide the key after saving
  });
});

// AI Generate button - Generate form data using Gemini
aiGenerateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  // Validate inputs
  if (!apiKey) {
    showStatus("⚠ Please enter your Gemini API key first", false);
    apiKeyInput.focus();
    return;
  }

  if (!prompt) {
    showStatus("⚠ Please enter a work description", false);
    promptInput.focus();
    return;
  }

  // Disable button and show loading
  aiGenerateBtn.disabled = true;
  const originalText = aiGenerateBtn.innerHTML;
  aiGenerateBtn.innerHTML = '<span class="loading"></span> Generating...';

  try {
    // Call Gemini API
    const formData = await generateFormDataWithGemini(prompt, apiKey);

    // Populate form fields with AI-generated data
    descriptionInput.value = formData.description || "";
    hoursInput.value = formData.hours || "6";
    linksInput.value = formData.links || "";
    learningsInput.value = formData.learnings || "";
    blockersInput.value = formData.blockers || "";
    skillsInput.value = formData.skills || "";

    showStatus("✓ AI generated form data successfully!", true);

    // Auto-save the generated data
    chrome.storage.local.set({ formData }, () => {
      console.log("AI-generated data saved");
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    let errorMessage = "⚠ Failed to generate: " + error.message;

    if (error.message.includes("API key")) {
      errorMessage = "⚠ Invalid API key. Please check your key.";
    } else if (error.message.includes("quota")) {
      errorMessage = "⚠ API quota exceeded. Try again later.";
    }

    showStatus(errorMessage, false);
  } finally {
    // Re-enable button
    aiGenerateBtn.disabled = false;
    aiGenerateBtn.innerHTML = originalText;
  }
});

// Fill button - Fill the form on the page
fillBtn.addEventListener("click", async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Prepare data to send
  const formData = {
    description: descriptionInput.value,
    hours: hoursInput.value,
    links: linksInput.value,
    learnings: learningsInput.value,
    blockers: blockersInput.value,
    skills: skillsInput.value,
  };

  // Validate required fields
  if (!formData.description || !formData.learnings || !formData.skills) {
    showStatus("⚠ Please fill all required fields (*)", false);
    return;
  }

  try {
    const checkResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const text = document.body ? document.body.innerText || "" : "";
        const hasForm = !!document.getElementById("student-diary-form");
        const hasHeading =
          text.includes("Internship Diary") ||
          text.includes("Create Internship Diary Entry");
        const hasSelectSection =
          text.includes("Select Internship") && text.includes("Date");
        return { hasForm, hasHeading, hasSelectSection };
      },
    });

    const result =
      Array.isArray(checkResult) && checkResult[0]
        ? checkResult[0].result
        : null;
    const isTargetPage = result && (result.hasForm || result.hasHeading);
    if (!isTargetPage) {
      showStatusHtml(
        "⚠ Open the Internship Diary page first. " +
          '<a href="https://vtu.internyet.in/dashboard/student/create-diary-entry" target="_blank">Go to the form</a>.',
        false,
      );
      return;
    }

    const sendFillMessage = () =>
      new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tab.id,
          {
            action: "fillForm",
            data: formData,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(response);
          },
        );
      });

    let response;
    try {
      response = await sendFillMessage();
    } catch (sendError) {
      // No receiving end: inject content script and retry once
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      response = await sendFillMessage();
    }

    if (response && response.success) {
      showStatus(
        "✓ Form filled successfully! Select internship and date, then save.",
        true,
      );
    } else {
      showStatus("⚠ Could not find form on page", false);
    }
  } catch (error) {
    showStatus("⚠ Error filling form: " + error.message, false);
  }
});

// Handle Enter key in inputs
[
  descriptionInput,
  hoursInput,
  linksInput,
  learningsInput,
  blockersInput,
  skillsInput,
].forEach((input) => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.tagName !== "TEXTAREA") {
      e.preventDefault();
      fillBtn.click();
    }
  });
});

// Handle Enter key in prompt field
promptInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    aiGenerateBtn.click();
  }
});

// Handle Enter key in API key field
apiKeyInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveKeyBtn.click();
  }
});

// Show API key when focused
apiKeyInput.addEventListener("focus", () => {
  if (apiKeyInput.value) {
    apiKeyInput.type = "text";
  }
});

apiKeyInput.addEventListener("blur", () => {
  apiKeyInput.type = "password";
});

// Auto-resize textareas to fit content
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

const textareas = document.querySelectorAll("textarea");
textareas.forEach((textarea) => {
  autoResizeTextarea(textarea);
  textarea.addEventListener("input", () => autoResizeTextarea(textarea));
});
