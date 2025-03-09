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
    
    // Create a process bar for the entire workflow
    const processSteps = [
      "Setting up",
      "Reading image",
      "Analyzing image",
      "Generating guide",
      "Saving output"
    ];
    const processBar = ui.progress.createProcessBar(processSteps);
    
    // Start the process bar
    processBar.start();
    
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
        // Load last session settings from saved file if available
        try {
          const lastSession = JSON.parse(fs.readFileSync(path.join(process.cwd(), ".vibecheck-session"), "utf8"));
          options = { ...options, ...lastSession };
          console.log(ui.styles.info("Loaded settings from last session"));
          ui.displayOptionsSummary(options);
        } catch (error) {
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
    
    // Move to next step: Reading image
    processBar.nextStep();
    
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
    
    // Move to next step: Analyzing image
    processBar.nextStep();
    
    // Prepare the analysis step
    console.log("");
    const analysisSpinner = ui.progress.createSpinner(
      `Analyzing image with ${options.model} (${options.detail} detail)`,
      "pulse"
    );
    analysisSpinner.start();
    
    // Create OpenAI client and analyze image
    const openai = new OpenAIClient(apiKey, { verbose: options.verbose });
    const result = await openai.analyzeImage(dataUrl, {
      detailLevel: options.detail,
      model: options.model,
      verbose: options.verbose
    });
    
    analysisSpinner.succeed("Analysis complete");
    
    // Move to next step: Generating guide
    processBar.nextStep();
    
    // Display summary of the generated content
    console.log(ui.output.createSummary(result));
    
    // Move to next step: Saving output
    processBar.nextStep();
    
    // Prepare for output
    const outputSpinner = ui.progress.createSpinner("Saving aesthetic guide");
    outputSpinner.start();
    
    // Write output
    const outputPath = path.resolve(options.output);
    writeOutput(result, outputPath, {
      imagePath: options.image ? path.resolve(options.image) : null,
      includeImage: options.image !== false
    });
    
    outputSpinner.succeed(`Guide saved to ${outputPath}`);
    
    // Complete the process bar
    processBar.complete("Process completed successfully");
    
    // Show success message
    console.log(ui.output.createSuccessMessage(outputPath));
    
    // Save session for next time
    try {
      fs.writeFileSync(
        path.join(process.cwd(), ".vibecheck-session"), 
        JSON.stringify({
          image: options.image,
          output: options.output,
          detail: options.detail,
          model: options.model
        }, null, 2)
      );
    } catch (error) {
      // Silent fail - not critical
    }
    
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