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
    .requiredOption("-i, --image <path>", "Path to the image file")
    .option("-o, --output <path>", "Output markdown file name", "AESTHETIC.md")
    .option("-d, --detail <level>", "Detail level: low, high, or auto", "auto")
    .option("-m, --model <name>", "OpenAI vision model name", "gpt-4o")
    .option("-v, --verbose", "Enable verbose output")
    .addHelpText("after", `
Examples:
  $ vibecheck --image path/to/image.jpg
  $ vibecheck --image path/to/image.jpg --output results.md --detail high
  $ vibecheck --image path/to/image.jpg --model gpt-4o-mini
    `);
  
  return program;
}

/**
 * Parses command-line arguments
 * @returns {Object} - Parsed options
 */
function parseArgs() {
  const program = createCli();
  program.parse(process.argv);
  return program.opts();
}

module.exports = {
  createCli,
  parseArgs
};