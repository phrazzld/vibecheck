"use client";

import { useState, useCallback, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import StyleGuideDisplay from "@/components/StyleGuideDisplay";
import ApiKeyManager from "@/components/ApiKeyManager";
import { Button, ArrowLeftIcon } from "@/components/ui";
import { AppState, ApiKeyData } from "@/types";
import { fileToBase64 } from "@/utils/image";

// Local storage key
const API_KEY_STORAGE_KEY = "vibecheck_api_key_data";

export default function Home() {
  // Initialize state with stored API key if available
  const [state, setState] = useState<AppState>(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData) as ApiKeyData;
          // Only use the saved key if the user opted to remember it
          if (parsedData.remember) {
            return {
              image: null,
              result: null,
              apiKey: parsedData.key,
              rememberKey: parsedData.remember,
            };
          }
        }
      } catch (e) {
        // Silent fail - if there's an error reading localStorage, just use default state
        console.error("Error reading from localStorage", e);
      }
    }

    // Default state
    return {
      image: null,
      result: null,
      apiKey: "",
      rememberKey: false,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySave = useCallback((data: ApiKeyData) => {
    setState((prev) => ({
      ...prev,
      apiKey: data.key,
      rememberKey: data.remember,
    }));

    // Save to localStorage if remember is true
    if (data.remember) {
      localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(data));
    } else {
      // If not remembering, clear any previously saved key
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      image: file,
      // Reset result when a new image is selected
      result: null,
    }));
    setError(null);
  }, []);

  // Define the analyze function separately to avoid circular dependencies
  const analyzeImage = useCallback(
    async (imageFile: File) => {
      // Check for API key before proceeding
      if (!state.apiKey.trim()) {
        setError("OpenAI API key is required to analyze images");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Convert image to base64
        const base64Image = await fileToBase64(imageFile);

        // Call API with user's API key
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            apiKey: state.apiKey,
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
    },
    [state.apiKey, setIsLoading, setError, setState],
  );

  // Auto-trigger analysis when a valid image is uploaded
  useEffect(() => {
    if (state.image && state.apiKey) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        // Type assertion since we've already checked that state.image is not null
        analyzeImage(state.image as File);
      }, 800); // Slight delay to allow the image preview to render

      return () => clearTimeout(timer);
    }
  }, [state.image, state.apiKey, analyzeImage]);

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

      <main className="max-w-3xl mx-auto flex-1 w-full">
        {!state.result ? (
          <div>
            <section className="flex flex-col">
              {/* If no API key set yet, show API key form prominently */}
              {!state.apiKey ? (
                <ApiKeyManager
                  onApiKeySave={handleApiKeySave}
                  apiKey={state.apiKey}
                  rememberKey={state.rememberKey}
                />
              ) : (
                /* If API key is set, show the image upload component */
                <div className="w-full max-w-md mx-auto">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    selectedImage={state.image}
                    isLoading={isLoading}
                  />

                  {/* Show compact API key manager below the upload */}
                  <div className="mt-4">
                    <ApiKeyManager
                      onApiKeySave={handleApiKeySave}
                      apiKey={state.apiKey}
                      rememberKey={state.rememberKey}
                    />
                  </div>
                </div>
              )}

              {/* Show friendly message if no API key is provided */}
              {!state.apiKey && (
                <div className="mt-4 w-full max-w-md mx-auto text-center">
                  <div className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-2 text-[var(--color-warning)] mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">API Key Required</span>
                    </div>
                    <p className="text-sm text-[var(--color-foreground)]/70">
                      Please add your OpenAI API key to use the image analyzer.
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-8 text-center">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-br from-[var(--color-primary)]/15 via-[var(--color-accent-2)]/10 to-[var(--color-lavender)]/15 shadow-lg shadow-[var(--color-primary)]/5 backdrop-blur-sm">
                    <svg
                      className="animate-spin h-10 w-10 text-[var(--color-primary)]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-20"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                  <p className="mt-4 text-xl text-[var(--color-foreground)]/90 font-medium">
                    Analyzing your image...
                  </p>
                  <p className="text-base text-[var(--color-foreground)]/60 mt-2 max-w-sm mx-auto">
                    Extracting colors, typography, and design patterns
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-8 text-center">
                  <div className="p-4 inline-block text-center text-[var(--color-error)] bg-gradient-to-r from-[var(--color-error)]/20 to-[var(--color-error)]/5 rounded-xl border border-[var(--color-error)]/30 backdrop-blur-sm shadow-md">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-[var(--color-error)]/15">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-lg">{error}</span>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-sm px-4 py-1.5 rounded-full bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)]/90 hover:text-[var(--color-error)] transition-all duration-300 shadow-sm hover:shadow"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <Button
                variant="tertiary"
                onClick={() =>
                  setState((prev) => ({ ...prev, result: null, image: null }))
                }
                leftIcon={<ArrowLeftIcon />}
                className="border border-[var(--color-border)] shadow-sm"
              >
                Analyze New Image
              </Button>

              {/* Show compact API key manager on result page too */}
              {state.apiKey && (
                <ApiKeyManager
                  onApiKeySave={handleApiKeySave}
                  apiKey={state.apiKey}
                  rememberKey={state.rememberKey}
                />
              )}
            </div>

            <section className="section section-result">
              <StyleGuideDisplay markdown={state.result} />
            </section>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-4 text-center border-t border-[var(--color-divider)]/20">
        <div className="inline-flex items-center gap-4 flex-wrap justify-center">
          <p className="text-sm text-[var(--color-foreground)]/50 mb-0 pb-0">
            © 2025 <span className="font-medium">vibecheck</span>
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
    </div>
  );
}
