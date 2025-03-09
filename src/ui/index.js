/**
 * UI module for vibecheck CLI
 * Main entry point for all UI-related functionality
 */
const styles = require("./styles");
const progress = require("./progress");
const prompts = require("./prompts");
const output = require("./output");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const chalk = require("chalk");

/**
 * Gets basic image information
 * @param {string} imagePath - Path to the image
 * @returns {Object} - Object with image information
 */
function getImageInfo(imagePath) {
  try {
    const stats = fs.statSync(imagePath);
    const filename = path.basename(imagePath);
    const fullPath = path.resolve(imagePath);
    
    // We're not using image-size or other packages that might 
    // require native dependencies, so we'll just return basic info
    return {
      filename,
      path: fullPath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    return {
      filename: path.basename(imagePath),
      path: path.resolve(imagePath),
      error: error.message
    };
  }
}

/**
 * Attempts to open the output file in the default editor
 * @param {string} filePath - Path to the file to open
 */
function openInEditor(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    // Different commands for different platforms
    if (process.platform === "darwin") { // macOS
      execSync(`open "${fullPath}"`);
    } else if (process.platform === "win32") { // Windows
      execSync(`start "" "${fullPath}"`);
    } else { // Linux and others
      execSync(`xdg-open "${fullPath}"`);
    }
  } catch (error) {
    console.error(styles.error(`Failed to open file: ${error.message}`));
  }
}

/**
 * Displays the file in the terminal
 * @param {string} filePath - Path to the file to display
 */
function viewInTerminal(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    
    // Simple markdown rendering with our beautiful UI
    const sections = content.split(/^##\s+/gm);
    
    // Handle title section separately
    let mainTitle = "";
    if (sections[0]) {
      const titleMatch = sections[0].match(/^#\s+(.+?)(\r?\n|$)/);
      if (titleMatch) {
        mainTitle = titleMatch[1];
        // Display the main title with gradient
        console.log(styles.createSection("Aesthetic Guide", `  ${styles.vibecheckGradient(mainTitle)}`));
      }
    }
    
    // Process remaining sections
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const titleEndIndex = section.indexOf("\n");
      if (titleEndIndex !== -1) {
        const title = section.substring(0, titleEndIndex);
        const content = section.substring(titleEndIndex + 1)
          .replace(/`([^`]+)`/g, chalk.hex(styles.colors.muted)("$1"))
          .replace(/\*\*([^*]+)\*\*/g, chalk.bold("$1"))
          .replace(/\*([^*]+)\*/g, chalk.italic("$1"))
          .split("\n")
          .map(line => `  ${line}`)
          .join("\n");
        
        console.log(styles.createSection(title.trim(), content));
      }
    }
  } catch (error) {
    console.error(styles.error(`Failed to read file: ${error.message}`));
  }
}

/**
 * Displays a summary of selected options
 * @param {Object} options - Selected options for the analysis
 */
function displayOptionsSummary(options) {
  console.log(styles.createSection("Selected Options", ""));
  
  const optionsTable = [
    ["Image", options.image ? path.basename(options.image) : "None"],
    ["Output", options.output],
    ["Detail Level", options.detail],
    ["Model", options.model],
    ["Include Image", options.image !== false ? "Yes" : "No"]
  ];
  
  // Format the table with some nice styling
  const formattedTable = optionsTable.map(([key, value]) => {
    return `  ${chalk.hex(styles.colors.tertiary)(key)}: ${value}`;
  }).join("\n");
  
  console.log(formattedTable);
  console.log("");
}

/**
 * Performs post-analysis actions
 * @param {string} outputPath - Path to the output file
 * @param {string} markdownContent - Content of the markdown file
 */
async function performPostAnalysisActions(outputPath, markdownContent) {
  console.log(styles.createSection("Next Steps", ""));
  
  const action = await prompts.promptForNextAction(["edit", "view", "extract", "exit"]);
  
  switch (action) {
    case "edit":
      console.log(styles.info("Opening in your default editor..."));
      openInEditor(outputPath);
      break;
    case "view":
      console.log(styles.divider());
      console.log(styles.info("Displaying aesthetic guide in the terminal..."));
      console.log("");
      viewInTerminal(outputPath);
      break;
    case "extract":
      const colors = output.extractColorPalette(markdownContent);
      if (colors.length > 0) {
        console.log(styles.createColorSwatches(colors));
      } else {
        console.log(styles.warning("No colors found in the aesthetic guide."));
      }
      break;
    case "cancel": // New option to gracefully cancel
    case "exit":
    default:
      console.log(styles.info("\nThanks for using vibecheck! ✨"));
      break;
  }
}

module.exports = {
  styles,
  progress,
  prompts,
  output,
  getImageInfo,
  openInEditor,
  viewInTerminal,
  displayOptionsSummary,
  performPostAnalysisActions
};