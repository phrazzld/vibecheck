export interface AnalyzeRequest {
  image: string; // Base64-encoded image data
}

export interface AnalyzeResponse {
  styleGuide: string; // Markdown content
}

export interface AppState {
  image: File | null;
  result: string | null;
}