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
 * Creates an animated launch header
 * Implements the animated launch experience from the design plan
 */
async function animateLaunchHeader() {
  const gradient = require("gradient-string");
  
  // Define the vibecheck gradient
  const vibecheckGradient = gradient([
    ui.styles.colors.primary,
    ui.styles.colors.secondary, 
    ui.styles.colors.tertiary,
    ui.styles.colors.accent
  ]);
  
  // Clear console
  process.stdout.write("\x1Bc");
  
  // First animate the text appearance
  const text = "v i b e c h e c k . . .";
  for (let i = 0; i <= text.length; i++) {
    process.stdout.write("\r" + vibecheckGradient(text.substring(0, i)));
    await new Promise(resolve => setTimeout(resolve, 70));
  }
  
  // Pause briefly
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Clear that line
  process.stdout.write("\r\x1b[K");
  
  // Show the full banner with a slight delay
  process.stdout.write("\n");
  console.log(ui.styles.createHeader());
  
  return;
}

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
    
    // Animated launch experience
    await animateLaunchHeader();
    console.log(ui.styles.divider());
    
    // Use the enhanced workflow component for process steps
    const progressDisplay = require('./ui/components/progress-display');
    const workflow = progressDisplay.createWorkflow([
      "Setting up options",
      "Reading & processing image",
      "Analyzing with AI",
      "Generating style guide",
      "Finalizing results"
    ]);
    
    // The workflow is already started by creating it
    
    // Mode selection for all users
    if (!options.skipModeSelection) {
      // Check if --cancel flag is set to exit gracefully
      if (options.cancel) {
        console.log(ui.styles.info("Operation canceled. Exiting..."));
        process.exit(0);
      }
      
      const mode = await ui.prompts.promptForMode();
      
      if (mode === "guided") {
        // Full guided journey with interactive experience
        options.interactive = true;
        const interactiveOptions = await ui.prompts.promptInteractive();
        options = { ...options, ...interactiveOptions };
        
        // Display summary of selected options
        ui.displayOptionsSummary(options);
      } else if (mode === "quick" && !options.image) {
        // Quick mode but we need an image path
        const imagePath = await ui.prompts.promptForImagePath();
        options.image = imagePath;
      } else if (mode === "last") {
        // Load previous session using the session manager
        const sessionManager = require('./ui/components/session-manager');
        const lastSession = sessionManager.loadSession();
        
        if (lastSession) {
          options = { ...options, ...lastSession };
          console.log(ui.styles.info("Loaded settings from previous session"));
          ui.displayOptionsSummary(options);
        } else {
          console.log(ui.styles.warning("No previous session found. Starting with default settings."));
          if (!options.image) {
            const imagePath = await ui.prompts.promptForImagePath();
            options.image = imagePath;
          }
        }
      }
    } else if (options.interactive) {
      // Traditional interactive mode without mode selection (for backward compatibility)
      const interactiveOptions = await ui.prompts.promptInteractive();
      options = { ...options, ...interactiveOptions };
      
      // Display summary of selected options
      ui.displayOptionsSummary(options);
    }
    
    // Move to next step: Reading & processing image
    workflow.next("Preparing to read image");
    
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
    
    // Create an enhanced spinner for the encoding step with contextual information
    const encodingSpinner = progressDisplay.createContextSpinner(
      "Reading and encoding image", 
      "Preparing for analysis"
    );
    encodingSpinner.start();
    
    // Encode the image
    encodingSpinner.updateContext("Converting to base64");
    const base64Image = encodeImageToBase64(imagePath);
    encodingSpinner.updateContext("Creating data URL");
    const dataUrl = createDataUrl(base64Image, imagePath);
    
    encodingSpinner.succeed("  Image encoded successfully");
    
    // Move to next step: Analyzing with AI
    workflow.next("Starting AI analysis");
    
    // Prepare the analysis step with enhanced context spinner
    console.log("");
    const analysisSpinner = progressDisplay.createContextSpinner(
      `Analyzing image with ${options.model} (${options.detail} detail)`,
      "Sending to OpenAI API"
    )
    analysisSpinner.start();
    
    // Create OpenAI client and analyze image
    const openai = new OpenAIClient(apiKey, { verbose: options.verbose });
    
    // Updates to show progress during API call
    analysisSpinner.updateContext("Waiting for OpenAI response");
    
    const result = await openai.analyzeImage(dataUrl, {
      detailLevel: options.detail,
      model: options.model,
      verbose: options.verbose
    });
    
    analysisSpinner.succeed("  Analysis complete");
    
    // Move to next step: Generating style guide
    workflow.next("Processing AI response");
    
    // Display summary of the generated content
    console.log(ui.output.createSummary(result));
    
    // Move to next step: Finalizing results
    workflow.next("Preparing to save results");
    
    // Prepare for output with enhanced spinner
    const outputSpinner = progressDisplay.createSimpleSpinner("Saving aesthetic guide");
    outputSpinner.start();
    
    // Write output
    const outputPath = path.resolve(options.output);
    writeOutput(result, outputPath, {
      imagePath: options.image ? path.resolve(options.image) : null,
      includeImage: options.image !== false
    });
    
    outputSpinner.succeed(`  Guide saved to ${outputPath}`);
    
    // Complete the workflow
    workflow.complete();
    
    // Show success message
    console.log(ui.output.createSuccessMessage(outputPath));
    
    // Save session for next time using the session manager
    const sessionManager = require('./ui/components/session-manager');
    sessionManager.saveSession(options);
    
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