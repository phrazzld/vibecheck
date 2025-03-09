/**
 * Enhanced progress display components for vibecheck CLI
 * Implements more subtle, informative progress indicators
 */
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const ora = require('ora');
const { colors } = require('../styles');

// Collection of interesting tips to show during processing
const tipCollection = [
  "Color psychology suggests blue promotes trust and calm",
  "The golden ratio (1.618) creates visually pleasing proportions",
  "White space isn't empty - it's a powerful design element",
  "Typography accounts for 95% of web design",
  "High contrast between text and background improves readability",
  "Consistent spacing creates visual harmony in interfaces",
  "Color choices can affect user emotion and behavior",
  "A well-designed UI can reduce user cognitive load",
  "Users typically scan interfaces in an F-shaped pattern",
  "Mobile design should optimize for thumb-friendly zones",
  "Microinteractions add delight to user experiences",
  "Interface animations should serve a functional purpose",
  "Design systems create consistency across products",
  "Accessibility is a fundamental aspect of good UX design",
  "Motion can direct attention to important elements"
];

/**
 * Creates a simple spinner with minimal animation
 * @param {string} text - Text to display with the spinner
 * @returns {Object} - Ora spinner instance
 */
function createSimpleSpinner(text) {
  return ora({
    text: `  ${text}`,
    spinner: {
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      interval: 120
    },
    color: 'cyan'
  });
}

/**
 * Creates a contextual spinner with tip display
 * @param {string} text - Primary text to display
 * @param {string} contextText - Secondary context information
 * @returns {Object} - Enhanced spinner with methods
 */
function createContextSpinner(text, contextText = null) {
  // Create standard spinner
  const spinner = createSimpleSpinner(text);
  let tipInterval = null;
  let currentTip = '';
  let active = false;
  
  // Function to get a random tip
  const getRandomTip = () => {
    const tip = tipCollection[Math.floor(Math.random() * tipCollection.length)];
    return `  ${chalk.dim.italic(tip)}`;
  };
  
  // Override start method
  const originalStart = spinner.start;
  spinner.start = (startText) => {
    active = true;
    if (startText) text = startText;
    
    // Start displaying tips if waiting time might be longer
    currentTip = getRandomTip();
    console.log(currentTip);
    
    tipInterval = setInterval(() => {
      if (!active) return;
      
      // Clear previous tip and show a new one
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(0);
      currentTip = getRandomTip();
      console.log(currentTip);
    }, 8000); // Change tip every 8 seconds
    
    // Call original start
    return originalStart.call(spinner, `  ${text}`);
  };
  
  // Override stop method to clean up
  const originalStop = spinner.stop;
  spinner.stop = () => {
    active = false;
    if (tipInterval) {
      clearInterval(tipInterval);
      // Clear the tip line
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(0);
    }
    return originalStop.call(spinner);
  };
  
  // Add context update method
  spinner.updateContext = (newContext) => {
    if (!active || !newContext) return spinner;
    spinner.text = `  ${text} - ${chalk.dim(newContext)}`;
    return spinner;
  };
  
  return spinner;
}

/**
 * Creates a minimal progress bar
 * @param {string} label - Label for the progress bar
 * @param {Object} options - Additional options
 * @returns {Object} - CLI progress bar instance
 */
function createMinimalProgress(label, options = {}) {
  // Default format focuses on percentage and simple bar
  const defaultFormat = `  ${label} ${chalk.hex(colors.secondary)('{bar}')} {percentage}%`;
  
  const progressBar = new cliProgress.SingleBar({
    format: options.format || defaultFormat,
    barCompleteChar: '━',
    barIncompleteChar: '╌',
    hideCursor: true,
    clearOnComplete: false,
    barsize: 20,
    fps: 5,
    ...options
  }, cliProgress.Presets.shades_classic);
  
  return progressBar;
}

/**
 * Creates a multi-step progress tracker
 * @param {Array} steps - Array of step descriptions
 * @returns {Object} - Progress tracker with methods
 */
function createWorkflow(steps) {
  let currentStep = 0;
  const totalSteps = steps.length;
  
  // Render the initial workflow
  function render() {
    // Clear previous output if any
    if (currentStep > 0) {
      process.stdout.write('\r\x1b[K');
    }
    
    console.log(chalk.hex(colors.primary)(`\n  Progress: ${currentStep}/${totalSteps} steps completed`));
    
    // Render each step with appropriate styling
    steps.forEach((step, index) => {
      let stepIndicator;
      if (index < currentStep) {
        // Completed step
        stepIndicator = chalk.hex(colors.success)('✓');
      } else if (index === currentStep) {
        // Current step
        stepIndicator = chalk.hex(colors.secondary)('▶');
      } else {
        // Future step
        stepIndicator = chalk.dim('◦');
      }
      
      // Format the text based on step status
      let textFormat;
      if (index < currentStep) {
        textFormat = chalk.dim; // Completed = dimmed
      } else if (index === currentStep) {
        textFormat = chalk.hex(colors.secondary); // Current = highlighted
      } else {
        textFormat = chalk.dim; // Future = dimmed
      }
      
      console.log(`  ${stepIndicator} ${textFormat(step)}`);
    });
    
    // Add a separator after the steps
    if (currentStep < totalSteps) {
      console.log('');
    }
  }
  
  // Initial render
  render();
  
  // API for controlling the workflow
  return {
    next: (contextText = null) => {
      if (currentStep >= totalSteps) return;
      
      currentStep++;
      
      // Clear previous output and render updated state
      // Calculate lines to move up (steps + header + blank line)
      const linesToClear = totalSteps + 2;
      process.stdout.moveCursor(0, -linesToClear);
      
      for (let i = 0; i < linesToClear; i++) {
        process.stdout.clearLine(0);
        process.stdout.moveCursor(0, 1);
      }
      process.stdout.moveCursor(0, -linesToClear);
      
      render();
      
      // If context is provided, show it
      if (contextText) {
        console.log(`  ${chalk.dim(contextText)}`);
      }
      
      return currentStep;
    },
    
    complete: () => {
      // Move to the final step if not already there
      while (currentStep < totalSteps) {
        currentStep++;
      }
      
      // Clear and render final state
      const linesToClear = totalSteps + 2;
      process.stdout.moveCursor(0, -linesToClear);
      
      for (let i = 0; i < linesToClear; i++) {
        process.stdout.clearLine(0);
        process.stdout.moveCursor(0, 1);
      }
      process.stdout.moveCursor(0, -linesToClear);
      
      render();
      
      console.log(chalk.hex(colors.success)(`\n  ✨ All steps completed successfully\n`));
    },
    
    getCurrentStep: () => currentStep
  };
}

module.exports = {
  createSimpleSpinner,
  createContextSpinner,
  createMinimalProgress,
  createWorkflow,
  tipCollection
};