/**
 * Creates and triggers a download for a markdown string
 */
export const downloadMarkdownFile = (markdown: string, filename: string = "style-guide.md"): void => {
  // Create a blob with the markdown content
  const blob = new Blob([markdown], { type: "text/markdown" });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the object URL
  URL.revokeObjectURL(url);
};