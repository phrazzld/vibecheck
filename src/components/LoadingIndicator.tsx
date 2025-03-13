import { useEffect, useState, useMemo } from "react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

// Create stable particles that won't re-render
const createParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 4, // Smaller particles (2-6px)
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: 15 + Math.random() * 10, // Longer animation (15-25s)
    delay: i * (5 / count), // Evenly staggered delays
    color: ['primary', 'mint', 'accent-1', 'accent-2', 'lavender'][Math.floor(Math.random() * 5)]
  }));
};

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Create stable particles that won't change position on re-renders
  const particles = useMemo(() => createParticles(18), []);
  
  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      
      // Reset and start progress simulation
      setProgress(0);
      
      // Use a more stable and smooth progress simulation
      const startTime = Date.now();
      const totalDuration = 25000; // 25 seconds total
      
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const rawProgress = (elapsedTime / totalDuration) * 100;
        
        // Apply easing function to create natural slowdown
        // Cubic ease-out function makes it slow down gracefully
        const t = Math.min(elapsedTime / totalDuration, 1);
        const easedProgress = 1 - Math.pow(1 - t, 3);
        const clampedProgress = Math.min(easedProgress * 98, 98); // Keep below 99%
        
        setProgress(clampedProgress);
        
        // Stop when nearly complete
        if (rawProgress >= 100) {
          clearInterval(interval);
        }
      }, 100); // Update frequently for smoother animation
      
      return () => clearInterval(interval);
    } else {
      // Add delay before hiding to allow exit animation
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  
  // Don't render anything if not loading and not visible
  if (!isLoading && !isVisible) return null;
  
  // Calculate the percentage for display and the progress circle
  const percentage = Math.min(Math.floor(progress), 99);
  const circumference = 2 * Math.PI * 40; // 40 is the radius of our circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div 
      className={`fixed inset-0 bg-[var(--color-background)]/80 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        className="card p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] flex flex-col items-center max-w-sm w-full relative overflow-hidden animate-slide-in hover:shadow-[var(--shadow-lg)] transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-card-bg)',
          transform: isLoading ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-lavender)]/10 via-[var(--color-primary)]/5 to-[var(--color-mint)]/10 opacity-30 animate-gradient-x"
          style={{ backgroundSize: '400% 400%' }}
        ></div>
        
        {/* Subtle particle effects */}
        {particles.map(particle => (
          <div 
            key={particle.id}
            className="absolute rounded-full" 
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              background: `var(--color-${particle.color})`,
              opacity: 0.2,
              transform: 'translateZ(0)', // Force GPU acceleration
              animation: `particle-float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              zIndex: 1
            }}
          />
        ))}
        
        <div className="relative z-10 w-full animate-fade-in">
          {/* Progress Circle */}
          <div className="w-[120px] h-[120px] relative mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="var(--color-soft-bg)" 
                strokeWidth="6"
              />
              
              {/* Progress circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
              >
                {/* Optional subtle glow effect */}
                <animate attributeName="stroke-width" values="6;7;6" dur="2s" repeatCount="indefinite" />
              </circle>
              
              {/* Define the gradient for the progress circle */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="50%" stopColor="var(--color-mint)" />
                  <stop offset="100%" stopColor="var(--color-accent-1)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center animated icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px]">
              <div className="relative w-full h-full">
                {/* Circular pattern that rotates very slowly */}
                <svg 
                  className="w-full h-full absolute" 
                  viewBox="0 0 100 100"
                  style={{ animation: 'rotate 20s linear infinite' }}
                >
                  <g opacity="0.15">
                    <circle cx="50" cy="20" r="3" fill="var(--color-primary)" />
                    <circle cx="80" cy="50" r="3" fill="var(--color-mint)" />
                    <circle cx="50" cy="80" r="3" fill="var(--color-accent-1)" />
                    <circle cx="20" cy="50" r="3" fill="var(--color-accent-2)" />
                  </g>
                </svg>
                
                {/* Percentage in center with transition */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-[var(--color-primary)] font-medium text-xl"
                    style={{ 
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: percentage % 10 === 0 ? 'scale(1.15)' : 'scale(1)',
                      filter: percentage % 10 === 0 ? 'brightness(1.2)' : 'brightness(1)'
                    }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Text content */}
          <h3 className="text-xl font-medium text-center mb-3 text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            Generating Style Guide
          </h3>
          <p className="text-sm text-center text-[var(--color-foreground)]">
            Our AI is analyzing your image and creating a detailed style guide...
          </p>
          
          {/* Processing steps with staggered fade-in and dynamic icons */}
          <div className="mt-4 space-y-2">
            <div 
              className="flex items-center text-xs" 
              style={{ 
                opacity: percentage > 5 ? 1 : 0,
                transform: percentage > 5 ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease' 
              }}
            >
              {percentage <= 10 ? (
                <svg className="w-4 h-4 mr-2 text-[var(--color-primary)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 text-[var(--color-success)] animate-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-[var(--color-foreground)]/70">Extracting color palette</span>
            </div>
            
            <div 
              className="flex items-center text-xs" 
              style={{ 
                opacity: percentage > 20 ? 1 : 0,
                transform: percentage > 20 ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: '0.1s'
              }}
            >
              {percentage <= 30 ? (
                <svg className="w-4 h-4 mr-2 text-[var(--color-primary)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 text-[var(--color-success)] animate-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-[var(--color-foreground)]/70">Analyzing typography patterns</span>
            </div>
            
            <div 
              className="flex items-center text-xs" 
              style={{ 
                opacity: percentage > 40 ? 1 : 0,
                transform: percentage > 40 ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: '0.2s'
              }}
            >
              {percentage <= 50 ? (
                <svg className="w-4 h-4 mr-2 text-[var(--color-primary)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 text-[var(--color-success)] animate-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-[var(--color-foreground)]/70">Detecting spacing & layout rules</span>
            </div>
            
            <div 
              className="flex items-center text-xs" 
              style={{ 
                opacity: percentage > 60 ? 1 : 0,
                transform: percentage > 60 ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: '0.3s'
              }}
            >
              {percentage < 95 ? (
                <svg className="w-4 h-4 mr-2 text-[var(--color-primary)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 text-[var(--color-success)] animate-bounce-once" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`${percentage >= 95 ? 'font-medium text-[var(--color-foreground)]' : 'text-[var(--color-foreground)]/70'}`}>
                Generating comprehensive style guide
              </span>
              {percentage >= 95 && (
                <span className="ml-1 text-[var(--color-success)] font-medium">
                  Complete!
                </span>
              )}
            </div>
          </div>
          
          {/* Progress bar with smoother transition */}
          <div className="mt-6 w-full bg-[var(--color-soft-bg)] rounded-full h-1.5 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-mint)] to-[var(--color-primary)] animate-gradient-x relative" 
              style={{ 
                width: `${percentage}%`,
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Smooth spring-like transition
                backgroundSize: '200% 200%',
                boxShadow: '0 0 8px rgba(93, 95, 239, 0.3)'
              }}
            >
              {/* Animated glow effect at the progress point */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-2 rounded-full"
                style={{
                  background: 'white',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 5px var(--color-primary)',
                  opacity: percentage % 5 === 0 ? 0.7 : 0.3,
                  transition: 'opacity 0.2s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}