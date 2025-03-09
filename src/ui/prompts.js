/**
 * Prompts module for vibecheck CLI
 * Contains interactive prompts and user input handling
 */
const inquirer = require("inquirer");
const chalk = require("chalk");
const { colors } = require("./styles");

/**
 * Create styled choices for inquirer prompts
 * @param {Array} choices - Array of choice objects or strings
 * @param {string} defaultValue - Default value to highlight
 * @returns {Array} - Array of formatted choice objects
 */
function createStyledChoices(choices, defaultValue = null) {
  return choices.map(choice => {
    const isObject = typeof choice === "object";
    const value = isObject ? choice.value : choice;
    const name = isObject ? choice.name : choice;
    
    let displayName = name;
    
    if (value === defaultValue) {
      displayName = chalk.hex(colors.primary)(name) + chalk.dim(" (default)");
    }
    
    return {
      value,
      name: displayName,
      short: isObject && choice.short ? choice.short : name
    };
  });
}

/**
 * Prompts for image file path
 * @param {string} defaultPath - Default path to use
 * @returns {Promise<string>} - Selected image path
 */
async function promptForImagePath(defaultPath = null) {
  const { imagePath } = await inquirer.prompt([
    {
      type: "input",
      name: "imagePath",
      message: "Enter the path to your image:",
      prefix: "  ",
      default: defaultPath,
      validate: input => input ? true : "Please enter a valid path"
    }
  ]);
  
  return imagePath;
}

/**
 * Prompts for detail level
 * @param {string} defaultDetail - Default detail level
 * @returns {Promise<string>} - Selected detail level
 */
async function promptForDetailLevel(defaultDetail = "auto") {
  const choices = [
    { 
      value: "high",
      name: `${chalk.hex(colors.accent)("✨")} High Detail`,
      short: "High"
    },
    { 
      value: "auto",
      name: `${chalk.hex(colors.info)("🔍")} Auto (Standard)`,
      short: "Auto"
    },
    { 
      value: "low",
      name: `${chalk.hex(colors.muted)("🔄")} Low Detail (Faster)`,
      short: "Low"
    }
  ];
  
  const { detailLevel } = await inquirer.prompt([
    {
      type: "list",
      name: "detailLevel",
      message: "Select detail level for analysis:",
      prefix: "  ",
      choices: createStyledChoices(choices, defaultDetail),
      default: defaultDetail
    }
  ]);
  
  return detailLevel;
}

/**
 * Prompts for output file path
 * @param {string} defaultPath - Default path to use
 * @returns {Promise<string>} - Selected output path
 */
async function promptForOutputPath(defaultPath = "AESTHETIC.md") {
  const { outputPath } = await inquirer.prompt([
    {
      type: "input",
      name: "outputPath",
      message: "Where should the aesthetic guide be saved?",
      prefix: "  ",
      default: defaultPath
    }
  ]);
  
  return outputPath;
}

/**
 * Prompts for model selection
 * @param {string} defaultModel - Default model to use
 * @returns {Promise<string>} - Selected model
 */
async function promptForModel(defaultModel = "gpt-4o") {
  const choices = [
    { 
      value: "gpt-4o",
      name: `${chalk.hex(colors.primary)("✨")} GPT-4o (Best quality)`,
      short: "GPT-4o"
    },
    { 
      value: "gpt-4o-mini",
      name: `${chalk.hex(colors.secondary)("🚀")} GPT-4o-mini (Faster)`,
      short: "GPT-4o-mini"
    }
  ];
  
  const { model } = await inquirer.prompt([
    {
      type: "list",
      name: "model",
      message: "Select OpenAI model:",
      prefix: "  ",
      choices: createStyledChoices(choices, defaultModel),
      default: defaultModel
    }
  ]);
  
  return model;
}

/**
 * Prompts for next action after analysis
 * @param {Array} options - Array of action options
 * @returns {Promise<string>} - Selected action
 */
