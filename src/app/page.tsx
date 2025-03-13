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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while analyzing the image";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [state.image, setIsLoading, setError, setState]);

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-8 pb-16">
      <header className="flex flex-col items-center mb-8 md:mb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-2)] to-[var(--color-mint)] opacity-15 blur-xl rounded-full"></div>
          <div className="flex items-center">
            <h1
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "150% 150%",
                animation: "gradient 6s ease infinite",
                letterSpacing: "var(--tracking-tighter)",
              }}
            >
              vibecheck
            </h1>
          </div>
        </div>

        <div className="mt-4 max-w-lg text-center">
          <p className="text-base text-semibold" style={{ fontWeight: 500 }}>
            Transform images into detailed design aesthetic profiles.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto flex-1 w-full">
        {!state.result ? (
          <div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start h-full">
              {/* Left Side: Image Upload */}
              <section className="flex flex-col h-full">
                <h2 className="mb-4 text-center text-[var(--color-primary)]">
                  Upload Image
                </h2>
                <div className="bg-[var(--color-soft-bg)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] h-full flex flex-col justify-between" style={{ height: "100%" }}>
                  <div className="mb-4">
                    <p className="text-[var(--color-foreground)]/70 mb-4"
                      style={{ lineHeight: "var(--leading-relaxed)" }}>
                      Upload an image to extract its design aesthetic. 
                      Supported formats: JPEG, PNG, WEBP, or GIF.
                    </p>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={state.image}
                    />
                  </div>
                </div>
              </section>

              {/* Right Side: Analysis Controls */}
              <section className={`flex flex-col h-full ${!state.image ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}>
                <h2 className="mb-4 text-center text-[var(--color-primary)]">
                  Extract Aesthetic
                </h2>
                <div className="bg-[var(--color-soft-bg)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] h-full flex flex-col justify-between" style={{ height: "100%" }}>
                  <div>
                    <p className="text-[var(--color-foreground)]/70 mb-4"
                      style={{ lineHeight: "var(--leading-relaxed)" }}>
                      Our AI will analyze your image and create a detailed style
                      guide with colors, typography, spacing, and design patterns.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-sm text-[var(--color-foreground)]/80">
                        <svg className="w-4 h-4 mr-2 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Extract color palette
                      </li>
                      <li className="flex items-center text-sm text-[var(--color-foreground)]/80">
                        <svg className="w-4 h-4 mr-2 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Identify typography styles
                      </li>
                      <li className="flex items-center text-sm text-[var(--color-foreground)]/80">
                        <svg className="w-4 h-4 mr-2 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Analyze spacing & layout
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                    <AnalysisButton
                      onClick={handleAnalyze}
                      disabled={!state.image}
                      isLoading={isLoading}
                    />
                    {error && (
                      <p className="mt-4 text-center text-[var(--color-error)]">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
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

      <footer className="mt-auto pt-4 text-center border-t border-[var(--color-divider)]">
        <div className="inline-flex items-center gap-4 flex-wrap justify-center">
          <p className="text-sm text-[var(--color-foreground)]/50 mb-0 pb-0">
            © 2025 <span className="font-medium">vibecheck</span> • AI-powered
            aesthetic extraction
          </p>
          <a
            href="https://github.com/phrazzld/vibecheck"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-[var(--color-foreground)]/40 hover:text-[var(--color-primary)] transition-colors"
            aria-label="View on GitHub"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className="mr-1"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View source
          </a>
        </div>
      </footer>

      <LoadingIndicator isLoading={isLoading} />
    </div>
  );
}
