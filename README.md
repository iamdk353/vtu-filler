# AI Form Filler - Chrome Extension with Gemini AI

A Chrome extension that automatically fills internship diary entry forms using Google's Gemini AI. Simply provide a one-line description of your work, and the AI generates a complete, detailed diary entry.

## 🚀 Quick Demo

```
Input: "Built a user authentication system with JWT tokens"

AI Generates:
✓ Detailed work summary (200+ words)
✓ Estimated hours (6.5 hours)
✓ Key learnings and outcomes
✓ Technical skills used (Node.js, JWT, Express, etc.)
✓ Potential blockers
✓ Reference links

Time saved: ~15-20 minutes per entry!
```

## Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini to generate complete form entries from a single line description
- 🎯 **Automatic Form Filling**: Fill complex forms with a single click
- 💾 **Data Persistence**: Save your form data and API key for reuse
- ⚡ **React-Compatible**: Works with React forms (handles state updates properly)
- 🎨 **Beautiful UI**: Modern, gradient-based interface
- 🔄 **Real-time Validation**: Validates required fields before submission
- 🔐 **Secure API Key Storage**: Stores your Gemini API key locally

## Installation

### Step 1: Get a Gemini API Key (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Install the Extension

#### Method 1: Load as Unpacked Extension (Recommended for Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `form-filler-extension` folder
5. The extension icon should appear in your Chrome toolbar

### Method 2: Pack and Install

1. Go to `chrome://extensions/`
2. Click "Pack extension"
3. Browse to the `form-filler-extension` folder
4. Click "Pack Extension"
5. Install the generated `.crx` file

## Usage

### Quick Start with AI Generation (Recommended)

1. **Navigate to the form page** (e.g., VTU Internship Dashboard)
2. **Click the extension icon** in your Chrome toolbar
3. **Enter your Gemini API key** (first time only):
   - Paste your API key in the "Gemini API Key" field
   - Click the 💾 button to save it
   
4. **Generate form data with AI**:
   - Enter a brief description in "Quick Description" (e.g., "Worked on React frontend for user dashboard")
   - Click "✨ Generate with AI"
   - Wait 2-3 seconds while AI generates the complete entry
   
5. **Review and fill the form**:
   - Review the AI-generated content (edit if needed)
   - Click "Fill Form" to populate the form on the page
   - Click "Save Data" to save for future reference

### Manual Entry (Alternative Method)

1. **Navigate to the form page** (e.g., VTU Internship Dashboard)
2. **Click the extension icon** in your Chrome toolbar
3. **Fill in the form data manually** in the popup:
   - Work Summary (required)
   - Hours Worked (required)
   - Reference Links (optional)
   - Learnings/Outcomes (required)
   - Blockers/Risks (optional)
   - Skills Used (required, comma-separated)

4. **Click "Fill Form"** to automatically populate the form on the page
5. **Click "Save Data"** to save your inputs for future use

### Keyboard Shortcuts

- Press `Enter` in the "Quick Description" field to generate with AI
- Press `Enter` in the API key field to save the key
- Press `Enter` in text fields to trigger form filling (except in textareas)
- Use `Shift + Enter` in textareas for new lines

### Example AI Prompts

The AI works best with clear, concise descriptions. Here are some examples:

- "Created a REST API for user authentication using Node.js and JWT"
- "Debugged and fixed responsive layout issues on mobile devices"
- "Implemented data visualization dashboard using React and Chart.js"
- "Wrote unit tests for payment processing module"
- "Optimized database queries resulting in 40% faster load times"
- "Attended team meeting and planned sprint tasks"

### Form Fields Mapping

The extension maps to the following form fields:

| Extension Field | Form Field Name | Type | Required |
|----------------|-----------------|------|----------|
| Work Summary | `description` | textarea | Yes |
| Hours Worked | `hours` | number | Yes |
| Reference Links | `links` | textarea | No |
| Learnings/Outcomes | `learnings` | textarea | Yes |
| Blockers/Risks | `blockers` | textarea | No |
| Skills Used | React Select | multi-select | Yes |

## Technical Details

### File Structure

