"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import AnalysisButton from "@/components/AnalysisButton";
import StyleGuideDisplay from "@/components/StyleGuideDisplay";
import LoadingIndicator from "@/components/LoadingIndicator";
import { AppState } from "@/types";
import { fileToBase64 } from "@/utils/image";

export default function Home() {
  const [state, setState] = useState<AppState>({
    image: null,
    result: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      image: file,
      // Reset result when a new image is selected
      result: null,
    }));
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
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
  }, [state.image, setIsLoading, setError, setState]);

  return (
    <div className="min-h-screen p-6 md:p-8 pb-20">
      <header className="flex flex-col items-center mb-16 md:mb-24">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-2)] to-[var(--color-mint)] opacity-15 blur-xl rounded-full"></div>
          <div className="flex items-center">
            <h1 
              className="text-4xl sm:text-5xl font-bold"
              style={{ 
                fontFamily: 'var(--font-accent)',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '150% 150%',
                animation: 'gradient 6s ease infinite'
              }}
            >
              vibecheck
            </h1>
          </div>
        </div>
        
        <div className="mt-8 max-w-lg text-center">
          <p className="text-lg">
            Transform your images into detailed UI style guides with AI.
          </p>
          <p className="mt-2 text-[#1A1A2E]/70 dark:text-[#E5E7EB]/70 text-base">
            Upload an image and get a comprehensive style guide for your design system.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {!state.result ? (
          <div className="space-y-12">
            <section className="card p-8 relative">
              <h2 className="text-2xl mb-8 text-center text-[#5D5FEF]" style={{ fontFamily: 'var(--font-accent)' }}>
                Upload an Image
              </h2>
              <ImageUpload 
                onImageSelect={handleImageSelect} 
                selectedImage={state.image} 
              />
            </section>

            {state.image && (
              <section className="card p-8 relative flex flex-col items-center">
                <h2 className="text-2xl mb-6 text-center text-[#5D5FEF]" style={{ fontFamily: 'var(--font-accent)' }}>
                  Generate Style Guide
                </h2>
                <p className="text-center text-[#1A1A2E]/70 dark:text-[#E5E7EB]/70 mb-8 max-w-lg">
                  Our AI will analyze your image and generate a comprehensive style guide including colors, typography, spacing, and design patterns.
                </p>
                
                <AnalysisButton 
                  onClick={handleAnalyze} 
                  disabled={!state.image} 
                  isLoading={isLoading}
                />
                {error && (
                  <p className="mt-4 text-center text-[#FF2E63]">{error}</p>
                )}
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setState((prev) => ({ ...prev, result: null }))}
              className="btn-secondary flex items-center gap-2"
              style={{
                borderImage: 'var(--gradient-secondary) 1',
                borderImageSlice: '1'
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
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
            
            <div className="card p-8 relative">
              <StyleGuideDisplay markdown={state.result} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-sm text-[#1A1A2E]/50 dark:text-[#E5E7EB]/50">
        <p>© 2025 vibecheck • AI-powered design style guide generation</p>
      </footer>

      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
}