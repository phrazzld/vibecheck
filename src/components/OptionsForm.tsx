import { useEffect, useState } from "react";
import { AnalysisOptions } from "../types";
import { getOptionsFromStorage, saveOptionsToStorage } from "../utils/storage";

interface OptionsFormProps {
  onOptionsChange: (options: AnalysisOptions) => void;
}

export default function OptionsForm({ onOptionsChange }: OptionsFormProps) {
  const [options, setOptions] = useState<AnalysisOptions>({
    detail: "auto",
    model: "gpt-4o",
  });

  // Load saved options on mount only (empty dependency array)
  useEffect(() => {
    const savedOptions = getOptionsFromStorage();
    if (savedOptions) {
      setOptions(savedOptions);
      // Only call this once on mount - won't retrigger
      onOptionsChange(savedOptions);
    }
  }, []);

  const handleOptionChange = <K extends keyof AnalysisOptions>(
    key: K,
    value: AnalysisOptions[K]
  ) => {
    const updatedOptions = {
      ...options,
      [key]: value,
    };
    
    setOptions(updatedOptions);
    onOptionsChange(updatedOptions);
    saveOptionsToStorage(updatedOptions);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="relative">
        <label 
          htmlFor="detail-level" 
          className="input-label flex items-center gap-2 text-[var(--color-foreground)]"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-[var(--color-primary)]" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          Detail Level
        </label>
        <div className="relative">
          <select
            id="detail-level"
            value={options.detail}
            onChange={(e) => handleOptionChange("detail", e.target.value as "low" | "auto" | "high")}
            className="input w-full appearance-none"
          >
            <option value="low">Low (Faster)</option>
            <option value="auto">Auto (Balanced)</option>
            <option value="high">High (Detailed)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-foreground)]/50">
            <svg 
              className="w-5 h-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--color-foreground)]/60">
          Controls how detailed the generated style guide will be
        </p>
      </div>

      <div className="relative">
        <label 
          htmlFor="model" 
          className="input-label flex items-center gap-2 text-[var(--color-foreground)]"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-[var(--color-primary)]" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M13 7h-2v2h2V7zm0 4h-2v2h2v-2zm-6-4H5v2h2V7zm0 4H5v2h2v-2zm12-2a2 2 0 00-2-2h-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2H3a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6zm-2 6H3V9h14v6z" 
              clipRule="evenodd" 
            />
          </svg>
          AI Model
        </label>
        <div className="relative">
          <select
            id="model"
            value={options.model}
            onChange={(e) => handleOptionChange("model", e.target.value as "gpt-4o" | "gpt-4o-mini")}
            className="input w-full appearance-none"
          >
            <option value="gpt-4o">GPT-4o (High Quality)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-foreground)]/50">
            <svg 
              className="w-5 h-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--color-foreground)]/60">
          The AI model used for analysis
        </p>
      </div>
    </div>
  );
}