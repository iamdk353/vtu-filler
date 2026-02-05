// Content script that runs on all pages
// This script listens for messages from the popup and fills forms accordingly

// Function to set value and trigger events (important for React/Vue forms)
function setInputValue(element, value) {
  if (!element) return false;

  // Set the value
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  ).set;

  if (element.tagName === "TEXTAREA") {
    nativeTextAreaValueSetter.call(element, value);
  } else {
    nativeInputValueSetter.call(element, value);
  }

  // Trigger all relevant events to ensure React/Vue picks up the change
  const events = [
    new Event("input", { bubbles: true }),
    new Event("change", { bubbles: true }),
    new Event("blur", { bubbles: true }),
    new KeyboardEvent("keydown", { bubbles: true }),
    new KeyboardEvent("keyup", { bubbles: true }),
  ];

  events.forEach((event) => element.dispatchEvent(event));

  return true;
}

// Function to fill React Select (for skills dropdown)
function fillReactSelect(container, values) {
  if (!container) return false;

  try {
    // Find the input element within react-select
    const input = container.querySelector(
      '.react-select__input input, input[id^="react-select"]',
    );
    if (!input) return false;

    // Parse skills if it's a comma-separated string
    const skillsList =
      typeof values === "string"
        ? values
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : values;

    // Focus the input to open dropdown
    input.focus();

    // For each skill, type it and simulate Enter
    skillsList.forEach((skill, index) => {
      setTimeout(() => {
        // Set value
        setInputValue(input, skill);

        // Wait a bit for dropdown to appear
        setTimeout(() => {
          // Simulate pressing Enter to select
          const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            keyCode: 13,
            code: "Enter",
            which: 13,
            bubbles: true,
          });
          input.dispatchEvent(enterEvent);
        }, 100);
      }, index * 300);
    });

    return true;
  } catch (error) {
    console.error("Error filling React Select:", error);
    return false;
  }
}

function findInternshipDiaryForm() {
  return document.getElementById("student-diary-form");
}

function waitForInternshipDiaryForm(timeoutMs = 6000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const form = findInternshipDiaryForm();
      if (form) {
        clearInterval(interval);
        resolve(form);
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 200);
  });
}

// Main function to fill the form
function fillInternshipDiaryForm(data, form = null) {
  try {
    let filled = false;

    // Find form by ID
    if (!form) {
      form = findInternshipDiaryForm();
    }
    if (!form) {
      console.log("Form not found");
      return false;
    }

    // Fill Work Summary (description)
    const descriptionField = form.querySelector(
      'textarea[name="description"], textarea[id]',
    );
    if (descriptionField && data.description) {
      filled = setInputValue(descriptionField, data.description) || filled;
    }

    // Fill Hours Worked
    const hoursField = form.querySelector(
      'input[name="hours"], input[type="number"][placeholder*="6.5"], input[type="number"]',
    );
    if (hoursField && data.hours) {
      filled = setInputValue(hoursField, data.hours) || filled;
    }

    // Fill Reference Links
    const linksField = form.querySelector('textarea[name="links"]');
    if (linksField && data.links) {
      filled = setInputValue(linksField, data.links) || filled;
    }

    // Fill Learnings/Outcomes
    const learningsField = form.querySelector('textarea[name="learnings"]');
    if (learningsField && data.learnings) {
      filled = setInputValue(learningsField, data.learnings) || filled;
    }

    // Fill Blockers/Risks
    const blockersField = form.querySelector('textarea[name="blockers"]');
    if (blockersField && data.blockers) {
      filled = setInputValue(blockersField, data.blockers) || filled;
    }

    // Fill Skills (React Select)
    if (data.skills) {
      const reactSelectControl = form.querySelector(
        '.react-select__control, [class*="react-select"]',
      );
      const skillsContainer = reactSelectControl
        ? reactSelectControl.closest(
            '.css-b62m3t-container, [class*="container"]',
          ) || reactSelectControl
        : null;
      if (skillsContainer) {
        filled = fillReactSelect(skillsContainer, data.skills) || filled;
      }
    }

    // Scroll form into view
    if (filled) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add a visual indicator that form was filled
      form.style.outline = "3px solid #667eea";
      form.style.outlineOffset = "4px";
      setTimeout(() => {
        form.style.outline = "";
        form.style.outlineOffset = "";
      }, 2000);
    }

    return filled;
  } catch (error) {
    console.error("Error filling form:", error);
    return false;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm") {
    (async () => {
      const form = await waitForInternshipDiaryForm(6000);
      if (!form) {
        sendResponse({ success: false, reason: "form_not_found" });
        return;
      }

      const success = fillInternshipDiaryForm(request.data, form);
      sendResponse({ success: success });
    })();
  }
  return true; // Keep message channel open for async response
});

// Log that content script is loaded
console.log("AI Form Filler content script loaded");
