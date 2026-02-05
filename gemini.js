// Gemini API Integration - Updated for v1 API
const GEMINI_API_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

/**
 * Generate form data using Gemini AI
 * @param {string} prompt - User's one-line description of work
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} Generated form data
 */
async function generateFormDataWithGemini(prompt, apiKey) {
  const systemPrompt = `You are an AI assistant helping students fill out their internship diary entries. 
Based on the user's brief description of their work, generate a comprehensive diary entry with the following fields:

1. description (Work Summary): A detailed 2-3 paragraph description of the work done (150-300 words)
2. hours: Estimated hours worked (between 3-8, can use decimals like 6.5)
3. links: Relevant reference links (if applicable, comma-separated, or leave empty)
4. learnings: Key learnings and outcomes from the work (100-200 words)
5. blockers: Any blockers or challenges faced (50-100 words, or leave empty if none)
6. skills: Comma-separated list of technical skills used (e.g., JavaScript, React, Node.js, Python, etc.)

Return ONLY a valid JSON object with these exact keys. Do not include any markdown formatting or code blocks.

Example format:
{
  "description": "Detailed work description...",
  "hours": "6.5",
  "links": "https://example.com, https://docs.example.com",
  "learnings": "Key learnings...",
  "blockers": "Challenges faced...",
  "skills": "JavaScript, React, Node.js"
}`;

  const userMessage = `Generate an internship diary entry for: "${prompt}"`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${systemPrompt}\n\nUser request: ${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`,
      );
    }

    const data = await response.json();

    // Extract the generated text from Gemini response
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      throw new Error("No response generated from AI");
    }

    // Parse the JSON response (remove markdown code blocks if present)
    let cleanedText = generatedText.trim();

    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Parse JSON
    const formData = JSON.parse(cleanedText);

    // Validate required fields
    if (!formData.description || !formData.learnings || !formData.skills) {
      throw new Error("AI response missing required fields");
    }

    // Ensure hours is a string
    if (typeof formData.hours === "number") {
      formData.hours = formData.hours.toString();
    }

    return formData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

/**
 * Validate Gemini API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} Whether the key is valid
 */
async function validateGeminiApiKey(apiKey) {
  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello",
              },
            ],
          },
        ],
      }),
    });

    return response.ok || response.status === 400; // 400 is ok, means key works but request format issue
  } catch (error) {
    return false;
  }
}

// Export functions for use in popup.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateFormDataWithGemini,
    validateGeminiApiKey,
  };
}
