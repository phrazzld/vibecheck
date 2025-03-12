interface LoadingIndicatorProps {
  isLoading: boolean;
}

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-[var(--color-background)]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] flex flex-col items-center max-w-sm w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-lavender)]/20 via-[var(--color-primary)]/10 to-[var(--color-mint)]/20 opacity-30 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-mint)] p-1 mb-6">
            <div className="w-full h-full rounded-full bg-[var(--color-card-bg)] flex items-center justify-center relative overflow-hidden">
              <svg
                className="animate-spin h-10 w-10 text-[var(--color-primary)] absolute"
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
                  className="opacity-100"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-medium text-center mb-3 text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-accent)' }}>
            Generating Style Guide
          </h3>
          <p className="text-sm text-center text-[var(--color-foreground)]">
            Our AI is analyzing your image and creating a detailed style guide.
          </p>
          <p className="text-xs text-center text-[var(--color-foreground)]/60 mt-2">
            This may take a minute or two
          </p>
          
          <div className="mt-6 w-full bg-[var(--color-soft-bg)] rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-mint)] to-[var(--color-primary)] animate-gradient-x" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}