# vibecheck ✨

Transform any image into a detailed aesthetic style guide for software designers through an elegant CLI experience.

![vibecheck CLI](https://github.com/phrazzld/vibecheck/assets/images/vibecheck-demo.gif)

## Features

- 🎨 Generate complete aesthetic style guides from images using OpenAI's vision models
- ✨ Elegant CLI with subtle colors, animations and thoughtful visual design
- 🧙‍♂️ Guided interactive mode for effortless workflow
- 🌈 Terminal-based color palette visualization
- 📊 Clear progress indicators with contextual feedback
- 📝 Rich style guides including typography, colors, UI elements, and design principles
- 🚀 Configurable detail levels and model selection for optimal results

## Installation

```bash
# Install globally (recommended)
npm install -g vibecheck

# Or install from source
git clone https://github.com/phrazzld/vibecheck.git
cd vibecheck
npm install
npm link
```

## Usage

### Interactive Mode

```bash
# Start the guided experience (recommended)
vibecheck
```

### Command Line Options

```bash
# Analyze an image with default settings
vibecheck --image path/to/image.jpg

# Save to custom file
vibecheck --image path/to/image.jpg --output design-system.md

# Set detail level (low, auto, high)
vibecheck --image path/to/image.jpg --detail high

# Use faster model for quicker results
vibecheck --image path/to/image.jpg --model gpt-4o-mini

# Disable color output
vibecheck --image path/to/image.jpg --no-color

# Skip welcome message
vibecheck --image path/to/image.jpg --skip-welcome
```

### Required Configuration

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here
```

## Output Example

```markdown
# Neo-Brutalist Cityscape

## Color Palette
- Primary: #FF4D00 - Vibrant orange for key elements
- Secondary: #1A1A1A - Deep black for backgrounds
- Accent: #FFD600 - Bright yellow for highlights

## Typography
- Headings: Sans-serif, bold, oversized with tight tracking
- Body: Monospace with medium weight
```

## Customization

Modify `src/prompt.txt` to customize the analysis parameters and output format.

## Development

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Lint code
npm run lint
```

## License

MIT