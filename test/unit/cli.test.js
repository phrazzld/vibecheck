/**
 * CLI module unit tests
 */
const assert = require('assert');
const { createCli, parseArgs } = require('../../src/cli');

describe('CLI Module', () => {
  let originalArgv;
  
  // Save original process.argv before tests
  beforeEach(() => {
    originalArgv = process.argv;
  });
  
  // Restore original process.argv after tests
  afterEach(() => {
    process.argv = originalArgv;
  });
  
  describe('createCli', () => {
    it('should create a commander instance with expected options', () => {
      const program = createCli();
      
      // Check that the program has expected properties
      assert.strictEqual(program.name(), 'vibecheck', 'Should have correct name');
      assert.ok(program.commands.length >= 0, 'Should initialize commands array');
      
      // Check that common options are defined
      const knownOptions = [
        'image', 
        'output', 
        'detail', 
        'model', 
        'verbose', 
        'interactive',
        'color',
        'image',
        'cancel',
        'skipModeSelection'
      ];
      
      // Get all options defined on the program
      const definedOptions = program.options.map(opt => opt.attributeName());
      
      // Check that all known options are defined
      knownOptions.forEach(option => {
        assert.ok(
          definedOptions.some(defined => defined === option), 
          `Option "${option}" should be defined`
        );
      });
    });
  });
  
  describe('parseArgs', () => {
    it('should parse command line arguments correctly', () => {
      // Mock process.argv
      process.argv = [
        'node', 
        'src/index.js', 
        '--image', 'test.jpg', 
        '--output', 'result.md', 
        '--detail', 'high'
      ];
      
      const options = parseArgs();
      
      assert.strictEqual(options.image, 'test.jpg', 'Should parse image option');
      assert.strictEqual(options.output, 'result.md', 'Should parse output option');
      assert.strictEqual(options.detail, 'high', 'Should parse detail option');
    });
    
    it('should use default values when options are not provided', () => {
      // Mock process.argv with minimal arguments
      process.argv = [
        'node', 
        'src/index.js', 
        '--image', 'test.jpg'
      ];
      
      const options = parseArgs();
      
      assert.strictEqual(options.image, 'test.jpg', 'Should parse image option');
      assert.strictEqual(options.output, 'AESTHETIC.md', 'Should use default output option');
      assert.strictEqual(options.detail, 'auto', 'Should use default detail option');
      assert.strictEqual(options.model, 'gpt-4o', 'Should use default model option');
    });
    
    it('should parse boolean flags correctly', () => {
      // Mock process.argv with boolean flags
      process.argv = [
        'node', 
        'src/index.js', 
        '--image', 'test.jpg',
        '--verbose',
        '--interactive',
        '--no-color'
      ];
      
      const options = parseArgs();
      
      assert.strictEqual(options.verbose, true, 'Should parse verbose flag as true');
      assert.strictEqual(options.interactive, true, 'Should parse interactive flag as true');
      assert.strictEqual(options.color, false, 'Should parse no-color flag as false');
    });
    
    it('should handle the skip-mode-selection flag correctly', () => {
      // Mock process.argv with the skip-mode-selection flag
      process.argv = [
        'node', 
        'src/index.js', 
        '--image', 'test.jpg',
        '--skip-mode-selection'
      ];
      
      const options = parseArgs();
      
      assert.strictEqual(options.skipModeSelection, true, 'Should parse skip-mode-selection flag as true');
    });
  });
});