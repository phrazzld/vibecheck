/**
 * Output module for vibecheck CLI
 * Contains functions for formatting and displaying output
 */
const chalk = require("chalk");
const { colors, createColorSwatches, createSection, createKeyValueList, success, divider } = require("./styles");
const terminalLink = require("terminal-link");
const path = require("path");

/**
 * Extracts a title from the markdown content
 * @param {string} markdown - Markdown content
 * @returns {string} - Extracted title
 */
function extractTitle(markdown) {
  const titleMatch = markdown.match(/^#\s+(.+?)(\r?\n|$)/);
  return titleMatch ? titleMatch[1] : "Aesthetic Guide";
}

/**
 * Extracts color palette from markdown content
 * @param {string} markdown - Markdown content
 * @returns {Array} - Array of color objects with hex and name properties
 */
function extractColorPalette(markdown) {
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
  const colorSection = markdown.match(/##\s+Color\s+Palette[\s\S]+?(?=##|$)/i);
  
  if (!colorSection) return [];
  
  const colorText = colorSection[0];
  const hexMatches = colorText.match(hexRegex);
  
  if (!hexMatches) return [];
  
  // Try to extract color names as well
  const colorData = [];
  const colorLines = colorText.split("\n");
  
  for (const line of colorLines) {
    const hexMatch = line.match(hexRegex);
    if (hexMatch && hexMatch[0]) {
      const hex = hexMatch[0];
      // Try to extract a name by looking for text after the hex code
      const afterHex = line.split(hex)[1];
      const name = afterHex ? afterHex.trim().split(/[:\-–—]/)[0].trim() : "Color";
      
      colorData.push({ hex, name });
    }
  }
  
  if (colorData.length === 0 && hexMatches) {
    // Fallback to just the hex codes if we couldn't extract names
    return hexMatches.map((hex, i) => ({ hex, name: `Color ${i+1}` }));
  }
  
  return colorData;
}

/**
 * Creates a summary of the aesthetic guide
 * @param {string} markdown - Markdown content
 * @returns {string} - Formatted summary
 */
function createSummary(markdown) {
  const title = extractTitle(markdown);
  const colors = extractColorPalette(markdown);
  
  // Get terminal width to ensure the summary fits
  const terminalWidth = process.stdout.columns || 80;
  
  // Truncate title if it's extremely long
  const maxTitleLength = Math.min(terminalWidth - 40, 80);
  const displayTitle = title.length > maxTitleLength ? 
    title.substring(0, maxTitleLength - 3) + '...' : 
    title;
  
  // Create the analysis section
  const analysisSection = createSection("Analysis Complete", 
    `  ${chalk.hex(colors[0]?.hex || "#9D50BB")("✨")} Detected aesthetic: "${chalk.hex(colors[0]?.hex || "#9D50BB").bold(displayTitle)}"`
  );
  
  let result = analysisSection;
  
  // Add color palette if available
  if (colors.length > 0) {
    result += createColorSwatches(colors);
  }
  
  return result;
}

/**
 * Creates a success message for the completed analysis
 * @param {string} outputPath - Path where the output was saved
 * @returns {string} - Formatted success message
 */
function createSuccessMessage(outputPath) {
  const terminalWidth = process.stdout.columns || 80;
  
  // Create a clickable link to the file
  const link = terminalLink(outputPath, `file://${outputPath}`);
  
  // Format the path to handle long paths
  const displayPath = formatPath(outputPath);
  
  // Create the success section
  return createSection("Success", 
    `  ${chalk.green("✨")} Your aesthetic guide has been generated!\n\n` +
    `  ${chalk.dim("File saved to:")}\n  ${chalk.cyan(link)}`
  );
}

/**
 * Formats an error message
 * @param {string} message - Error message
 * @returns {string} - Formatted error message
 */
function formatError(message) {
  return createSection("Error", 
    `  ${chalk.red("✗")} ${message}`
  );
}

/**
 * Creates an image info display
 * @param {Object} imageInfo - Object with image properties
 * @returns {string} - Formatted image info
 */
function createImageInfo(imageInfo) {
  const { filename, path: imagePath, dimensions } = imageInfo;
  
  // Format values to ensure they fit
  let displayFilename = filename || "Unknown";
  let displayPath = formatPath(imagePath);
  
  const info = {
    "Image": displayFilename,
    "Dimensions": dimensions ? `${dimensions.width}x${dimensions.height}` : "Unknown",
    "Path": displayPath
  };
  
  return createSection("Image Information", createKeyValueList(info));
}

/**
 * Formats a path to handle long paths elegantly
 * @param {string} pathString - Path to format
 * @returns {string} - Formatted path
 */
function formatPath(pathString) {
  if (!pathString) return "Unknown";
  
  const terminalWidth = process.stdout.columns || 80;
  const maxPathLength = Math.max(terminalWidth - 20, 40);
  
  // If path is already short enough, return it as is
  if (pathString.length <= maxPathLength) {
    return pathString;
  }
  
  // Split the path into directory and filename
  const dirname = path.dirname(pathString);
  const basename = path.basename(pathString);
  
  // Determine how much space to allocate for the directory part
  const dirMaxLength = maxPathLength - basename.length - 4; // 4 for ".../" and some padding
  
  if (dirMaxLength <= 10) {
    // If the directory part would be too short, just truncate the whole path
    return pathString.substring(0, maxPathLength - 3) + "...";
  }
  
  // Shorten the directory part with ... in the middle
  const halfDirLength = Math.floor(dirMaxLength / 2);
  const shortenedDir = dirname.substring(0, halfDirLength) + "..." + 
                      dirname.substring(dirname.length - halfDirLength);
  
  return shortenedDir + "/" + basename;
}

module.exports = {
  extractTitle,
  extractColorPalette,
  createSummary,
  createSuccessMessage,
  formatError,
  createImageInfo,
  formatPath
};