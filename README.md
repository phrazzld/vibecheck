# vibecheck

A CLI tool that transforms images into comprehensive aesthetic style guides for software designers using OpenAI's GPT-4o.

## Features

- Extract aesthetic principles from any image using GPT-4o's vision capabilities
- Generate comprehensive, actionable style guides for software design
- Create detailed color palettes with hex codes
- Provide typography, UI element, and interaction guidelines
- Control detail level for different use cases
- Choose between different OpenAI vision models
- Save output to custom locations
- Easily customize the prompt by editing the prompt.txt file

## Installation

```bash
# Clone the repository
git clone https://github.com/phrazzld/vibecheck.git
cd vibecheck

# Install dependencies
npm install

# Make it globally available (optional)
npm link
```

## Usage

```bash
# Basic usage
vibecheck --image /path/to/image.jpg

# Set output file
vibecheck --image /path/to/image.jpg --output analysis.md

# Control detail level (auto, low, high)
vibecheck --image /path/to/image.jpg --detail high

# Use a different model
vibecheck --image /path/to/image.jpg --model gpt-4o-mini

# Enable verbose logging
vibecheck --image /path/to/image.jpg --verbose
```

### Required Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key

You can set it in your environment:

```bash
export OPENAI_API_KEY=your-api-key-here
```

### Customizing the Prompt

You can easily customize how vibecheck analyzes images by editing the prompt in `src/prompt.txt`. The default prompt is designed to create comprehensive style guides for software designers, but you can modify it to focus on specific aspects of design or to produce different types of output.

## Output

The tool generates a comprehensive aesthetic style guide in markdown format that includes:

- A creative title capturing the essence of the aesthetic
- Detailed color palette with hex codes and usage guidelines
- Typography recommendations
- Shape language and compositional principles
- UI element styling guidelines
- Animation and interaction principles
- Iconography guidelines
- Historical and artistic influences
- Emotional qualities and user experience goals

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT
