/**
 * Styling module for vibecheck CLI
 * Contains color schemes, styling functions, and visual components
 */
const chalk = require("chalk");
const gradient = require("gradient-string");
const figlet = require("figlet");
const boxen = require("boxen");

// Brand color palette
const colors = {
  primary: "#9D50BB",   // Deep purple
  secondary: "#6E48AA", // Medium purple
  tertiary: "#4776E6",  // Blue
  accent: "#38A0D0",    // Cyan
  success: "#2ECC71",   // Green
  warning: "#F39C12",   // Orange
  error: "#E74C3C",     // Red
  info: "#3498DB",      // Light blue
  muted: "#95A5A6",     // Gray
};

// Create the vibecheck gradient
const vibecheckGradient = gradient([
  colors.primary,
  colors.secondary, 
  colors.tertiary,
  colors.accent
]);

/**
 * Creates a styled header banner for vibecheck
 * @returns {string} - Styled header banner
 */
function createHeader() {
  const figletText = figlet.textSync("vibecheck", {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default"
  });
  
  return `\n${vibecheckGradient(figletText)}\n${chalk.dim("Transform images into aesthetic style guides")}\n`;
}

/**
 * Creates a section with a styled header
 * @param {string} title - Section title
 * @param {string} content - Section content
 * @returns {string} - Formatted section
 */
function createSection(title, content) {
  const separatorChar = "─";
  const terminalWidth = process.stdout.columns || 80;
  const width = Math.min(terminalWidth, 80);
  
  const titleGradient = gradient([colors.secondary, colors.tertiary]);
  
  // Calculate the actual displayed length of the title (without ANSI escape codes)
  // We add 2 for the spaces around the title
  const titleVisualLength = title.length + 2;
  const formattedTitle = ` ${titleGradient(title)} `;
  
  // Ensure we don't have negative values for separator lengths
  const leftSeparatorLength = Math.max(0, Math.floor((width - titleVisualLength) / 2));
  const rightSeparatorLength = Math.max(0, Math.ceil((width - titleVisualLength) / 2));
  
  const leftSeparator = separatorChar.repeat(leftSeparatorLength);
  const rightSeparator = separatorChar.repeat(rightSeparatorLength);
  
  const separator = chalk.dim(`${leftSeparator}${formattedTitle}${rightSeparator}`);
  
  return `\n${separator}\n${content}\n`;
}

/**
 * Creates styled key-value pairs for data display
 * @param {Object} data - Data to display
 * @returns {string} - Formatted key-value pairs
 */
function createKeyValueList(data) {
  const lines = Object.entries(data).map(([key, value]) => {
    return `  ${chalk.dim(key + ":")} ${value}`;
  });
  
  return lines.join("\n");
}

/**
 * Formats a success message
 * @param {string} message - Message to format
 * @returns {string} - Formatted success message
 */
function success(message) {
  return `${chalk.hex(colors.success)("✓")} ${message}`;
}

/**
 * Formats an error message
 * @param {string} message - Message to format
 * @returns {string} - Formatted error message
 */
function error(message) {
  return `${chalk.hex(colors.error)("✗")} ${message}`;
}

/**
 * Formats a warning message
 * @param {string} message - Message to format
 * @returns {string} - Formatted warning message
 */
function warning(message) {
  return `${chalk.hex(colors.warning)("⚠")} ${message}`;
}

/**
 * Formats an info message
 * @param {string} message - Message to format
 * @returns {string} - Formatted info message
 */
function info(message) {
  return `${chalk.hex(colors.info)("ℹ")} ${message}`;
}

/**
 * Formats a step message (for progress indicators)
 * @param {string} message - Message to format
 * @returns {string} - Formatted step message
 */
function step(message) {
  return `${chalk.hex(colors.tertiary)("▸")} ${message}`;
}

/**
 * Creates a color swatch display
 * @param {Array} colorData - Array of color objects with hex and name properties
 * @returns {string} - Formatted color swatches
 */
function createColorSwatches(colorData) {
  const terminalWidth = process.stdout.columns || 80;
  const swatchWidth = Math.min(terminalWidth, 80) - 4; // 4 for padding
  const maxNameLength = Math.max(20, Math.floor(swatchWidth / 2));
  
  // Title
  const section = createSection("Color Palette", "");
  
  // Generate swatches
  const swatches = colorData.map(color => {
    // Ensure color name doesn't get too long
    const displayName = color.name.length > maxNameLength ? 
      color.name.substring(0, maxNameLength - 3) + '...' : 
      color.name;
    
    return `  ${chalk.bgHex(color.hex)("        ")} ${chalk.hex(color.hex)(color.hex)} ${chalk.dim(displayName)}`;
  }).join("\n");
  
  return section + swatches;
}

/**
 * Creates a horizontal divider
 * @param {number} width - Width of the divider
 * @returns {string} - Formatted divider
 */
function divider(width = null) {
  const terminalWidth = width || process.stdout.columns || 80;
  const dividerWidth = Math.min(terminalWidth, 80);
  return chalk.dim("─".repeat(dividerWidth));
}

module.exports = {
  colors,
  vibecheckGradient,
  createHeader,
  createSection,
  createKeyValueList,
  createColorSwatches,
  success,
  error,
  warning,
  info,
  step,
  divider
};