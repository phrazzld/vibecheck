// log-dev.js
// Script to start the dev server and pipe output to the log file

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const LOG_DIR = path.join(process.cwd(), 'logs');
const CURRENT_LOG = path.join(LOG_DIR, 'dev.log');

// Open the log file in append mode
const logStream = fs.createWriteStream(CURRENT_LOG, { flags: 'a' });

// First, run the log rotation script
require('./rotate-logs');

// Function to format the current time for log entries
function timePrefix() {
  const now = new Date();
  return `[${now.toISOString()}] `;
}

// Log start of application with environment info
const nodeVersion = process.version;
const osInfo = `${process.platform} ${process.arch}`;

logStream.write(`${timePrefix()}Starting dev server with:\n`);
logStream.write(`${timePrefix()}Node.js: ${nodeVersion}\n`);
logStream.write(`${timePrefix()}OS: ${osInfo}\n`);
logStream.write(`${timePrefix()}Working directory: ${process.cwd()}\n\n`);

// Start the Next.js dev server with turbopack
const nextDev = spawn('next', ['dev', '--turbopack'], {
  // Inherit environment variables
  env: { ...process.env, FORCE_COLOR: '1' }, // Keep colors in logs
  shell: true
});

// Log server start
console.log('Starting Next.js dev server with logging enabled...');
console.log(`Logs being written to: ${CURRENT_LOG}`);

// Pipe standard output to both console and log file
nextDev.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output); // Write to console
  logStream.write(`${timePrefix()}[stdout] ${output}`); // Write to log file
});

// Pipe standard error to both console and log file
nextDev.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output); // Write to console
  logStream.write(`${timePrefix()}[stderr] ${output}`); // Write to log file
});

// Handle process exit
nextDev.on('close', (code) => {
  const message = `${timePrefix()}Next.js dev server exited with code ${code}\n`;
  console.log(message);
  logStream.write(message);
  logStream.end();
});

// Handle script termination signals
process.on('SIGINT', () => {
  const message = `${timePrefix()}Received SIGINT, shutting down dev server...\n`;
  console.log(message);
  logStream.write(message);
  nextDev.kill('SIGINT');
  // Give it a moment to exit cleanly
  setTimeout(() => {
    logStream.end();
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  const message = `${timePrefix()}Received SIGTERM, shutting down dev server...\n`;
  console.log(message);
  logStream.write(message);
  nextDev.kill('SIGTERM');
  // Give it a moment to exit cleanly
  setTimeout(() => {
    logStream.end();
    process.exit(0);
  }, 1000);
});