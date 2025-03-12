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

  // Load saved options on mount
  useEffect(() => {
    const savedOptions = getOptionsFromStorage();
    if (savedOptions) {
      setOptions(savedOptions);
      onOptionsChange(savedOptions);
    }
  }, [onOptionsChange]);

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
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <label 
          htmlFor="detail-level" 
          className="block text-sm font-medium mb-2"
        >
          Detail Level
        </label>
        <select
          id="detail-level"
          value={options.detail}
          onChange={(e) => handleOptionChange("detail", e.target.value as "low" | "auto" | "high")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="low">Low (Faster)</option>
          <option value="auto">Auto (Balanced)</option>
          <option value="high">High (Detailed)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Controls how detailed the generated style guide will be
        </p>
      </div>

      <div>
        <label 
          htmlFor="model" 
          className="block text-sm font-medium mb-2"
        >
          AI Model
        </label>
        <select
          id="model"
          value={options.model}
          onChange={(e) => handleOptionChange("model", e.target.value as "gpt-4o" | "gpt-4o-mini")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="gpt-4o">GPT-4o (High Quality)</option>
          <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          The AI model used for analysis
        </p>
      </div>
    </div>
  );
}