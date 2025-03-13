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
  
  // Add pulse effect after 3 seconds of page load to draw attention
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!disabled && !isLoading) {
        setIsPulsingEnabled(true);
      }
    }, 3000);
    
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
      >
        Extract Aesthetic
      </Button>
    </div>
  );
}