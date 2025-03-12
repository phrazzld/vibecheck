import { downloadMarkdownFile } from "../utils/download";

interface DownloadButtonProps {
  markdown: string;
  filename?: string;
}

export default function DownloadButton({ 
  markdown, 
  filename = "vibecheck-style-guide.md" 
}: DownloadButtonProps) {
  const handleDownload = () => {
    downloadMarkdownFile(markdown, filename);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-[#9D50BB] text-white rounded-md hover:bg-[#8A40A8] transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      Download Style Guide
    </button>
  );
}