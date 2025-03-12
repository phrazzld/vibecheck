import { useState } from "react";
import { downloadMarkdownFile } from "../utils/download";
import ReactMarkdown from "react-markdown";
import { Button, CopyIcon, DownloadIcon } from "./ui";

interface StyleGuideDisplayProps {
  markdown: string;
}

export default function StyleGuideDisplay({ markdown }: StyleGuideDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setShowCopySuccess(true);
      
      // Success animation
      setTimeout(() => {
        setShowCopySuccess(false);
      }, 600);
      
      // Reset text after animation completes
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setShowCopyError(true);
      setTimeout(() => {
        setShowCopyError(false);
      }, 600);
    }
  };

  const handleDownload = () => {
    downloadMarkdownFile(markdown, "vibecheck-style-guide.md");
    setShowDownloadSuccess(true);
    setTimeout(() => {
      setShowDownloadSuccess(false);
    }, 600);
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-accent)' }}>
          Generated Style Guide
        </h2>
        <div className="flex gap-3">
          <Button
            variant="tertiary"
            size="md"
            onClick={handleCopy}
            leftIcon={<CopyIcon className="w-4 h-4 text-[var(--color-primary)]" />}
            showSuccess={showCopySuccess}
            showError={showCopyError}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            leftIcon={<DownloadIcon className="w-4 h-4" />}
            showSuccess={showDownloadSuccess}
          >
            Download
          </Button>
        </div>
      </div>
      
      <div className="markdown overflow-auto max-h-[70vh] rounded-lg prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none transition-all hover:shadow-md">
        <ReactMarkdown>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}