import React, { forwardRef, ButtonHTMLAttributes, useState, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'accent1' | 'accent2' | 'accent3';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonState = 'default' | 'loading' | 'success' | 'error';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: ReactNode;
  
  /**
   * Button visual style
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Loading text to display (if not provided, shows a spinner only)
   */
  loadingText?: string;
  
  /**
   * Icon to display before text
   */
  leftIcon?: ReactNode;
  
  /**
   * Icon to display after text
   */
  rightIcon?: ReactNode;
  
  /**
   * Whether to show a success animation
   */
  showSuccess?: boolean;
  
  /**
   * Whether to show an error animation
   */
  showError?: boolean;
  
  /**
   * Whether to show a pulse animation
   */
  showPulse?: boolean;
  
  /**
   * Whether the button spans the full width of its container
   */
  isFullWidth?: boolean;
  
  /**
   * Additional class names to apply to the button
   */
  className?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  showSuccess = false,
  showError = false,
  showPulse = false,
  isFullWidth = false,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}, ref) => {
  // Track hover state to animate gradient
  const [isHovered, setIsHovered] = useState(false);
  
  // Base classes that apply to all buttons
  const baseClasses = `
    flex items-center justify-center 
    font-medium transition-all
    focus-visible:outline-offset-2 focus-visible:outline-2
    rounded-[var(--radius-md)] overflow-hidden
    gap-2 relative
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isFullWidth ? 'w-full' : ''}
    ${showSuccess ? 'animate-success' : ''}
    ${showError ? 'animate-error' : ''}
    ${showPulse ? 'animate-btn-pulse' : ''}
  `;
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-5',
  }[size];
  
  // Variant-specific classes and styles
  const variantClasses = {
    primary: 'btn-primary text-white',
    secondary: 'btn-secondary text-[var(--color-primary)]',
    tertiary: 'btn-tertiary text-[var(--color-foreground)]',
    accent1: 'btn-accent-1 text-white',
    accent2: 'btn-accent-2 text-white',
    accent3: 'btn-accent-3 text-white',
  }[variant];
  
  // Special effects based on variant
  const getGradientStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundImage: 'var(--gradient-primary)',
        backgroundSize: '200% 200%',
        backgroundPosition: isHovered ? '100% 0%' : '0% 0%',
      };
    }
    if (variant === 'accent1') {
      return {
        backgroundImage: 'linear-gradient(135deg, var(--color-accent-1) 0%, var(--color-primary) 100%)',
        backgroundSize: '200% 200%',
        backgroundPosition: isHovered ? '100% 0%' : '0% 0%',
      };
    }
    if (variant === 'accent2') {
      return {
        backgroundImage: 'linear-gradient(135deg, var(--color-accent-2) 0%, var(--color-primary-light) 100%)',
        backgroundSize: '200% 200%',
        backgroundPosition: isHovered ? '100% 0%' : '0% 0%',
      };
    }
    if (variant === 'accent3') {
      return {
        backgroundImage: 'linear-gradient(135deg, var(--color-accent-3) 0%, var(--color-primary) 100%)',
        backgroundSize: '200% 200%',
        backgroundPosition: isHovered ? '100% 0%' : '0% 0%',
      };
    }
    return {};
  };
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
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
  );
  
  // Shine effect overlay (for primary, accent1, accent2, accent3)
  const ShineEffect = () => (
    <span 
      className={`
        absolute inset-0 w-full h-full 
        bg-gradient-to-r from-transparent via-white to-transparent 
        opacity-0 duration-700 transform -translate-x-full
        ${isHovered ? 'opacity-[0.15] translate-x-full' : ''}
      `}
      style={{ transition: 'transform 0.7s ease, opacity 0.7s ease' }}
    ></span>
  );
  
  return (
    <button
      ref={ref}
      type={type}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className} group`}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getGradientStyle()}
      {...props}
    >
      {/* Shine effect for gradient buttons */}
      {['primary', 'accent1', 'accent2', 'accent3'].includes(variant) && <ShineEffect />}
      
      {/* Button content with conditional loading state */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <LoadingSpinner />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';