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
    frames: ["⠂", "⠄", "⠆", "⠇", "⠋", "⠙", "⠸", "⠰", "⠠", "⠀"],
    interval: 150
  },
  dots: {
    frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳"],
    interval: 150
  },
  pulse: {
    frames: ["▪", "▫"],
    interval: 400
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
    // Don't clear console, just update the lines we need
    if (!active) return;
    
    process.stdout.write("\r\x1b[K"); // Clear current line
    
    let output = "";
    spinners.forEach((spinner, index) => {
      let prefix;
      
      if (spinner.status === "pending") {
        if (index === currentIndex) {
          const frameIndex = Math.floor(Date.now() / spinner.spinner.interval) % spinner.spinner.frames.length;
          prefix = chalk.cyan(spinner.spinner.frames[frameIndex]);
        } else {
          prefix = chalk.dim("·");
        }
      } else if (spinner.status === "success") {
        prefix = chalk.hex(colors.success)("✓");
      } else if (spinner.status === "error") {
        prefix = chalk.hex(colors.error)("✗");
      }
      
      output += `${prefix} ${spinner.text}`;
      if (index < spinners.length - 1) {
        output += "\n";
      }
    });
    
    process.stdout.write(output);
  };
  
  const start = () => {
    active = true;
    timer = setInterval(renderSpinners, 150);
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
 * @param {Object} options - Additional options for the progress bar
 * @returns {Object} - CLI progress bar instance
 */
function createProgressBar(format = "Analyzing: {bar} | {percentage}%", options = {}) {
  const progressBar = new cliProgress.SingleBar({
    format,
    barCompleteChar: "━",
    barIncompleteChar: "╌",
    hideCursor: true,
    clearOnComplete: true,
    barsize: 20,
    forceRedraw: false,
    fps: 5,
    ...options
  }, cliProgress.Presets.shades_classic);
  
  return progressBar;
}

/**
 * Creates a stylized process progress bar
 * @param {Array} steps - Array of process step names
 * @returns {Object} - Object with progress bar and control methods
 */
function createProcessBar(steps) {
  // Define colors for the progress bar
  const barColor = chalk.hex(colors.secondary);
  const textColor = chalk.hex(colors.tertiary);
  const completedStepColor = chalk.hex(colors.success);
  const activeStepColor = chalk.hex(colors.accent);
  const pendingStepColor = chalk.dim;
  
  // Create a simple, non-seizure-inducing format
  const format = `{stepName} | ${textColor('{percentage}%')} ${barColor('{bar}')}`;
  
  const progressBar = createProgressBar(format, {
    barsize: 15,
    barCompleteChar: "━",
    barIncompleteChar: "╌",
    forceRedraw: false,
    fps: 5
  });
  
  let currentStep = 0;
  let totalSteps = steps.length;
  
  // Initialize progress bar
  const start = () => {
    progressBar.start(totalSteps, 0, {
      stepName: getStepDisplay()
    });
    return api;
  };
  
  // Update to a specific step
  const updateStep = (step) => {
    if (step >= 0 && step <= totalSteps) {
      currentStep = step;
      progressBar.update(currentStep, {
        stepName: getStepDisplay()
      });
    }
    return api;
  };
  
  // Move to the next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      currentStep++;
      progressBar.update(currentStep, {
        stepName: getStepDisplay()
      });
      
      if (currentStep === totalSteps) {
        progressBar.stop();
      }
    }
    return api;
  };
  
  // Complete the progress bar
  const complete = (message = "Complete") => {
    currentStep = totalSteps;
    progressBar.update(totalSteps, {
      stepName: completedStepColor(message)
    });
    progressBar.stop();
    return api;
  };
  
  // Get a formatted display of the current step
  const getStepDisplay = () => {
    const step = steps[currentStep];
    return activeStepColor(step);
  };
  
  const api = {
    start,
    updateStep,
    nextStep,
    complete,
    bar: progressBar
  };
  
  return api;
}

module.exports = {
  createSpinner,
  createMultiSpinner,
  createProgressBar,
  createProcessBar,
  spinnerFrames
};