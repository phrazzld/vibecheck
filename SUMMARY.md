# vibecheck Project Summary

## Overview

vibecheck is a Node.js CLI tool that transforms images into comprehensive aesthetic style guides for software designers using OpenAI's GPT-4o. The tool takes an image file as input, sends it to OpenAI's vision-enabled API, and outputs a detailed style guide in markdown format to help designers implement the aesthetic in digital products.

## Architecture

The project is structured in a modular way with separate components for:

1. **CLI Interface** - Processes command-line arguments
2. **Image Processor** - Handles reading and encoding images
3. **OpenAI Client** - Manages communication with OpenAI's API
4. **Output Handler** - Writes results to the filesystem

## Key Files

- `src/index.js` - Main entry point and orchestration
- `src/cli.js` - Command-line argument parsing using Commander
- `src/image-processor.js` - Image handling utilities
- `src/openai-client.js` - OpenAI API communication
- `src/output-handler.js` - Output file management

## Testing

The project includes comprehensive unit tests for each module:

- **CLI Tests** - Verify command-line argument parsing
- **Image Processor Tests** - Test file loading and encoding
- **OpenAI Client Tests** - Test API request formation (with mocks)
- **Output Handler Tests** - Test file writing capabilities

## Future Enhancements

As outlined in the PLAN.md file, potential enhancements include:

1. Support for multiple images or directory processing
2. Customizable prompt templates
3. Token usage tracking and reporting
4. GUI integration via Electron or web interface

## Usage

The tool is used via command line with the following syntax:

```bash
vibecheck --image /path/to/image.jpg [options]
```

Options include output file path (`--output`), detail level (`--detail`), and model selection (`--model`).

## Environment Requirements

- Node.js v18+ recommended
- OpenAI API key provided via OPENAI_API_KEY environment variable