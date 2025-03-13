import { useState, useEffect } from 'react';
import { Button, ArrowRightIcon } from './ui';

interface AnalysisButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export default function AnalysisButton({ 
  onClick, 
  disabled, 
  isLoading = false 
}: AnalysisButtonProps) {
  const [isPulsingEnabled, setIsPulsingEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Add pulse effect after 2 seconds of page load to draw attention
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!disabled && !isLoading) {
        setIsPulsingEnabled(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [disabled, isLoading]);
  
  // Stop pulsing after 3 pulses
  useEffect(() => {
    if (isPulsingEnabled) {
      const timer = setTimeout(() => {
        setIsPulsingEnabled(false);
      }, 4500); // roughly 3 pulses
      
      return () => clearTimeout(timer);
    }
  }, [isPulsingEnabled]);

  const handleClick = () => {
    if (disabled || isLoading) return;
    
    setIsPulsingEnabled(false);
    onClick();
    
    // Show success animation when loading completes
    if (!isLoading) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        disabled={disabled}
        isLoading={isLoading}
        loadingText="Analyzing Image..."
        rightIcon={<ArrowRightIcon />}
        showPulse={isPulsingEnabled}
        showSuccess={showSuccess}
        isFullWidth
        className="shadow-md hover:shadow-lg transition-shadow px-4 py-2.5 md:py-3"
      >
        Extract Aesthetic
      </Button>
      
      {/* Subtle hint arrow pointing to button when image is selected but not yet analyzed */}
      {!disabled && !isLoading && !isPulsingEnabled && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[var(--color-primary)] animate-bounce-gentle opacity-80">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}