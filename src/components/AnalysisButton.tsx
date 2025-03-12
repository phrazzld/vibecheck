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
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-3 px-4 rounded-md font-medium text-white
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        ${disabled || isLoading 
          ? "bg-gray-400 cursor-not-allowed" 
          : "bg-gradient-to-r from-[#9D50BB] to-[#6E48AA] hover:from-[#8A40A8] hover:to-[#5D3A98]"
        }
      `}
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
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Analyzing Image...
        </div>
      ) : (
        "Analyze Image"
      )}
    </button>
  );
}