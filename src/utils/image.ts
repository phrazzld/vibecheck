/**
 * Converts a File object to a base64-encoded string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Extract the base64 data from the data URL
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/* Function isValidImageFile was removed - no longer used in the app */

/* Function getFileTypeIcon was removed - no longer used in the app */

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
};

/**
 * Truncates a filename to display nicely in the UI
 * Preserves the start and end, with ellipsis in the middle
 */
export const truncateFilename = (filename: string, maxLength: number = 24): string => {
  if (filename.length <= maxLength) {
    return filename;
  }
  
  // Find the last dot to preserve the file extension
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1 || lastDotIndex < filename.length - 7) {
    // No extension or very long extension - just truncate the middle
    const charsToShow = Math.floor((maxLength - 3) / 2);
    return `${filename.substring(0, charsToShow)}...${filename.substring(filename.length - charsToShow)}`;
  }
  
  // Get extension including the dot
  const extension = filename.substring(lastDotIndex);
  
  // Calculate how many characters we can show from the start
  const filenameWithoutExt = filename.substring(0, lastDotIndex);
  const startChars = maxLength - extension.length - 3; // 3 for the ellipsis
  
  if (startChars < 3) {
    // Extension is too long, fallback to simple truncation
    return `${filename.substring(0, maxLength - 3)}...`;
  }
  
  return `${filenameWithoutExt.substring(0, startChars)}...${extension}`;
};