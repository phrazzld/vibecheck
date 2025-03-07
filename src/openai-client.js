/**
 * OpenAI client module for vibecheck CLI.
 * Handles communication with OpenAI's API.
 */
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

// Read the prompt from the prompt.txt file
const DEFAULT_PROMPT = fs.readFileSync(
  path.join(__dirname, "prompt.txt"),
  "utf8"
);

class OpenAIClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    
    this.client = new OpenAI({
      apiKey: apiKey
    });
  }
  
  /**
   * Constructs the message payload for the OpenAI API
   * @param {string} dataUrl - Data URL of the image
   * @param {string} detailLevel - Detail level (auto, low, high)
   * @returns {Array} - Array of message objects
   */
  constructMessages(dataUrl, detailLevel) {
    // Validate detail level
    const validDetailLevels = ["auto", "low", "high"];
    if (!validDetailLevels.includes(detailLevel)) {
      throw new Error(`Invalid detail level: ${detailLevel}. Must be one of: ${validDetailLevels.join(", ")}`);
    }
    
    return [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: DEFAULT_PROMPT
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: detailLevel // "auto", "low", or "high"
            }
          }
        ]
      }
    ];
  }
  
  /**
   * Analyzes an image using OpenAI's vision model
   * @param {string} dataUrl - Data URL of the image
   * @param {Object} options - Options for the API call
   * @param {string} options.detailLevel - Detail level (auto, low, high)
   * @param {string} options.model - OpenAI model to use
   * @returns {Promise<string>} - The analyzed content as markdown
   */
  async analyzeImage(dataUrl, { detailLevel = "auto", model = "gpt-4o" } = {}) {
    try {
      const messages = this.constructMessages(dataUrl, detailLevel);
      
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 3000,
        temperature: 0.7
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
      } else {
        throw new Error(`Error calling OpenAI API: ${error.message}`);
      }
    }
  }
}

module.exports = OpenAIClient;