import { useState } from "react";
import { downloadMarkdownFile } from "../utils/download";

interface StyleGuideDisplayProps {
  markdown: string;
}

export default function StyleGuideDisplay({ markdown }: StyleGuideDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = () => {
    downloadMarkdownFile(markdown, "vibecheck-style-guide.md");
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Generated Style Guide</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-[#9D50BB] text-white rounded hover:bg-[#8A40A8] transition-colors"
          >
            Download
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 bg-white shadow overflow-auto max-h-[70vh]">
        <div className="prose prose-sm sm:prose max-w-none">
          {/* This would use react-markdown in a real implementation */}
          <pre className="whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}