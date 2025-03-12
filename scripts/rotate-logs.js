// rotate-logs.js
// Script to rotate log files before starting a new logging session

const fs = require('fs');
const path = require('path');

// Configuration
const LOG_DIR = path.join(process.cwd(), 'logs');
const CURRENT_LOG = path.join(LOG_DIR, 'dev.log');
const MAX_SAVED_LOGS = 5; // Keep at most this many old log files

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  console.log(`Created logs directory at ${LOG_DIR}`);
}

// Function to rotate logs
function rotateLogs() {
  // Check if current log exists
  if (fs.existsSync(CURRENT_LOG)) {
    // Get current date-time for naming the rotated log
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-') // Replace colons with hyphens for filename compatibility
      .replace(/\..+/, ''); // Remove milliseconds
    
    const rotatedFilename = `dev.${timestamp}.log`;
    const rotatedPath = path.join(LOG_DIR, rotatedFilename);
    
    // Rename current log to include timestamp
    fs.renameSync(CURRENT_LOG, rotatedPath);
    console.log(`Rotated current log to ${rotatedFilename}`);
    
    // Cleanup old logs if we have too many
    cleanupOldLogs();
  } else {
    console.log('No current log file exists, creating a new one.');
  }
  
  // Create an empty log file
  fs.writeFileSync(CURRENT_LOG, `=== Log started at ${new Date().toISOString()} ===\n\n`);
  console.log(`Created new log file at ${CURRENT_LOG}`);
}

// Function to cleanup old logs, keeping only the most recent MAX_SAVED_LOGS
function cleanupOldLogs() {
  const logFiles = fs.readdirSync(LOG_DIR)
    .filter(filename => filename.startsWith('dev.') && filename.endsWith('.log') && filename !== 'dev.log')
    .map(filename => ({
      name: filename,
      path: path.join(LOG_DIR, filename),
      timestamp: filename.replace('dev.', '').replace('.log', '')
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Sort newest first
  
  // If we have more logs than our maximum, delete the oldest ones
  if (logFiles.length > MAX_SAVED_LOGS) {
    const logsToDelete = logFiles.slice(MAX_SAVED_LOGS);
    logsToDelete.forEach(log => {
      fs.unlinkSync(log.path);
      console.log(`Deleted old log file: ${log.name}`);
    });
  }
}

// Execute the log rotation
rotateLogs();