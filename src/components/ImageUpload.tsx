import { useState, useRef, DragEvent, useEffect } from "react";
import { formatFileSize, truncateFilename } from "../utils/image";
import { Button, EditIcon } from "./ui";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export default function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"format" | "size" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileHovering, setFileHovering] = useState(false);
  const [hoveringFileType, setHoveringFileType] = useState<string | null>(null);

  // Generate preview URL when selected image changes
  useEffect(() => {
    if (!selectedImage) {
      setPreview(null);
      setPreviewVisible(false);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreview(objectUrl);
    
    // Show preview with a slight delay for fade-in effect
    setTimeout(() => {
      setPreviewVisible(true);
    }, 100);

    // Free memory when this component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragging a file
    if (e.dataTransfer.types.some(type => type === 'Files')) {
      setFileHovering(true);
      
      // Try to detect file type from drag data
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        // If we can detect it's an image, show that in the UI
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          setHoveringFileType(item.type);
        }
      }
    }
    
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileHovering(false);
    setHoveringFileType(null);
  };

  const validateAndSelectFile = (file: File) => {
    const acceptableTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    
    // First validate file type
    if (!acceptableTypes.includes(file.type)) {
      setError(`Unsupported file type. Please upload a valid image (JPEG, PNG, WEBP, or GIF)`);
      setErrorType("format");
      return;
    }
    
    // Then validate file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is 10MB. This file is ${formatFileSize(file.size)}`);
      setErrorType("size");
      return;
    }
    
    // Clear any previous errors
    setError(null);
    setErrorType(null);
    
    // Reset the preview visibility for a smooth transition
    setPreviewVisible(false);
    
    // Pass the valid image to the parent component
    onImageSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setFileHovering(false);
    setHoveringFileType(null);
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
        <div className={`relative overflow-hidden rounded-[var(--radius-lg)] transition-all duration-300 ${previewVisible ? 'file-preview-enter-active' : 'file-preview-enter'}`}>
          <div className="bg-[var(--color-card-bg)] overflow-hidden rounded-t-[var(--radius-lg)] shadow-[var(--shadow-md)] transition-all duration-300 hover:shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-center bg-gradient-to-b from-[var(--color-soft-bg)] to-[var(--color-soft-bg)] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Uploaded image preview" 
                className="max-w-full max-h-[300px] object-contain rounded-sm"
                style={{ 
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
                }}
              />
            </div>
          </div>
          
          {/* Separate Control Bar - Not overlapping the image */}
          <div className="bg-[var(--color-soft-bg)] border-t border-[var(--color-border)] rounded-b-[var(--radius-lg)] px-4 py-3 flex justify-between items-center shadow-[var(--shadow-md)]">
            <div className="flex items-center text-sm text-[var(--color-foreground)]/80 font-medium">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2 text-[var(--color-primary)]" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="truncate max-w-[180px]" title={selectedImage.name}>
                {truncateFilename(selectedImage.name, 24)}
              </span>
              <span className="ml-1 text-xs opacity-70">
                ({formatFileSize(selectedImage.size)})
              </span>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleChangeImage}
              leftIcon={<EditIcon className="h-3.5 w-3.5 group-hover:rotate-12" />}
              className="text-xs py-1.5 px-3 font-medium"
            >
              Replace
            </Button>
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
          <div className={`upload-icon-container flex items-center justify-center w-20 h-20 mx-auto mb-6 text-[var(--color-primary)] 
            ${isDragging ? "scale-110" : "hover:scale-105"} 
            transition-all duration-300
            ${fileHovering ? "animate-bounce-once" : ""}
          `}>
            {fileHovering && hoveringFileType && hoveringFileType.startsWith('image/') ? (
              // Show a specialized icon when an image file is being dragged
              <div className="relative">
                <svg 
                  className="w-12 h-12 absolute inset-0 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <svg 
                  className="w-12 h-12 opacity-30"
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
            ) : (
              // Default upload icon
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
            )}
          </div>
          
          <p className="mb-3 text-base font-semibold text-[var(--color-foreground)]">
            {fileHovering 
              ? (hoveringFileType && hoveringFileType.startsWith('image/') 
                  ? "Drop to upload image..." 
                  : "Drop your file here...") 
              : "Drag and drop an image here, or click to select"}
          </p>
          
          <p className="text-sm text-[var(--color-foreground)]/60">
            JPEG, PNG, WEBP, or GIF (max 10MB)
          </p>
          
          {fileHovering && hoveringFileType && (
            <div className="mt-4 animate-fade-in">
              <div className={`file-type-indicator hovering inline-flex items-center gap-2 mt-4 mx-auto`}>
                {hoveringFileType.startsWith('image/') ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-[var(--color-primary)]" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-[var(--color-warning)]" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {hoveringFileType.split('/')[1].toUpperCase()}
                </span>
              </div>
            </div>
          )}
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
        <div className={`mt-4 p-3 text-sm text-center rounded-md shadow-sm transition-all duration-200 
          ${errorType === "format" 
            ? "text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 animate-error" 
            : "text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 animate-pulse"
          }
          hover:shadow-md hover:border-opacity-50 
        `}>
          <div className="flex items-center justify-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              {errorType === "format" ? (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              )}
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}