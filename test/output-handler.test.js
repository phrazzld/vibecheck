const fs = require("fs");
const { validateOutputPath, writeOutput } = require("../src/output-handler");

// Mock fs functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  accessSync: jest.fn(),
  constants: { W_OK: 2 },
  writeFileSync: jest.fn()
}));

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
  });
});