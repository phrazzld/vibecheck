# vibecheck Project Guide

## Commands
- **Install**: `npm install`
- **Run**: `./index.js --image /path/to/image.jpg --output custom.md --detail high`
- **Test**: `npm test`
- **Lint**: `npm run lint`

## Code Style Guidelines
- **Language**: Node.js (v18+ recommended for ES modules)
- **Imports**: Use CommonJS (`require()`) or ES modules based on package.json type
- **Formatting**: 2-space indentation, camelCase variables and functions
- **Error Handling**: Use try/catch blocks and provide descriptive error messages
- **Dependencies**: 
  - OpenAI Node.js library
  - Commander for CLI argument parsing
  - Built-in modules: fs, path, process, buffer

## Project Structure
This CLI tool transforms images into comprehensive aesthetic style guides for software designers using OpenAI's GPT-4o.
Key functionality:
1. Parse CLI arguments
2. Encode image to base64
3. Send image to OpenAI API
4. Save markdown response to file

Configure with OPENAI_API_KEY environment variable.