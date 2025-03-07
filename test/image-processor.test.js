const path = require("path");
const {
  validateImagePath,
  encodeImageToBase64,
  getImageMimeType,
  createDataUrl
} = require("../src/image-processor");

const TEST_IMAGE_PATH = path.join(__dirname, "fixtures", "test-image.jpg");
const NON_EXISTENT_PATH = path.join(__dirname, "fixtures", "non-existent.jpg");

describe("Image Processor", () => {
  describe("validateImagePath", () => {
    test("should return true for valid image path", () => {
      expect(validateImagePath(TEST_IMAGE_PATH)).toBe(true);
    });

    test("should throw error for non-existent file", () => {
      expect(() => validateImagePath(NON_EXISTENT_PATH)).toThrow(/File not found/);
    });
  });

  describe("encodeImageToBase64", () => {
    test("should encode image file to base64", () => {
      const base64Data = encodeImageToBase64(TEST_IMAGE_PATH);
      expect(typeof base64Data).toBe("string");
      expect(base64Data.length).toBeGreaterThan(0);
    });

    test("should throw error for invalid path", () => {
      expect(() => encodeImageToBase64(NON_EXISTENT_PATH)).toThrow(/File not found/);
    });
  });

  describe("getImageMimeType", () => {
    test("should return correct MIME type for jpg", () => {
      expect(getImageMimeType("image.jpg")).toBe("image/jpeg");
    });

    test("should return correct MIME type for png", () => {
      expect(getImageMimeType("image.png")).toBe("image/png");
    });

    test("should return default MIME type for unknown extension", () => {
      expect(getImageMimeType("image.unknown")).toBe("image/jpeg");
    });
  });

  describe("createDataUrl", () => {
    test("should create a valid data URL", () => {
      const base64Data = "dGVzdCBkYXRh"; // "test data" in base64
      const dataUrl = createDataUrl(base64Data, "image.jpg");
      expect(dataUrl).toBe("data:image/jpeg;base64,dGVzdCBkYXRh");
    });
  });
});