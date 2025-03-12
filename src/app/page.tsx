"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import OptionsForm from "@/components/OptionsForm";
import AnalysisButton from "@/components/AnalysisButton";
import StyleGuideDisplay from "@/components/StyleGuideDisplay";
import LoadingIndicator from "@/components/LoadingIndicator";
import { AnalysisOptions, AppState } from "@/types";
import { fileToBase64 } from "@/utils/image";

export default function Home() {
  const [state, setState] = useState<AppState>({
    image: null,
    options: {
      detail: "auto",
      model: "gpt-4o",
    },
    result: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setState((prev) => ({
      ...prev,
      image: file,
      // Reset result when a new image is selected
      result: null,
    }));
    setError(null);
  };

  const handleOptionsChange = (options: AnalysisOptions) => {
    setState((prev) => ({
      ...prev,
      options,
    }));
  };

  const handleAnalyze = async () => {
    if (!state.image) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert image to base64
      const base64Image = await fileToBase64(state.image);

      // Call API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          detail: state.options.detail,
          model: state.options.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();
      
      setState((prev) => ({
        ...prev,
        result: data.styleGuide,
      }));
    } catch (error: unknown) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while analyzing the image";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-3 mb-3">
          <svg 
            width="36" 
            height="36" 
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#9D50BB]"
          >
            <path 
              d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M2 12C2 13.6569 3.34315 15 5 15C6.65685 15 8 13.6569 8 12C8 10.3431 6.65685 9 5 9C3.34315 9 2 10.3431 2 12Z" 
              fill="currentColor"
            />
            <path 
              d="M16 12C16 13.6569 17.3431 15 19 15C20.6569 15 22 13.6569 22 12C22 10.3431 20.6569 9 19 9C17.3431 9 16 10.3431 16 12Z" 
              fill="currentColor"
            />
          </svg>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9D50BB] to-[#6E48AA] bg-clip-text text-transparent">
            vibecheck
          </h1>
        </div>
        <p className="text-center text-gray-600 max-w-lg">
          Transform your images into detailed UI style guides with AI. 
          Upload an image and get a comprehensive style guide for your design system.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {!state.result ? (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-medium mb-6 text-center">Upload an Image</h2>
              <ImageUpload onImageSelect={handleImageSelect} />
            </section>

            {state.image && (
              <>
                <section>
                  <h2 className="text-xl font-medium mb-6 text-center">Analysis Options</h2>
                  <OptionsForm onOptionsChange={handleOptionsChange} />
                </section>

                <section className="max-w-md mx-auto">
                  <AnalysisButton 
                    onClick={handleAnalyze} 
                    disabled={!state.image} 
                    isLoading={isLoading}
                  />
                  {error && (
                    <p className="mt-4 text-center text-red-600">{error}</p>
                  )}
                </section>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setState((prev) => ({ ...prev, result: null }))}
              className="flex items-center gap-1 text-[#9D50BB] hover:underline"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              Back to Upload
            </button>
            
            <StyleGuideDisplay markdown={state.result} />
          </div>
        )}
      </main>

      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
}