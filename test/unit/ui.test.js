/**
 * UI module unit tests
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Modules to test
const ui = require('../../src/ui');
const styles = require('../../src/ui/styles');
const output = require('../../src/ui/output');
const progress = require('../../src/ui/progress');
const prompts = require('../../src/ui/prompts');

describe('UI - Styles', () => {
  it('should export styles object with color definitions', () => {
    assert.ok(styles.colors, 'Colors object should exist');
    assert.ok(styles.colors.primary, 'Primary color should be defined');
    assert.ok(styles.colors.secondary, 'Secondary color should be defined');
    assert.ok(styles.colors.error, 'Error color should be defined');
  });

  it('should create styled header', () => {
    const header = styles.createHeader();
    assert.ok(header.includes('vibecheck'), 'Header should include the app name');
  });

  it('should create section with proper formatting', () => {
    const title = 'Test Section';
    const content = 'Test content';
    const section = styles.createSection(title, content);
    
    assert.ok(section.includes(title), 'Section should include the title');
    assert.ok(section.includes(content), 'Section should include the content');
  });

  it('should create styled success message', () => {
    const message = 'Test success';
    const success = styles.success(message);
    assert.ok(success.includes(message), 'Success message should include the provided message');
  });

  it('should create styled error message', () => {
    const message = 'Test error';
    const error = styles.error(message);
    assert.ok(error.includes(message), 'Error message should include the provided message');
  });
});

describe('UI - Output', () => {
  it('should extract title from markdown', () => {
    const markdown = '# Test Title\n\nTest content';
    const title = output.extractTitle(markdown);
    assert.strictEqual(title, 'Test Title', 'Should extract the title correctly');
  });

  it('should extract color palette from markdown', () => {
    const markdown = `
      # Test Title
      
      ## Color Palette
      
      - Primary: #FF0000 Red
      - Secondary: #00FF00 Green
      - Accent: #0000FF Blue
    `;
    
    const colors = output.extractColorPalette(markdown);
    assert.ok(Array.isArray(colors), 'Should return an array');
    assert.ok(colors.length >= 3, 'Should extract at least 3 colors');
    
    const hasRed = colors.some(color => color.hex === '#FF0000');
    const hasGreen = colors.some(color => color.hex === '#00FF00');
    const hasBlue = colors.some(color => color.hex === '#0000FF');
    
    assert.ok(hasRed, 'Should extract red color');
    assert.ok(hasGreen, 'Should extract green color');
    assert.ok(hasBlue, 'Should extract blue color');
  });

  it('should format paths correctly', () => {
    const longPath = '/very/long/path/that/should/be/truncated/because/it/is/too/long/for/display/filename.md';
    const formattedPath = output.formatPath(longPath);
    
    assert.ok(formattedPath.length < longPath.length, 'Long path should be truncated');
    assert.ok(formattedPath.includes('...'), 'Truncated path should include ellipsis');
    assert.ok(formattedPath.includes('filename.md'), 'Formatted path should still include the filename');
  });

  it('should create success message with supplied path', () => {
    const outputPath = '/test/path/output.md';
    const message = output.createSuccessMessage(outputPath);
    
    assert.ok(message.includes('CREATED'), 'Success message should indicate creation');
    assert.ok(message.includes(outputPath) || message.includes('output.md'), 'Success message should include the output path');
  });
});

describe('UI - Progress', () => {
  it('should create spinner with specified text', () => {
    const spinnerText = 'Loading test';
    const spinner = progress.createSpinner(spinnerText);
    
    assert.ok(spinner, 'Spinner should be created');
    assert.ok(typeof spinner.start === 'function', 'Spinner should have start method');
    assert.ok(typeof spinner.stop === 'function', 'Spinner should have stop method');
  });

  it('should create progress bar with specified format', () => {
    const format = 'Test: {bar} {percentage}%';
    const progressBar = progress.createProgressBar(format);
    
    assert.ok(progressBar, 'Progress bar should be created');
    assert.ok(typeof progressBar.start === 'function', 'Progress bar should have start method');
    assert.ok(typeof progressBar.update === 'function', 'Progress bar should have update method');
    assert.ok(typeof progressBar.stop === 'function', 'Progress bar should have stop method');
  });

  it('should create process bar with specified steps', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3'];
    const processBar = progress.createProcessBar(steps);
    
    assert.ok(processBar, 'Process bar should be created');
    assert.ok(typeof processBar.start === 'function', 'Process bar should have start method');
    assert.ok(typeof processBar.nextStep === 'function', 'Process bar should have nextStep method');
    assert.ok(typeof processBar.complete === 'function', 'Process bar should have complete method');
  });
});

describe('UI - Main module', () => {
  it('should get image info for valid path', () => {
    // Create a temporary test file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const testFilePath = path.join(tempDir, 'test-image.jpg');
    fs.writeFileSync(testFilePath, 'test content');
    
    try {
      const imageInfo = ui.getImageInfo(testFilePath);
      
      assert.strictEqual(imageInfo.filename, 'test-image.jpg', 'Image filename should match');
      assert.ok(imageInfo.path.includes('test-image.jpg'), 'Image path should include filename');
      assert.ok(imageInfo.size > 0, 'Image size should be greater than 0');
    } finally {
      // Clean up
      try {
        fs.unlinkSync(testFilePath);
        fs.rmdirSync(tempDir);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it('should handle invalid image path gracefully', () => {
    const invalidPath = '/not/a/real/path/image.jpg';
    const imageInfo = ui.getImageInfo(invalidPath);
    
    assert.strictEqual(imageInfo.filename, 'image.jpg', 'Should extract filename from invalid path');
    assert.ok(imageInfo.error, 'Should include error property for invalid path');
  });
});

// Add additional tests for boxen styling to ensure they don't cause errors
describe('UI - Boxen styling', () => {
  it('should create mode selection box without errors', () => {
    // We're testing the function doesn't throw, not the UI output
    try {
      // This should not throw an error with the fixed code
      const box = prompts.promptForMode();
      assert.ok(true, 'Function should not throw');
    } catch (e) {
      assert.fail('Should not throw an error: ' + e.message);
    }
  });
  
  it('should show welcome narrative without errors', () => {
    try {
      prompts.showWelcomeNarrative();
      assert.ok(true, 'Function should not throw');
    } catch (e) {
      assert.fail('Should not throw an error: ' + e.message);
    }
  });
});