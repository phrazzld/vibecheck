/**
 * Session management component for vibecheck CLI
 * Handles saving and loading previous sessions
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { colors } = require('../styles');

// Session storage file path
const SESSION_FILE = '.vibecheck-session';

/**
 * Gets the full path to the session file
 * @returns {string} - Full path to session file
 */
function getSessionFilePath() {
  return path.join(process.cwd(), SESSION_FILE);
}

/**
 * Saves the current session
 * @param {Object} options - Current session options
 * @returns {boolean} - True if session was saved successfully
 */
function saveSession(options) {
  try {
    // Get existing session if available
    let sessionData = {};
    try {
      sessionData = JSON.parse(fs.readFileSync(getSessionFilePath(), 'utf8'));
    } catch (err) {
      // Ignore if file doesn't exist or has invalid format
    }
    
    // Create a timestamp for the session
    const timestamp = new Date().toISOString();
    
    // Track recent images (keeping up to 5)
    const recentImages = sessionData.recentImages || [];
    if (options.image && !recentImages.includes(options.image)) {
      recentImages.unshift(options.image);
      if (recentImages.length > 5) {
        recentImages.pop();
      }
    }
    
    // Update session data
    const updatedSession = {
      ...sessionData,
      lastSession: {
        image: options.image,
        output: options.output,
        detail: options.detail,
        model: options.model,
        designPhilosophy: options.designPhilosophy,
        application: options.application,
        timestamp
      },
      recentImages
    };
    
    // Save to file
    fs.writeFileSync(getSessionFilePath(), JSON.stringify(updatedSession, null, 2));
    return true;
  } catch (err) {
    console.error(chalk.red(`Failed to save session: ${err.message}`));
    return false;
  }
}

/**
 * Loads the previous session
 * @returns {Object|null} - Session data or null if not available
 */
function loadSession() {
  try {
    const sessionData = JSON.parse(fs.readFileSync(getSessionFilePath(), 'utf8'));
    return sessionData.lastSession || null;
  } catch (err) {
    return null;
  }
}

/**
 * Gets a list of recent images
 * @returns {Array} - Array of recent image paths
 */
function getRecentImages() {
  try {
    const sessionData = JSON.parse(fs.readFileSync(getSessionFilePath(), 'utf8'));
    return sessionData.recentImages || [];
  } catch (err) {
    return [];
  }
}

/**
 * Displays a summary of the previous session
 * @returns {string} - Formatted summary or message if no session found
 */
function getSessionSummary() {
  const session = loadSession();
  
  if (!session) {
    return chalk.yellow('\n  No previous session found.\n');
  }
  
  // Format the timestamp to be more readable
  const timestamp = new Date(session.timestamp);
  const formattedDate = timestamp.toLocaleDateString();
  const formattedTime = timestamp.toLocaleTimeString();
  
  // Create a summary of the session
  const summary = `
  ${chalk.hex(colors.primary).bold('Continue Previous Project')}
  
  ${chalk.dim('Last analysis performed:')} ${formattedDate} at ${formattedTime}
  
  ${chalk.dim('Image:')} ${path.basename(session.image || 'None')}
  ${chalk.dim('Model:')} ${session.model || 'gpt-4o'}
  ${chalk.dim('Detail:')} ${session.detail || 'auto'}
  ${chalk.dim('Output:')} ${session.output || 'AESTHETIC.md'}
  `;
  
  return summary;
}

/**
 * Prompts user to confirm loading previous session
 * @param {Object} inquirer - Inquirer instance
 * @returns {Promise<boolean>} - True if user confirms
 */
async function confirmLoadSession(inquirer) {
  const session = loadSession();
  
  if (!session) {
    console.log(chalk.yellow('\n  No previous session found. Starting new session.\n'));
    return false;
  }
  
  // Show session summary
  console.log(getSessionSummary());
  
  // Ask for confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Load these settings?',
      default: true
    }
  ]);
  
  return confirm;
}

module.exports = {
  saveSession,
  loadSession,
  getRecentImages,
  getSessionSummary,
  confirmLoadSession
};