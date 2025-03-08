# vibecheck ✨

Transform images into comprehensive aesthetic style guides for software designers with a beautiful interactive CLI experience.

![vibecheck CLI](https://github.com/phrazzld/vibecheck/assets/images/vibecheck-demo.gif)

## Features

- 🎨 Extract aesthetic style guides from any image using OpenAI's vision models
- ✨ Beautiful interactive CLI with color, animations, and styled output
- 🧙‍♂️ Guided wizard mode for step-by-step analysis
- 🌈 Color palette visualization in terminal
- 📊 Real-time progress tracking with elegant spinners
- 📝 Comprehensive style guides with typography, colors, UI elements, and more
- 🚀 Flexible configuration with multiple detail levels and model options

## Installation

```bash
# Install globally from npm (recommended)
npm install -g vibecheck

# Or clone and install from source
git clone https://github.com/phrazzld/vibecheck.git
cd vibecheck
npm install
npm link
```

## Usage

### Interactive Mode (Recommended)

```bash
# Launch the interactive wizard
vibecheck --interactive
```

### Command Line

```bash
# Basic usage
vibecheck --image path/to/image.jpg

# Set output file
vibecheck --image path/to/image.jpg --output design-system.md

# Choose detail level (low, auto, high)
vibecheck --image path/to/image.jpg --detail high

# Use a faster model
vibecheck --image path/to/image.jpg --model gpt-4o-mini

# Disable colors
vibecheck --image path/to/image.jpg --no-color
```

### Required Environment Variable

```bash
export OPENAI_API_KEY=your-api-key-here
```

## Output Examples

The tool generates comprehensive style guides including:

```markdown
# Neo-Brutalist Cityscape

## Color Palette
- Primary: #FF4D00 - Vibrant orange for key elements
- Secondary: #1A1A1A - Deep black for backgrounds
- Accent: #FFD600 - Bright yellow for highlights
...

## Typography
- Headings: Sans-serif, bold, oversized with tight tracking
- Body: Monospace with medium weight
...
```

## Customization

Edit `src/prompt.txt` to customize the analysis focus and style guide format.

## Development

```bash
# Run tests
npm test

# Check code style
npm run lint
```

## License

MIT