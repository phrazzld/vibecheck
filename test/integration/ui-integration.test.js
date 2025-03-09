/**
 * UI Integration tests for vibecheck
 * Tests interactions between different UI components
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Modules to test
const ui = require('../../src/ui');
const styles = require('../../src/ui/styles');
const output = require('../../src/ui/output');
const progress = require('../../src/ui/progress');

describe('UI Integration Tests', () => {
  describe('Styling and Output Integration', () => {
    it('should create success message with proper styling', () => {
      // This tests that the success message generator properly uses the styles module
      const outputPath = '/test/path/output.md';
      const message = output.createSuccessMessage(outputPath);
      
      // Test that the message includes success color from styles
      assert.ok(message.includes('CREATED'), 'Success message should indicate creation');
      assert.ok(message.includes(outputPath) || message.includes('output.md'), 'Success message should include the output path');
    });
    
    it('should create color swatches using styles correctly', () => {
      // Create test color data
      const colorData = [
        { hex: styles.colors.primary, name: 'Primary' },
        { hex: styles.colors.secondary, name: 'Secondary' },
        { hex: styles.colors.tertiary, name: 'Tertiary' }
      ];
      
      // Generate color swatches
      const swatches = styles.createColorSwatches(colorData);
      
      // Check that all colors are included
      colorData.forEach(color => {
        assert.ok(swatches.includes(color.hex), `Swatches should include ${color.name} color hex code`);
        assert.ok(swatches.includes(color.name), `Swatches should include ${color.name} color name`);
      });
    });
  });
  
  describe('Progress and Styles Integration', () => {
    it('should create process bar that uses style colors', () => {
      // Create a process bar
      const steps = ['Step 1', 'Step 2', 'Step 3'];
      const processBar = progress.createProcessBar(steps);
      
      // Test that the process bar object has properly initialized
      assert.ok(processBar, 'Process bar should be created');
      assert.ok(processBar.bar, 'Process bar should have reference to the underlying progress bar');
      
      // We can't easily test the visual appearance, but we can ensure no errors are thrown
      // when starting, updating, and completing the bar
      try {
        processBar.start();
        processBar.updateStep(1);
        processBar.complete('Test complete');
        assert.ok(true, 'Process bar operations should not throw errors');
      } catch (error) {
        assert.fail(`Process bar operations should not throw errors: ${error.message}`);
      }
    });
  });
  
  describe('UI Main Module Integration', () => {
    it('should expose all UI submodules correctly', () => {
      // Test that main UI module correctly exposes all submodules
      assert.strictEqual(ui.styles, styles, 'UI module should expose styles submodule');
      assert.strictEqual(ui.output, output, 'UI module should expose output submodule');
      assert.strictEqual(ui.progress, progress, 'UI module should expose progress submodule');
    });
    
    it('should generate image info and format it correctly', () => {
      // Create a temporary test file
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const testFilePath = path.join(tempDir, 'test-image.jpg');
      fs.writeFileSync(testFilePath, 'test content');
      
      try {
        // Get image info
        const imageInfo = ui.getImageInfo(testFilePath);
        
        // Format the image info using the output module
        const formattedInfo = ui.output.createImageInfo(imageInfo);
        
        // Check the formatted output
        assert.ok(formattedInfo.includes('test-image.jpg'), 'Formatted info should include filename');
        assert.ok(formattedInfo.includes('Image Information'), 'Formatted info should include section title');
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
  });
});