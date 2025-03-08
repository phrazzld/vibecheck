/**
 * Progress module for vibecheck CLI
 * Contains progress indicators, spinners, and animations
 */
const ora = require("ora");
const chalk = require("chalk");
const cliProgress = require("cli-progress");
const { colors, step } = require("./styles");

// Custom spinner frames for a more aesthetic experience
const spinnerFrames = {
  aesthetic: {
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
    interval: 80
  },
  dots: {
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80
  },
  pulse: {
    frames: ["█", "▓", "▒", "░", "▒", "▓"],
    interval: 120
  }
};

/**
 * Creates a spinner with the given text
 * @param {string} text - Text to display with the spinner
 * @param {string} spinnerType - Type of spinner to use (aesthetic, dots, pulse)
 * @returns {Object} - Ora spinner instance
 */
function createSpinner(text, spinnerType = "aesthetic") {
  return ora({
    text: step(text),
    spinner: spinnerFrames[spinnerType],
    color: "cyan"
  });
}

/**
 * Creates a multi-spinner for tracking multiple tasks
 * @param {Array} tasks - Array of task descriptions
 * @returns {Object} - Object with spinner instance and methods
 */
function createMultiSpinner(tasks) {
  const spinners = tasks.map(task => {
    return {
      text: task,
      spinner: spinnerFrames.dots,
      color: "cyan",
      status: "pending"
    };
  });
  
  let currentIndex = 0;
  let timer = null;
  let active = false;
  
  const renderSpinners = () => {
    console.clear();
    spinners.forEach((spinner, index) => {
      let prefix;
      
      if (spinner.status === "pending") {
        if (index === currentIndex) {
          const frame = spinner.spinner.frames[Math.floor(Date.now() / spinner.spinner.interval) % spinner.spinner.frames.length];
          prefix = chalk.cyan(frame);
        } else {
          prefix = chalk.dim("○");
        }
      } else if (spinner.status === "success") {
        prefix = chalk.hex(colors.success)("✓");
      } else if (spinner.status === "error") {
        prefix = chalk.hex(colors.error)("✗");
      }
      
      console.log(`${prefix} ${spinner.text}`);
    });
  };
  
  const start = () => {
    active = true;
    timer = setInterval(renderSpinners, 50);
    return api;
  };
  
  const stop = () => {
    active = false;
    if (timer) clearInterval(timer);
    return api;
  };
  
  const succeed = (index = currentIndex) => {
    spinners[index].status = "success";
    if (currentIndex === index) {
      currentIndex++;
      if (currentIndex < spinners.length) {
        renderSpinners();
      } else {
        stop();
        renderSpinners();
      }
    }
    return api;
  };
  
  const fail = (index = currentIndex) => {
    spinners[index].status = "error";
    if (currentIndex === index) {
      currentIndex++;
      if (currentIndex < spinners.length) {
        renderSpinners();
      } else {
        stop();
        renderSpinners();
      }
    }
    return api;
  };
  
  const api = {
    start,
    stop,
    succeed,
    fail,
    spinners
  };
  
  return api;
}

/**
 * Creates a progress bar
 * @param {string} format - Format string for the progress bar
 * @returns {Object} - CLI progress bar instance
 */
function createProgressBar(format = "Analyzing: {bar} | {percentage}% | {value}/{total} tasks") {
  const progressBar = new cliProgress.SingleBar({
    format,
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
    clearOnComplete: true,
    barsize: 30,
    forceRedraw: true
  }, cliProgress.Presets.shades_classic);
  
  return progressBar;
}

module.exports = {
  createSpinner,
  createMultiSpinner,
  createProgressBar,
  spinnerFrames
};