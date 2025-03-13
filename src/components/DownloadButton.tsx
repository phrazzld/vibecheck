import { useState } from "react";
import { downloadMarkdownFile } from "../utils/download";
import { Button, DownloadIcon } from "./ui";

interface DownloadButtonProps {
  markdown: string;
  filename?: string;
}

export default function DownloadButton({ 
  markdown, 
  filename = "vibecheck-style-guide.md" 
}: DownloadButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleDownload = () => {
    downloadMarkdownFile(markdown, filename);
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 600);
  };

  return (
    <Button
      variant="accent3"
      size="md"
      onClick={handleDownload}
      leftIcon={<DownloadIcon />}
      showSuccess={showSuccess}
    >
      Download Aesthetic
    </Button>
  );
}