async function promptForNextAction(options = ["edit", "view", "extract", "exit"]) {
  const actionMap = {
    "edit": {
      value: "edit",
      name: `${chalk.hex(colors.info)("✏️")} Open guide in editor`,
      short: "Edit"
    },
    "view": {
      value: "view",
      name: `${chalk.hex(colors.secondary)("👁️")} View guide in terminal`,
      short: "View"
    },
    "extract": {
      value: "extract",
      name: `${chalk.hex(colors.accent)("🎨")} Extract color palette`,
      short: "Extract"
    },
    "exit": {
      value: "exit",
      name: `${chalk.hex(colors.muted)("🚪")} Exit`,
      short: "Exit"
    },
    "cancel": {
      value: "cancel",
      name: `${chalk.hex(colors.error)("❌")} Cancel operation`,
      short: "Cancel"
    }
  };
  
  const choices = options.map(option => actionMap[option]);
  
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do with your aesthetic guide?",
      prefix: "  ",
      choices: choices
    }
  ]);
  
  return action;
}

/**
 * Displays a styled mode selection menu
 * @returns {Promise<string>} - Selected mode
 */
async function promptForMode() {
  // Print header
  console.log(`\n  ${chalk.hex(colors.primary).bold("CHOOSE YOUR PATH")}\n`);
  console.log(chalk.dim("  ───────────────────────────────────────────"));
  
  // Print options without box
  console.log(`\n  ${chalk.hex(colors.accent)("✨")} GUIDED JOURNEY  ${chalk.dim("(Interactive)")}`);
  console.log(`  ${chalk.hex(colors.secondary)("🚀")} QUICK ANALYSIS ${chalk.dim("(Command Line)")}`);
  console.log(`  ${chalk.hex(colors.info)("🔮")} LAST SESSION   ${chalk.dim("(Repeat Settings)")}\n`);
  
  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: "Select your preferred experience:",
      prefix: "  ",
      choices: [
        { value: "guided", name: "✨ Guided Journey" },
        { value: "quick", name: "🚀 Quick Analysis" },
        { value: "last", name: "🔮 Last Session" }
      ]
    }
  ]);
  
  return mode;
}

/**
 * Displays the welcome narrative
 */
function showWelcomeNarrative() {
  // Display welcome message without box
  console.log(`\n  ${chalk.hex(colors.accent)("⊹ Welcome to your aesthetic expedition ⊹")}`);
  console.log(`  We'll transform visual inspiration into design language.`);
  console.log(`  Let's begin our creative archaeology...\n`);
  console.log(chalk.dim("  ───────────────────────────────────────────\n"));
}

/**
 * Prompts for style preferences
 * @returns {Promise<Object>} - Selected preferences
 */
async function promptForStylePreferences() {
  // Display header without box
  console.log(`\n  ${chalk.hex(colors.secondary).bold("STYLE PREFERENCES")}`);
  console.log(chalk.dim("  ───────────────────────────────────────────\n"));
  
  const { designPhilosophy } = await inquirer.prompt([
    {
      type: "list",
      name: "designPhilosophy",
      message: "What's your design philosophy?",
      prefix: "  ",
      choices: [
        { value: "minimalist", name: "Minimalist" },
        { value: "expressive", name: "Expressive" },
        { value: "balanced", name: "Balanced" }
      ]
    }
  ]);
  
  const { application } = await inquirer.prompt([
    {
      type: "list",
      name: "application",
      message: "Primary application of this guide?",
      prefix: "  ",
      choices: [
        { value: "web", name: "Web" },
        { value: "mobile", name: "Mobile" },
        { value: "print", name: "Print" },
        { value: "other", name: "Other" }
      ]
    }
  ]);
  
  return { designPhilosophy, application };
}

/**
 * Prompts for interactive mode
 * @returns {Promise<Object>} - All selected options
 */
async function promptInteractive() {
  // Get references to styles
  const { createSection } = require("./styles");
  
  // Show welcome narrative if this is the guided journey
  showWelcomeNarrative();
  
  console.log(createSection("Image Selection", ""));
  const imagePath = await promptForImagePath();
  
  // Get style preferences
  const preferences = await promptForStylePreferences();
  
  console.log(createSection("Analysis Options", ""));
  const detailLevel = await promptForDetailLevel();
  const model = await promptForModel();
  
  console.log(createSection("Output Options", ""));
  const outputPath = await promptForOutputPath();
  
  // Add some spacing
  console.log("");
  
  return {
    image: imagePath,
    detail: detailLevel,
    model: model,
    output: outputPath,
    designPhilosophy: preferences.designPhilosophy,
    application: preferences.application
  };
}

module.exports = {
  promptForImagePath,
  promptForDetailLevel,
  promptForOutputPath,
  promptForModel,
  promptForNextAction,
  promptForMode,
  showWelcomeNarrative,
  promptForStylePreferences,
  promptInteractive
};