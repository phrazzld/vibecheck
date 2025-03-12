# vibecheck

Transform images into detailed UI style guides with AI. Upload an image and get a comprehensive style guide for your design system.

vibecheck is a Next.js TypeScript web application that uses OpenAI's vision models to analyze images and generate detailed aesthetic style guides for software designers.

## Features

- **Image Upload**: Drag-and-drop interface for image uploading
- **Configurable Analysis**: Control detail level and AI model selection
- **OpenAI Integration**: Secure server-side image analysis
- **Markdown Output**: Generated style guides in clean, structured markdown format
- **Download Option**: Save style guides for later reference

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- An OpenAI API key with access to vision models (GPT-4o)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/phrazzld/vibecheck.git
   cd vibecheck
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.local.example` file to `.env.local`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or with logging enabled:
   ```bash
   npm run dev:log
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. Upload an image of a UI design or website
2. Select your detail level (low, auto, high)
3. Choose the AI model (GPT-4o or GPT-4o Mini)
4. Click "Analyze Image"
5. View and download your generated style guide

## Development Tools

### Logging and Observability

The application includes a robust logging system to help track development and debug issues:

```bash
# Start the development server with logging enabled
npm run dev:log

# View all logs
npm run logs:view

# View only error messages
npm run logs:errors

# Watch logs in real-time (like tail -f)
npm run logs:tail

# View only the last 100 lines (customize the number)
npm run logs:view -- -l -n 100
```

Log files are stored in the `/logs` directory and automatically rotated each time `dev:log` is run, keeping your history organized while preventing excessive disk usage.

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [OpenAI API](https://platform.openai.com/) - AI image analysis

## License

This project is licensed under the MIT License - see the LICENSE file for details.
