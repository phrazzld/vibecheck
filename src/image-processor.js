/**
 * Image processor module for vibecheck CLI.
 * Handles reading and encoding images.
 */
const fs = require("fs");
const path = require("path");

/**
 * Validates if the image file exists and is accessible
 * @param {string} imagePath - Path to the image file
 * @returns {boolean} - True if the file exists and is accessible
 */
function validateImagePath(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`File not found: ${imagePath}`);
  }
  
  // Check if it's a file and not a directory
  const stats = fs.statSync(imagePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${imagePath}`);
  }
  
  return true;
}

/**
 * Encodes an image file to base64
 * @param {string} imagePath - Path to the image file
 * @returns {string} - Base64 encoded image data
 */
function encodeImageToBase64(imagePath) {
  validateImagePath(imagePath);
  
  try {
    const fileData = fs.readFileSync(imagePath);
    return fileData.toString("base64");
  } catch (error) {
    throw new Error(`Failed to encode image: ${error.message}`);
  }
}

/**
 * Gets the MIME type based on file extension
 * @param {string} imagePath - Path to the image file
 * @returns {string} - MIME type string for the image
 */
function getImageMimeType(imagePath) {
  const extension = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif"
  };
  
  return mimeTypes[extension] || "image/jpeg";
}

/**
 * Creates a data URL from a base64-encoded image
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} imagePath - Original image path (for MIME type detection)
 * @returns {string} - Data URL string
 */
function createDataUrl(base64Image, imagePath) {
  const mimeType = getImageMimeType(imagePath);
  return `data:${mimeType};base64,${base64Image}`;
}

module.exports = {
  validateImagePath,
  encodeImageToBase64,
  getImageMimeType,
  createDataUrl
};