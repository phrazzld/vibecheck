export interface AnalysisOptions {
  detail: "low" | "auto" | "high";
  model: "gpt-4o" | "gpt-4o-mini";
}

export interface AnalyzeRequest {
  image: string; // Base64-encoded image data
  detail: "low" | "auto" | "high";
  model: "gpt-4o" | "gpt-4o-mini";
}

export interface AnalyzeResponse {
  styleGuide: string; // Markdown content
}

export interface AppState {
  image: File | null;
  options: AnalysisOptions;
  result: string | null;
}