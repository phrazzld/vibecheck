// view-logs.js
// Advanced log viewer utility

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const LOG_DIR = path.join(process.cwd(), 'logs');
const CURRENT_LOG = path.join(LOG_DIR, 'dev.log');

// Process command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const showErrors = args.includes('--errors') || args.includes('-e');
const tailMode = args.includes('--tail') || args.includes('-t');
const lastLines = args.includes('--last') || args.includes('-l');
const lineCount = getArgValue(args, '--lines', '-n') || '50'; // Default to 50 lines

// Display help
if (showHelp) {
  console.log(`
Log Viewer Utility
-----------------
Usage: npm run logs:view -- [options]

Options:
  --help, -h       Show this help message
  --errors, -e     Show only error entries
  --tail, -t       Tail the log file (continuous monitoring)
  --last, -l       Show only the last N lines (default: 50)
  --lines N, -n N  Specify the number of lines to show (default: 50)

Examples:
  npm run logs:view                  Show the entire log file
  npm run logs:view -- --errors      Show only error entries
  npm run logs:view -- --tail        Continuously monitor the log file
  npm run logs:view -- --last        Show the last 50 lines
  npm run logs:view -- -l -n 100     Show the last 100 lines
  `);
  process.exit(0);
}

// Function to extract numeric value for an argument
function getArgValue(args, longFlag, shortFlag) {
  const longIndex = args.indexOf(longFlag);
  const shortIndex = args.indexOf(shortFlag);
  
  if (longIndex !== -1 && longIndex + 1 < args.length) {
    return args[longIndex + 1];
  }
  
  if (shortIndex !== -1 && shortIndex + 1 < args.length) {
    return args[shortIndex + 1];
  }
  
  return null;
}

// Check if log file exists
if (!fs.existsSync(CURRENT_LOG)) {
  console.error(`Log file not found: ${CURRENT_LOG}`);
  console.error('Run "npm run dev:log" to start the dev server with logging enabled.');
  process.exit(1);
}

// Function to filter log line based on options
function shouldDisplayLine(line) {
  if (!showErrors) {
    return true;
  }
  // Only show error entries if --errors flag is used
  return line.includes('[stderr]') || line.includes('error') || line.includes('Error');
}

// Function to tail the log file
function tailLogFile() {
  console.log(`Tailing log file: ${CURRENT_LOG}`);
  console.log('Press Ctrl+C to exit\n');
  
  const watcher = fs.watch(CURRENT_LOG, (eventType) => {
    if (eventType === 'change') {
      const newContent = fs.readFileSync(CURRENT_LOG, 'utf8');
      const lines = newContent.split('\n');
      const newLine = lines[lines.length - 2]; // Last line is usually empty
      
      if (newLine && shouldDisplayLine(newLine)) {
        console.log(newLine);
      }
    }
  });
  
  // Also read and display current content
  const lines = fs.readFileSync(CURRENT_LOG, 'utf8').split('\n');
  lines.forEach(line => {
    if (line && shouldDisplayLine(line)) {
      console.log(line);
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

// Function to show last N lines of the log file
function showLastLines(n) {
  console.log(`Showing last ${n} lines from: ${CURRENT_LOG}\n`);
  
  const lines = fs.readFileSync(CURRENT_LOG, 'utf8').split('\n');
  const filteredLines = lines.filter(line => line && shouldDisplayLine(line));
  
  // Get the last N lines
  const lastN = filteredLines.slice(-n);
  lastN.forEach(line => console.log(line));
}

// Function to view the entire log file
function viewLogFile() {
  console.log(`Viewing log file: ${CURRENT_LOG}\n`);
  
  const fileStream = fs.createReadStream(CURRENT_LOG);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  rl.on('line', (line) => {
    if (shouldDisplayLine(line)) {
      console.log(line);
    }
  });
  
  rl.on('close', () => {
    console.log('\nEnd of log file');
  });
}

// Execute the appropriate action based on command line arguments
if (tailMode) {
  tailLogFile();
} else if (lastLines) {
  showLastLines(parseInt(lineCount, 10));
} else {
  viewLogFile();
}