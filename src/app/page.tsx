"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import AnalysisButton from "@/components/AnalysisButton";
import StyleGuideDisplay from "@/components/StyleGuideDisplay";
import LoadingIndicator from "@/components/LoadingIndicator";
import { Button, ArrowLeftIcon } from "@/components/ui";
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
              className="text-5xl sm:text-5xl"
              style={{ 
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '150% 150%',
                animation: 'gradient 6s ease infinite',
                letterSpacing: 'var(--tracking-tighter)'
              }}
            >
              vibecheck
            </h1>
          </div>
        </div>
        
        <div className="mt-8 max-w-lg text-center">
          <p className="text-lg text-semibold" style={{ fontWeight: 500 }}>
            Transform images into detailed design aesthetic profiles.
          </p>
          <p className="mt-2 text-[var(--color-foreground)]/70 text-base">
            Upload an image and get a complete breakdown of its colors, typography, and design elements.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {!state.result ? (
          <div className="space-y-12">
            <section className="section section-primary">
              <h2 className="mb-8 text-center text-[var(--color-primary)]">
                Upload Image
              </h2>
              <ImageUpload 
                onImageSelect={handleImageSelect} 
                selectedImage={state.image} 
              />
            </section>

            {state.image && (
              <section className="section section-secondary flex flex-col items-center">
                <h2 className="mb-6 text-center text-[var(--color-primary)]">
                  Extract Aesthetic
                </h2>
                <p className="text-center text-[var(--color-foreground)]/70 mb-8 max-w-lg" style={{ lineHeight: 'var(--leading-relaxed)' }}>
                  Our AI will analyze your image and create a detailed style guide with colors, typography, spacing, and design patterns.
                </p>
                
                <AnalysisButton 
                  onClick={handleAnalyze} 
                  disabled={!state.image} 
                  isLoading={isLoading}
                />
                {error && (
                  <p className="mt-4 text-center text-[var(--color-error)]">{error}</p>
                )}
              </section>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <Button
                variant="tertiary"
                onClick={() => setState((prev) => ({ ...prev, result: null }))}
                leftIcon={<ArrowLeftIcon />}
                className="border border-[var(--color-border)] shadow-sm"
              >
                Back to Upload
              </Button>
            </div>
            
            <section className="section section-result">
              <StyleGuideDisplay markdown={state.result} />
            </section>
          </div>
        )}
      </main>

      <footer className="mt-16 mb-8 pt-8 text-center border-t border-[var(--color-divider)]">
        <p className="text-sm text-[var(--color-foreground)]/50" style={{ marginBottom: 0 }}>© 2025 vibecheck • AI-powered aesthetic extraction and design analysis</p>
      </footer>

      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
}