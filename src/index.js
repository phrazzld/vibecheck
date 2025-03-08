#!/usr/bin/env node

/**
 * Main entry point for vibecheck CLI.
 * Enhanced with beautiful UI and interactive features.
 */
const { parseArgs } = require("./cli");
const { validateImagePath, encodeImageToBase64, createDataUrl } = require("./image-processor");
const OpenAIClient = require("./openai-client");
const { writeOutput } = require("./output-handler");
const ui = require("./ui");
const path = require("path");
const fs = require("fs");

// Enable/disable color based on --no-color flag
const chalk = require("chalk");

/**
 * Main function
 */
async function main() {
  try {
    // Parse command-line arguments
    let options = parseArgs();
    
    // Handle --no-color flag
    if (options.color === false) {
      chalk.level = 0;
    }
    
    // Display header
    console.log(ui.styles.createHeader());
    console.log(ui.styles.divider());
    
    // Interactive mode
    if (options.interactive) {
      const interactiveOptions = await ui.prompts.promptInteractive();
      options = { ...options, ...interactiveOptions };
    }
    
    // Check for required API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(ui.styles.error("OPENAI_API_KEY environment variable is not set"));
      console.log(ui.styles.info("Set it with: export OPENAI_API_KEY=your-api-key"));
      process.exit(1);
    }
    
    // Validate and process the image
    validateImagePath(options.image);
    const imagePath = path.resolve(options.image);
    
    // Display image info
    const imageInfo = ui.getImageInfo(imagePath);
    console.log(ui.output.createImageInfo(imageInfo));
    
    // Create a spinner for the encoding step
    const encodingSpinner = ui.progress.createSpinner("Reading and encoding image");
    encodingSpinner.start();
    
    // Encode the image
    const base64Image = encodeImageToBase64(imagePath);
    const dataUrl = createDataUrl(base64Image, imagePath);
    
    encodingSpinner.succeed("Image encoded successfully");
    
    // Prepare the analysis step
    console.log("");
    const analysisSpinner = ui.progress.createSpinner(
      `Analyzing image with ${options.model} (${options.detail} detail)`,
      "pulse"
    );
    analysisSpinner.start();
    
    // Create OpenAI client and analyze image
    const openai = new OpenAIClient(apiKey);
    const result = await openai.analyzeImage(dataUrl, {
      detailLevel: options.detail,
      model: options.model
    });
    
    analysisSpinner.succeed("Analysis complete");
    
    // Display summary of the generated content
    console.log(ui.output.createSummary(result));
    
    // Prepare for output
    const outputSpinner = ui.progress.createSpinner("Saving aesthetic guide");
    outputSpinner.start();
    
    // Write output
    const outputPath = path.resolve(options.output);
    writeOutput(result, outputPath);
    
    outputSpinner.succeed(`Guide saved to ${outputPath}`);
    
    // Show success message
    console.log(ui.output.createSuccessMessage(outputPath));
    
    // Post-analysis actions if interactive
    if (options.interactive) {
      await ui.performPostAnalysisActions(outputPath, result);
    }
    
  } catch (error) {
    // Show styled error message
    console.error(ui.output.formatError(error.message));
    process.exit(1);
  }
}

// Run the program
main();