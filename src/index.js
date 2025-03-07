#!/usr/bin/env node

/**
 * Main entry point for vibecheck CLI.
 */
const { parseArgs } = require("./cli");
const { encodeImageToBase64, createDataUrl } = require("./image-processor");
const OpenAIClient = require("./openai-client");
const { writeOutput } = require("./output-handler");
const path = require("path");

/**
 * Logs a message if verbose mode is enabled
 * @param {boolean} verbose - Whether verbose mode is enabled
 * @param {string} message - Message to log
 */
function logVerbose(verbose, message) {
  if (verbose) {
    console.log(`[INFO] ${message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command-line arguments
    const options = parseArgs();
    
    // Check for required API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Error: OPENAI_API_KEY environment variable is not set");
      process.exit(1);
    }
    
    logVerbose(options.verbose, "Starting analysis process...");
    
    // Process the image
    logVerbose(options.verbose, `Reading image from: ${options.image}`);
    const imagePath = path.resolve(options.image);
    const base64Image = encodeImageToBase64(imagePath);
    const dataUrl = createDataUrl(base64Image, imagePath);
    
    // Create OpenAI client and analyze image
    logVerbose(options.verbose, `Analyzing image with model: ${options.model}, detail level: ${options.detail}`);
    const openai = new OpenAIClient(apiKey);
    const result = await openai.analyzeImage(dataUrl, {
      detailLevel: options.detail,
      model: options.model
    });
    
    // Write output
    const outputPath = path.resolve(options.output);
    logVerbose(options.verbose, `Writing analysis to: ${outputPath}`);
    writeOutput(result, outputPath);
    
    console.log(`( Aesthetic profile generated and saved to: ${outputPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the program
main();