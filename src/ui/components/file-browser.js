/**
 * File browser component for vibecheck CLI
 * Implements path autocomplete and simple file navigation
 */
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { colors } = require('../styles');

// Register the autocomplete prompt
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

/**
 * Get directories and image files in a given path
 * @param {string} dir - Directory to scan
 * @returns {Object} - Object with dirs and images arrays
 */
function getFilesAndDirs(dir) {
  try {
    const items = fs.readdirSync(dir);
    const result = {
      dirs: [],
      images: []
    };

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          result.dirs.push(item);
        } else if (isImageFile(item)) {
          result.images.push(item);
        }
      } catch (err) {
        // Skip items we can't access
      }
    });

    return result;
  } catch (err) {
    return { dirs: [], images: [] };
  }
}

/**
 * Check if a file is an image based on extension
 * @param {string} filename - File name to check
 * @returns {boolean} - True if file is an image
 */
function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * Format directory items for display
 * @param {Object} items - Object with dirs and images arrays
 * @param {string} currentDir - Current directory path
 * @returns {Array} - Formatted items for selection
 */
function formatItems(items, currentDir) {
  const formatted = [];
  
  // Add parent directory option
  if (path.dirname(currentDir) !== currentDir) {
    formatted.push({
      name: chalk.cyan('../ (parent directory)'),
      value: path.dirname(currentDir),
      isDir: true
    });
  }
  
  // Add directories
  items.dirs.sort().forEach(dir => {
    formatted.push({
      name: chalk.cyan(`${dir}/`),
      value: path.join(currentDir, dir),
      isDir: true
    });
  });
  
  // Add image files
  items.images.sort().forEach(file => {
    formatted.push({
      name: `${chalk.green('🖼')} ${file}`,
      value: path.join(currentDir, file),
      isDir: false
    });
  });
  
  return formatted;
}

/**
 * Browse for an image file using interactive navigation
 * @param {string} startDir - Starting directory
 * @returns {Promise<string>} - Selected image path
 */
async function browseForImage(startDir = process.cwd()) {
  let currentDir = startDir;
  let selectedPath = null;
  
  console.log(chalk.hex(colors.secondary)('\n  🔍 Image Browser'));
  console.log(chalk.dim('  Navigate to find and select your image file\n'));
  
  while (!selectedPath) {
    // Get items in current directory
    const items = getFilesAndDirs(currentDir);
    const choices = formatItems(items, currentDir);
    
    if (choices.length === 0) {
      console.log(chalk.yellow('  No files or directories found. Try another location.'));
      // Go up one directory if empty
      currentDir = path.dirname(currentDir);
      continue;
    }
    
    // Show current path
    console.log(chalk.dim(`  ${currentDir}`));
    
    // Let user select a file or directory
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select a file or directory:',
        choices: [
          ...choices,
          new inquirer.Separator(),
          { name: chalk.yellow('Cancel and return to manual input'), value: 'cancel' }
        ],
        pageSize: 15
      }
    ]);
    
    if (selected === 'cancel') {
      return null;
    }
    
    // Check if directory or file was selected
    const selectedItem = choices.find(item => item.value === selected);
    if (selectedItem && !selectedItem.isDir) {
      selectedPath = selected;
    } else {
      currentDir = selected;
    }
  }
  
  return selectedPath;
}

/**
 * Get file path with autocomplete
 * @param {string} startDir - Starting directory
 * @param {Array} recentPaths - Array of recently used paths
 * @returns {Promise<string>} - Selected file path
 */
async function getFilePathWithAutocomplete(startDir = process.cwd(), recentPaths = []) {
  // Function to search for matching files and directories
  const searchFiles = async (input = '') => {
    input = input || startDir;
    let basedir = input;
    let searchPattern = '';
    
    // Determine which directory to search and what pattern to match
    if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
      basedir = path.dirname(input);
      searchPattern = path.basename(input).toLowerCase();
      
      // Handle case where path might not exist
      if (!fs.existsSync(basedir)) {
        basedir = startDir;
      }
    }
    
    try {
      const items = fs.readdirSync(basedir);
      const matches = items.filter(item => {
        return item.toLowerCase().includes(searchPattern);
      });
      
      // Format the results
      const formattedResults = matches.map(item => {
        const fullPath = path.join(basedir, item);
        let displayItem;
        
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            displayItem = chalk.cyan(`${item}/`);
          } else if (isImageFile(item)) {
            displayItem = `${chalk.green('🖼')} ${item}`;
          } else {
            displayItem = item;
          }
        } catch (err) {
          displayItem = item;
        }
        
        return {
          name: displayItem,
          value: fullPath
        };
      });
      
      // Add recent paths if we're at the beginning of search
      if (!input || input === startDir) {
        const recentItems = recentPaths.map(p => ({
          name: `${chalk.yellow('♺')} ${path.basename(p)} ${chalk.dim(`(${p})`)}`,
          value: p
        }));
        
        if (recentItems.length > 0) {
          return [
            new inquirer.Separator(' --- Recent Images --- '),
            ...recentItems,
            new inquirer.Separator(' --- Current Directory --- '),
            ...formattedResults
          ];
        }
      }
      
      return formattedResults;
    } catch (err) {
      return [];
    }
  };
  
  // Prompt for file path with autocomplete
  const { filePath } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'filePath',
      message: 'Enter image path (tab to autocomplete, type to search):',
      source: (answersSoFar, input) => searchFiles(input),
      pageSize: 10
    }
  ]);
  
  // If the selected path is a directory, open the browser there
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return browseForImage(filePath);
    }
  } catch (err) {
    // If there's an error, just return the path as entered
  }
  
  return filePath;
}

/**
 * Prompts user for an image path with enhanced selection options
 * @param {string} defaultPath - Default path to use
 * @returns {Promise<string>} - Selected image path
 */
async function promptForImagePath(defaultPath = null) {
  // Get recently used image paths from storage if available
  let recentPaths = [];
  try {
    const sessionData = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.vibecheck-session'), 'utf8'));
    if (sessionData.recentImages && Array.isArray(sessionData.recentImages)) {
      recentPaths = sessionData.recentImages;
    }
  } catch (err) {
    // Ignore if session file doesn't exist or has invalid format
  }
  
  console.log(chalk.hex(colors.primary)('\n  📁 Image Selection'));
  console.log(chalk.dim('  Use tab for autocomplete, arrow keys to navigate\n'));
  
  // Prompt user to choose between autocomplete or browser
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to select your image?',
      choices: [
        { name: '🔎 Browse files interactively', value: 'browse' },
        { name: '⌨️ Enter path with autocomplete', value: 'autocomplete' },
        { name: '✍️ Type path manually', value: 'manual' }
      ]
    }
  ]);
  
  let imagePath;
  
  if (method === 'browse') {
    imagePath = await browseForImage(process.cwd());
    // If user cancelled, fall back to autocomplete
    if (!imagePath) {
      return promptForImagePath(defaultPath);
    }
  } else if (method === 'autocomplete') {
    imagePath = await getFilePathWithAutocomplete(process.cwd(), recentPaths);
  } else {
    // Manual entry
    const { path } = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter the path to your image:',
        default: defaultPath
      }
    ]);
    imagePath = path;
  }
  
  return imagePath;
}

module.exports = {
  promptForImagePath,
  browseForImage,
  getFilePathWithAutocomplete
};