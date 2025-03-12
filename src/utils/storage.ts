import { AnalysisOptions } from "../types";

const STORAGE_KEY = "vibecheck_options";

export const saveOptionsToStorage = (options: AnalysisOptions): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
};

export const getOptionsFromStorage = (): AnalysisOptions | null => {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as AnalysisOptions;
  } catch (e) {
    console.error("Failed to parse stored options", e);
    return null;
  }
};