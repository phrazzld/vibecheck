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
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    
    this.client = new OpenAI({
      apiKey: apiKey
    });
    
    this.verbose = options.verbose || false;
    this.prompt = DEFAULT_PROMPT;
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
            text: this.prompt
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
  async analyzeImage(dataUrl, { detailLevel = "auto", model = "gpt-4o", verbose = false } = {}) {
    try {
      // Set verbose from options or use the instance value
      this.verbose = verbose || this.verbose;
      
      const messages = this.constructMessages(dataUrl, detailLevel);
      
      if (this.verbose) {
        console.log("\n[Verbose] Sending request to OpenAI API");
        console.log(`[Verbose] Model: ${model}`);
        console.log(`[Verbose] Detail level: ${detailLevel}`);
        console.log("[Verbose] Prompt length: " + this.prompt.length + " characters");
        // Print the first and last 100 characters of the prompt for debugging
        console.log("[Verbose] Prompt preview: " + 
          this.prompt.substring(0, 100) + 
          "..." + 
          this.prompt.substring(this.prompt.length - 100));
      }
      
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 3000,
        temperature: 0.7
      });
      
      if (this.verbose) {
        console.log(`[Verbose] OpenAI response received (${response.choices[0].message.content.length} characters)`);
        console.log(`[Verbose] Model: ${response.model}`);
        console.log(`[Verbose] Prompt tokens: ${response.usage.prompt_tokens}`);
        console.log(`[Verbose] Completion tokens: ${response.usage.completion_tokens}`);
        console.log(`[Verbose] Total tokens: ${response.usage.total_tokens}`);
      }
      
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