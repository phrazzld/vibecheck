const fs = require("fs");
const path = require("path");
const { validateOutputPath, writeOutput, copyImageFile } = require("../src/output-handler");

// Mock fs functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  accessSync: jest.fn(),
  constants: { W_OK: 2 },
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn()
}));

// Mock Date.now to return a fixed timestamp for testing
const MOCK_TIMESTAMP = 123456789;
jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP);

describe("Output Handler", () => {
  const TEST_OUTPUT_PATH = "/test/path/output.md";
  const TEST_CONTENT = "# Test Content";
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe("validateOutputPath", () => {
    test("should return true if path is valid", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockReturnValue(true);
      
      expect(validateOutputPath(TEST_OUTPUT_PATH)).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith("/test/path");
      expect(fs.accessSync).toHaveBeenCalledWith("/test/path", 2);
    });
    
    test("should create directory if it doesn't exist", () => {
      fs.existsSync.mockReturnValue(false);
      fs.accessSync.mockReturnValue(true);
      
      expect(validateOutputPath(TEST_OUTPUT_PATH)).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalledWith("/test/path", { recursive: true });
    });
    
    test("should throw error if directory creation fails", () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });
      
      expect(() => validateOutputPath(TEST_OUTPUT_PATH)).toThrow(/Failed to create directory/);
    });
    
    test("should throw error if directory is not writable", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });
      
      expect(() => validateOutputPath(TEST_OUTPUT_PATH)).toThrow(/Output directory is not writable/);
    });
  });
  
  describe("copyImageFile", () => {
    const TEST_IMAGE_PATH = "/test/input/image.jpg";
    
    test("should copy image and return relative path", () => {
      const expectedRelativePath = `output_image_${MOCK_TIMESTAMP}.jpg`;
      const expectedCopyPath = "/test/path/output_image_123456789.jpg";
      
      const result = copyImageFile(TEST_IMAGE_PATH, TEST_OUTPUT_PATH);
      
      expect(result).toBe(expectedRelativePath);
      expect(fs.copyFileSync).toHaveBeenCalledWith(TEST_IMAGE_PATH, expectedCopyPath);
    });
    
    test("should return null if image path is falsy", () => {
      const result = copyImageFile(null, TEST_OUTPUT_PATH);
      expect(result).toBeNull();
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });
    
    test("should return null and log error if copy fails", () => {
      fs.copyFileSync.mockImplementation(() => {
        throw new Error("Copy error");
      });
      
      // Mock console.error to capture the warning
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const result = copyImageFile(TEST_IMAGE_PATH, TEST_OUTPUT_PATH);
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Could not copy image file"));
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });
  
  describe("writeOutput", () => {
    test("should write content to file", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockReturnValue(true);
      
      const result = writeOutput(TEST_CONTENT, TEST_OUTPUT_PATH);
      
      expect(result).toBe(TEST_OUTPUT_PATH);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_OUTPUT_PATH,
        TEST_CONTENT,
        { encoding: "utf8" }
      );
    });
    
    test("should throw error if write fails", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {
        throw new Error("Write error");
      });
      
      expect(() => writeOutput(TEST_CONTENT, TEST_OUTPUT_PATH)).toThrow(/Failed to write output/);
    });
    
    test("should include image in content when options.imagePath is provided", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockReturnValue(true);
      
      // Reset mocks to ensure clean state
      fs.copyFileSync.mockClear();
      fs.writeFileSync.mockClear();
      
      // Mock successful file operations
      fs.copyFileSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
      
      const expectedRelativePath = `output_image_${MOCK_TIMESTAMP}.jpg`;
      const mockImagePath = "/test/input/image.jpg";
      const expectedContent = `![Aesthetic Image](${expectedRelativePath})\n\n${TEST_CONTENT}`;
      
      const result = writeOutput(TEST_CONTENT, TEST_OUTPUT_PATH, { 
        imagePath: mockImagePath,
        includeImage: true
      });
      
      expect(result).toBe(TEST_OUTPUT_PATH);
      expect(fs.copyFileSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_OUTPUT_PATH,
        expectedContent,
        { encoding: "utf8" }
      );
    });
    
    test("should not include image when includeImage is false", () => {
      fs.existsSync.mockReturnValue(true);
      fs.accessSync.mockReturnValue(true);
      
      // Reset mocks to ensure clean state
      fs.copyFileSync.mockClear();
      fs.writeFileSync.mockClear();
      
      // Mock successful file operations
      fs.copyFileSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
      
      const mockImagePath = "/test/input/image.jpg";
      
      const result = writeOutput(TEST_CONTENT, TEST_OUTPUT_PATH, { 
        imagePath: mockImagePath,
        includeImage: false
      });
      
      expect(result).toBe(TEST_OUTPUT_PATH);
      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        TEST_OUTPUT_PATH,
        TEST_CONTENT,
        { encoding: "utf8" }
      );
    });
  });
});