```
form-filler-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic and Chrome API interactions
├── gemini.js           # Gemini AI API integration
├── content.js          # Content script for form manipulation
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### How It Works

1. **Gemini API (`gemini.js`)**: Handles communication with Google's Gemini AI API to generate form content
2. **Content Script (`content.js`)**: Runs on all web pages and listens for messages from the popup
3. **Popup Script (`popup.js`)**: Handles user interactions, AI generation, and sends form data to content script
4. **Chrome Storage API**: Persists form data and API key between sessions

### AI Generation Process

1. User provides a brief work description
2. Extension sends description to Gemini API with a detailed system prompt
3. Gemini generates comprehensive content for all form fields:
   - Expands the brief description into a detailed work summary
   - Estimates appropriate hours worked
   - Suggests relevant reference links
   - Identifies key learnings and outcomes
   - Notes potential blockers
   - Extracts technical skills used
4. Generated content is populated into the form fields
5. User can review, edit, and submit

### React Form Handling

The extension properly handles React forms by:
- Using native property setters to update values
- Dispatching multiple events (`input`, `change`, `blur`, `keydown`, `keyup`)
- Handling React Select components with simulated keyboard input

### React Select Support

For the Skills dropdown (React Select component):
- Automatically opens the dropdown
- Types each skill
- Simulates `Enter` key to select
- Handles multiple skills with proper timing delays

## API Key Security

Your Gemini API key is stored locally in your browser using Chrome's Storage API. It is never sent to any server except Google's Gemini API. The key is:
- Stored encrypted by Chrome
- Only accessible by this extension
- Never shared or transmitted elsewhere
- Hidden (password field) when not in use

## Cost and Limits

Gemini API offers a **free tier** with generous limits:
- 60 requests per minute
- 1500 requests per day
- Sufficient for typical daily internship diary entries

For more information, visit [Google AI Pricing](https://ai.google.dev/pricing)

## Customization

### Styling

Edit `popup.html` to customize the appearance. The current theme uses:
- Primary gradient: `#667eea` to `#764ba2`
- Success color: Green
- Error color: Red

### Form Selectors

If your target form has different field names or structure, update the selectors in `content.js`:

```javascript
// Example: Change field selector
const descriptionField = form.querySelector('YOUR_CUSTOM_SELECTOR');
```

### Adding New Fields

1. Add input field to `popup.html`
2. Add corresponding logic in `popup.js` to save/load the field
3. Update `content.js` to fill the new field on the target form

## Troubleshooting

### AI Generation Issues

**AI not generating content?**
1. **Verify API key**: Make sure you entered a valid Gemini API key
2. **Check quota**: Ensure you haven't exceeded the free tier limits (60/min, 1500/day)
3. **Check internet connection**: The extension needs internet to call Gemini API
4. **Check browser console**: Right-click extension icon → Inspect popup → Console tab

**Generated content doesn't make sense?**
1. **Be more specific**: Provide clearer work descriptions
2. **Edit manually**: You can always edit the AI-generated content before filling the form

**API key errors?**
- Make sure you copied the complete API key from Google AI Studio
- The key should start with something like "AIza..."
- Try generating a new API key if issues persist

### Extension Issues

**Extension not working?**
1. **Check console errors**: Right-click extension icon → Inspect popup
2. **Verify form ID**: Make sure the target form has `id="student-diary-form"`
3. **Check field selectors**: Inspect the form to verify field names match
4. **Reload extension**: Go to `chrome://extensions/` and click reload

**Form not filling?**
1. **Reload the page** and try again
2. **Reload the extension**: Go to `chrome://extensions/` and click reload
3. **Check browser console**: Press `F12` to see any JavaScript errors

### React Select not working?

- The extension waits 100ms between typing and pressing Enter
- If your form is slower, increase the timeout in `content.js`:

```javascript
setTimeout(() => {
  // Increase this value if needed
  input.dispatchEvent(enterEvent);
}, 200); // Increased from 100 to 200
```

## Permissions Explained

- `activeTab`: Access the current tab to fill forms
- `scripting`: Inject content script into web pages
- `storage`: Save form data and API key locally
- `host_permissions` for `generativelanguage.googleapis.com`: Call Gemini API

## Future Enhancements

- [x] AI integration with Gemini API ✅
- [ ] Support for other AI models (Claude, GPT-4)
- [ ] Support for multiple form types
- [ ] Export/import form templates
- [ ] Automatic form detection
- [ ] Scheduling for automatic daily entries
- [ ] Team collaboration features
- [ ] Browser extension for Firefox and Edge
- [ ] Prompt templates and customization

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub or contact the developer.

---

**Note**: This extension is currently configured for the VTU Internship Dashboard form. Modify `content.js` selectors for other forms.
# vtu-filler-main
