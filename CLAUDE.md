# vibecheck Developer Guide

## Quick Commands
- **Setup**: `npm install`
- **Run**: `node src/index.js --image /path/to/image.jpg --output custom.md --detail high`
- **Interactive Mode**: `node src/index.js`
- **Test**: `npm test` (all tests), `npm run test:unit`, `npm run test:integration`
- **Lint**: `npm run lint`

## Code Style Standards
- **Node.js Version**: v18+ (CommonJS modules per package.json type field)
- **Imports**: CommonJS `require()` syntax 
- **Formatting**: 2-space indentation, camelCase for variables and functions
- **Error Handling**: Use descriptive try/catch blocks with meaningful error messages
- **Core Dependencies**: 
  - `openai`: API client for image analysis
  - `commander`: CLI argument parsing
  - `inquirer`: Interactive command prompts
  - `chalk`, `ora`, `gradient-string`: Terminal styling
  - Node built-ins: fs, path, process, buffer

## Project Architecture
This CLI tool transforms images into comprehensive aesthetic style guides using OpenAI's GPT-4o vision model.

### Key Components:
1. **CLI Interface** (`cli.js`): Handles argument parsing and command execution
2. **Image Processing** (`image-processor.js`): Prepares images for API submission
3. **OpenAI Client** (`openai-client.js`): Manages API communication
4. **UI Components** (`ui/`): Interactive terminal experience
5. **Output Handling** (`output-handler.js`): Formats and saves results

### Data Flow:
1. Parse user input (CLI args or interactive prompts)
2. Process and encode image data
3. Submit to OpenAI with customized prompts
4. Transform response into formatted style guide
5. Present results to user and/or save to file

### Configuration:
- Required: OPENAI_API_KEY environment variable
- Optional: Customizable prompt template in src/prompt.txt