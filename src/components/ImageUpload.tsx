import { useState, useRef, DragEvent, useEffect } from "react";
import { isValidImageFile } from "../utils/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export default function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileHovering, setFileHovering] = useState(false);

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
    e.stopPropagation();
    
    // Check if dragging a file
    if (e.dataTransfer.types.some(type => type === 'Files')) {
      setFileHovering(true);
    }
    
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileHovering(false);
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
    e.stopPropagation();
    
    setIsDragging(false);
    setFileHovering(false);
    setIsDropped(true);
    
    // Reset dropped state after animation completes
    setTimeout(() => {
      setIsDropped(false);
    }, 600);
    
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
          <div className="relative bg-[var(--color-card-bg)] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] transition-all duration-300 hover:shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-center bg-gradient-to-b from-[var(--color-soft-bg)] to-[var(--color-soft-bg)] bg-opacity-50 p-4">
              <img 
                src={preview} 
                alt="Uploaded image preview" 
                className="max-w-full max-h-[300px] object-contain rounded-sm"
                style={{ 
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/80 to-transparent opacity-0 hover:opacity-100 transition-all duration-[var(--transition-standard)] flex items-end justify-center p-4">
              <button 
                onClick={handleChangeImage}
                className="btn-secondary py-2 px-4 rounded-full text-sm flex items-center gap-2 bg-white/95 hover:bg-white text-[var(--color-primary)] border-0 shadow-lg transform hover:scale-105 transition-transform"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-soft-bg)]">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-[var(--color-primary)]" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-[var(--color-foreground)]/80 font-medium">
              {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
            </span>
          </div>
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
          isDragging ? "active" : ""
        } ${isDropped ? "dropped" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div 
          className={`relative z-10 p-8 text-center cursor-pointer transition-all duration-300 ${
            fileHovering ? "scale-105" : ""
          }`}
        >
          <div className={`upload-icon-container flex items-center justify-center w-20 h-20 mx-auto mb-6 text-[var(--color-primary)] ${
            isDragging ? "scale-110" : ""
          }`}>
            <svg 
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          
          <p className="mb-3 text-base font-semibold text-[var(--color-foreground)]">
            {fileHovering 
              ? "Drop your image here..." 
              : "Drag and drop an image here, or click to select"}
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
        <div className="mt-4 p-2 text-sm text-center text-[var(--color-error)] bg-[var(--color-error)]/10 rounded-md border border-[var(--color-error)]/20">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}