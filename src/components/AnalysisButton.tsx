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
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          btn-primary w-full py-4 px-6 rounded-[var(--radius-md)] 
          ${disabled || isLoading 
            ? "opacity-50 cursor-not-allowed" 
            : ""
          }
        `}
        style={{ 
          fontFamily: 'var(--font-primary)',
          transition: 'all var(--transition-standard)',
          background: 'var(--gradient-primary)',
          backgroundSize: '200% 200%',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
            <span className="text-base font-semibold">Analyzing Image...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center group">
            <span className="text-base font-semibold mr-2">Analyze Image</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
            >
              <path 
                fillRule="evenodd" 
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}