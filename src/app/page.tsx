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
    <div className="min-h-screen p-6 md:p-8 pb-20">
      <header className="flex flex-col items-center mb-16 md:mb-24">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-2)] to-[var(--color-mint)] opacity-15 blur-xl rounded-full"></div>
          <div className="flex items-center">
            <h1
              className="text-5xl sm:text-5xl"
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

        <div className="mt-8 max-w-lg text-center">
          <p className="text-lg text-semibold" style={{ fontWeight: 500 }}>
            Transform images into detailed design aesthetic profiles.
          </p>
          <p className="mt-2 text-[var(--color-foreground)]/70 text-base">
            Upload an image and get a complete breakdown of its colors,
            typography, and design elements.
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
                <p
                  className="text-center text-[var(--color-foreground)]/70 mb-8 max-w-lg"
                  style={{ lineHeight: "var(--leading-relaxed)" }}
                >
                  Our AI will analyze your image and create a detailed style
                  guide with colors, typography, spacing, and design patterns.
                </p>

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

      <footer className="mt-16 mb-8 pt-4 text-center border-t border-[var(--color-divider)]">
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
