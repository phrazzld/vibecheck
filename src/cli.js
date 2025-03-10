/**
 * CLI module for vibecheck.
 * Handles command-line argument parsing.
 */
const { Command } = require("commander");
const packageJson = require("../package.json");

/**
 * Creates and configures the CLI
 * @returns {Command} - Configured Commander command object
 */
function createCli() {
  const program = new Command();
  
  program
    .name("vibecheck")
    .description("Transform images into comprehensive aesthetic style guides for software designers")
    .version(packageJson.version)
    .option("-i, --image <path>", "Path to the image file")
    .option("-o, --output <path>", "Output markdown file name", "AESTHETIC.md")
    .option("-d, --detail <level>", "Detail level: low, high, or auto", "auto")
    .option("-m, --model <name>", "OpenAI vision model name", "gpt-4o")
    .option("-v, --verbose", "Enable verbose output")
    .option("--interactive", "Use interactive mode with prompts")
    .option("--no-color", "Disable colored output")
    .option("--no-image", "Don't include the image in the output file")
    .option("--cancel", "Exit interactive mode gracefully")
    .option("--skip-mode-selection", "Skip the mode selection screen")
    .addHelpText("after", `
Examples:
  $ vibecheck --image path/to/image.jpg
  $ vibecheck --image path/to/image.jpg --output results.md --detail high
  $ vibecheck --image path/to/image.jpg --model gpt-4o-mini
  $ vibecheck --image path/to/image.jpg --no-image
  $ vibecheck --interactive
  $ vibecheck --interactive --cancel  # Start and then exit interactive mode
    `);
  
  return program;
}

/**
 * Parses command-line arguments
 * @returns {Object} - Parsed options
 */
function parseArgs() {
  const program = createCli();
  
  // Let's keep the help option but modify Commander to not display help automatically
  // The help command will only be shown when -h or --help is explicitly used
  const originalHelpCallback = program._helpCallback;
  program._helpCallback = () => {
    originalHelpCallback();
    process.exit(0);
  };
  
  program.parse(process.argv);
  const options = program.opts();
  
  // All flow control is handled in the main file based on provided arguments
  return options;
}

module.exports = {
  createCli,
  parseArgs
};