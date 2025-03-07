const OpenAIClient = require("../src/openai-client");

// Mock fs module for the prompt.txt file
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("Test prompt text")
}));

// Mock the OpenAI package
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: "# Test Aesthetic Analysis"
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe("OpenAI Client", () => {
  let client;
  const TEST_API_KEY = "test-api-key";
  const TEST_DATA_URL = "data:image/jpeg;base64,dGVzdCBkYXRh";
  
  beforeEach(() => {
    client = new OpenAIClient(TEST_API_KEY);
  });
  
  describe("constructor", () => {
    test("should throw error if no API key provided", () => {
      expect(() => new OpenAIClient()).toThrow(/API key is required/);
    });
    
    test("should create instance with API key", () => {
      expect(client).toBeInstanceOf(OpenAIClient);
    });
  });
  
  describe("constructMessages", () => {
    test("should return properly formatted messages", () => {
      const messages = client.constructMessages(TEST_DATA_URL, "auto");
      
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toHaveLength(2);
      expect(messages[0].content[0].type).toBe("text");
      expect(messages[0].content[0].text).toBe("Test prompt text");
      expect(messages[0].content[1].type).toBe("image_url");
      expect(messages[0].content[1].image_url.url).toBe(TEST_DATA_URL);
      expect(messages[0].content[1].image_url.detail).toBe("auto");
    });
    
    test("should throw error for invalid detail level", () => {
      expect(() => client.constructMessages(TEST_DATA_URL, "invalid")).toThrow(/Invalid detail level/);
    });
  });
  
  describe("analyzeImage", () => {
    test("should call OpenAI API and return content", async () => {
      const result = await client.analyzeImage(TEST_DATA_URL);
      expect(result).toBe("# Test Aesthetic Analysis");
      expect(client.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o",
          messages: expect.any(Array)
        })
      );
    });
    
    test("should use provided model and detail level", async () => {
      await client.analyzeImage(TEST_DATA_URL, { model: "gpt-4o-mini", detailLevel: "high" });
      expect(client.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o-mini"
        })
      );
    });
  });
});