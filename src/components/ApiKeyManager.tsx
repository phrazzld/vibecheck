"use client";

import { useState, useEffect } from "react";
import { ApiKeyData } from "@/types";

interface ApiKeyManagerProps {
  onApiKeySave: (data: ApiKeyData) => void;
  apiKey: string;
  rememberKey: boolean;
}

export default function ApiKeyManager({ onApiKeySave, apiKey, rememberKey }: ApiKeyManagerProps) {
  const [key, setKey] = useState<string>(apiKey);
  const [remember, setRemember] = useState<boolean>(rememberKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(!!apiKey);
  const [isEditing, setIsEditing] = useState<boolean>(!apiKey);

  // When typing, reset the saved indicator
  useEffect(() => {
    if (key !== apiKey) {
      setIsSaved(false);
    } else {
      setIsSaved(!!apiKey);
    }
  }, [key, apiKey]);

  const handleSave = () => {
    if (!key.trim()) return;
    
    onApiKeySave({ key: key.trim(), remember });
    setIsSaved(true);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="mb-8 w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-surface)] to-[var(--color-accent-2)]/5 rounded-xl p-5 border border-[var(--color-border)]/40 shadow-lg transition-all duration-500">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg text-[var(--color-primary)]">
              OpenAI API Key
            </h3>
            {isSaved && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-3 py-1 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] transition-all duration-300"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <>
              <div className="relative mb-3">
                <input
                  type={showKey ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="sk-..."
                  className="w-full p-3 pr-10 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-300 placeholder-[var(--color-foreground)]/30"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/60 hover:text-[var(--color-primary)] transition-colors"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center mb-4">
                <input
                  id="remember-key"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-border)] focus:ring-[var(--color-primary)]/30"
                />
                <label htmlFor="remember-key" className="ml-2 text-sm text-[var(--color-foreground)]/80">
                  Remember API key in browser
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={!key.trim()}
                className={`py-2 rounded-lg font-medium transition-all duration-300 ${
                  !key.trim()
                    ? "bg-[var(--color-foreground)]/10 text-[var(--color-foreground)]/40 cursor-not-allowed"
                    : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] shadow-md hover:shadow-lg"
                }`}
              >
                Save API Key
              </button>

              <p className="text-xs text-[var(--color-foreground)]/60 mt-3">
                Your API key is only stored in your browser and never sent to our servers.
                It&apos;s used only to make requests to OpenAI for image analysis.
              </p>
            </>
          ) : (
            <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-[var(--color-success)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">API Key saved</span>
              </div>
              <p className="text-sm mt-2 text-[var(--color-foreground)]/70">
                Your OpenAI API key is {remember ? "securely stored" : "set for this session"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}