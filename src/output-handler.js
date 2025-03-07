/**
 * Output handler module for vibecheck CLI.
 * Manages writing output to files.
 */
const fs = require("fs");
const path = require("path");

/**
 * Validates output path and creates any necessary directories
 * @param {string} outputPath - Path to write output to
 * @returns {boolean} - True if path is valid and writable
 */
function validateOutputPath(outputPath) {
  // Ensure parent directory exists
  const dirname = path.dirname(outputPath);
  
  if (!fs.existsSync(dirname)) {
    try {
      fs.mkdirSync(dirname, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirname}: ${error.message}`);
    }
  }
  
  // Check if output path is writable
  try {
    fs.accessSync(dirname, fs.constants.W_OK);
    return true;
  } catch (error) {
    throw new Error(`Output directory is not writable: ${dirname}`);
  }
}

/**
 * Writes content to a file
 * @param {string} content - Content to write
 * @param {string} outputPath - Path to write output to
 * @returns {string} - Path where content was written
 */
function writeOutput(content, outputPath) {
  validateOutputPath(outputPath);
  
  try {
    fs.writeFileSync(outputPath, content, { encoding: "utf8" });
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to write output: ${error.message}`);
  }
}

module.exports = {
  validateOutputPath,
  writeOutput
};