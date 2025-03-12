import { useState, useRef, DragEvent, useEffect } from "react";
import { isValidImageFile } from "../utils/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export default function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URL when selected image changes
  useEffect(() => {
    if (!selectedImage) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);

    // Free memory when this component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSelectFile = (file: File) => {
    if (!isValidImageFile(file)) {
      setError("Please upload a valid image (JPEG, PNG, WEBP, or GIF)");
      return;
    }
    
    setError(null);
    onImageSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show image preview if we have a selected image
  if (selectedImage && preview) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <div className="relative bg-[var(--color-card-bg)] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-center bg-[var(--color-soft-bg)]">
              <img 
                src={preview} 
                alt="Uploaded image preview" 
                className="max-w-full max-h-[300px] object-contain my-4"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/70 to-transparent opacity-0 hover:opacity-100 transition-all duration-[var(--transition-standard)] flex items-end justify-center p-4">
              <button 
                onClick={handleChangeImage}
                className="btn-secondary py-2 px-4 rounded-full text-sm flex items-center gap-2 bg-white/90 hover:bg-white text-[var(--color-primary)] border-0"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Change Image
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--color-foreground)]/70">
            {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
          </p>
        </div>
        
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
        />
      </div>
    );
  }

  // Show upload form if no image is selected
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`dropzone transition-all duration-[var(--transition-standard)] ${
          isDragging ? "active scale-[1.02]" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className={`p-8 text-center cursor-pointer ${isDragging ? "scale-105" : ""} transition-transform duration-300`}>
          <svg 
            className="w-16 h-16 mx-auto mb-6 text-[var(--color-primary)]"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          <p className="mb-3 text-base font-medium text-[var(--color-foreground)]">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-sm text-[var(--color-foreground)]/60">
            JPEG, PNG, WEBP, or GIF (max 10MB)
          </p>
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
        />
      </div>
      
      {error && (
        <p className="mt-4 text-sm text-center text-[var(--color-pink)]">{error}</p>
      )}
    </div>
  );
}