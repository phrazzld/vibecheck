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
  return acceptableTypes.includes(file.type);
};