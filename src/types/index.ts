export interface AnalyzeRequest {
  image: string; // Base64-encoded image data
  apiKey: string; // OpenAI API key
}

export interface AnalyzeResponse {
  styleGuide: string; // Markdown content
}

export interface AppState {
  image: File | null;
  result: string | null;
  apiKey: string;
  rememberKey: boolean;
}

export interface ApiKeyData {
  key: string;
  remember: boolean;
}