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
 * Copies the image file to the output directory
 * @param {string} imagePath - Path to the original image
 * @param {string} outputPath - Path to the markdown output file
 * @returns {string} - Relative path to the copied image
 */
function copyImageFile(imagePath, outputPath) {
  if (!imagePath) return null;
  
  const outputDir = path.dirname(outputPath);
  const imageExt = path.extname(imagePath);
  const outputBasename = path.basename(outputPath, path.extname(outputPath));
  const timestamp = Date.now();
  const imageFilename = `${outputBasename}_image_${timestamp}${imageExt}`;
  const imageCopyPath = path.join(outputDir, imageFilename);
  
  try {
    fs.copyFileSync(imagePath, imageCopyPath);
    // Return a path relative to the markdown file
    return imageFilename;
  } catch (error) {
    // If copying fails, just log the error but continue
    console.error(`Warning: Could not copy image file: ${error.message}`);
    return null;
  }
}

/**
 * Writes content to a file with optional embedded image
 * @param {string} content - Content to write
 * @param {string} outputPath - Path to write output to
 * @param {Object} options - Additional options
 * @param {string} options.imagePath - Path to the original image
 * @param {boolean} options.includeImage - Whether to include the image in output
 * @returns {string} - Path where content was written
 */
function writeOutput(content, outputPath, options = {}) {
  validateOutputPath(outputPath);
  let finalContent = content;
  
  // If image path is provided and includeImage is not explicitly false
  if (options.imagePath && options.includeImage !== false) {
    const relativeImagePath = copyImageFile(options.imagePath, outputPath);
    
    // If image was successfully copied, add it to the markdown
    if (relativeImagePath) {
      finalContent = `![Aesthetic Image](${relativeImagePath})\n\n${content}`;
    }
  }
  
  try {
    fs.writeFileSync(outputPath, finalContent, { encoding: "utf8" });
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to write output: ${error.message}`);
  }
}

module.exports = {
  validateOutputPath,
  writeOutput,
  copyImageFile
};