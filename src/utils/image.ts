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

/**
 * Validates if a file is an acceptable image format
 */
export const isValidImageFile = (file: File): boolean => {
  const acceptableTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  
  // Also check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return false;
  }
  
  return acceptableTypes.includes(file.type);
};

/**
 * Returns appropriate icon for file type
 */
export const getFileTypeIcon = (file: File): string => {
  const type = file.type.split('/')[0];
  
  // Image-specific icons
  if (type === 'image') {
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>`;
    } else if (file.type === 'image/png') {
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>`;
    } else if (file.type === 'image/gif') {
      return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
      </svg>`;
    }
    
    // Default image icon
    return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
    </svg>`;
  }
  
  // Fallback/default icon
  return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
  </svg>`;
};

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