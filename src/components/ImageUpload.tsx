import { useState, useRef, DragEvent, useEffect } from "react";
import { formatFileSize, truncateFilename } from "../utils/image";
import { Button, EditIcon } from "./ui";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  isLoading?: boolean; // Add isLoading prop
}

export default function ImageUpload({ 
  onImageSelect, 
  selectedImage, 
  isLoading = false 
}: ImageUploadProps) {
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
    
    // Prevent drag interactions during loading
    if (isLoading) return;
    
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
    // Prevent file selection during loading
    if (isLoading) return;
    
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
    
    // Prevent drop interactions during loading
    if (isLoading) return;
    
    setIsDragging(false);
    setFileHovering(false);
    setHoveringFileType(null);
    setIsDropped(true);
    
    // Reset dropped state after animation completes
    setTimeout(() => {
      setIsDropped(false);
    }, 1000);
    
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
    // Prevent clicking when loading
    if (isLoading) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChangeImage = () => {
    // Prevent changing when loading
    if (isLoading) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show image preview if we have a selected image
  if (selectedImage && preview) {
    return (
      <div className="w-full h-full">
        <div className={`relative overflow-hidden h-full transition-all duration-500 ease-in-out ${previewVisible ? 'file-preview-enter-active' : 'file-preview-enter'} ${isLoading ? 'cursor-not-allowed' : 'cursor-default'}`}>
          <div className="h-full flex flex-col rounded-xl shadow-lg shadow-[var(--color-primary)]/10 overflow-hidden">
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-lavender)]/20 p-5 rounded-t-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Uploaded image preview" 
                className="max-w-full max-h-[280px] object-contain rounded-lg"
                style={{ 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
                  transition: 'all 0.5s ease-in-out',
                }}
              />
            </div>
          
            {/* Separate Control Bar - Not overlapping the image */}
            <div className="bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-surface)]/95 border-t border-[var(--color-border)]/30 px-5 py-3.5 flex justify-between items-center rounded-b-xl shadow-inner">
              <div className="flex items-center text-sm text-[var(--color-foreground)]/80 font-medium">
                <div className="p-1.5 rounded-full bg-[var(--color-primary)]/10 mr-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-[var(--color-primary)]" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="truncate max-w-[100px] md:max-w-[150px]" title={selectedImage.name}>
                  {truncateFilename(selectedImage.name, 18)}
                </span>
                <span className="ml-1.5 text-xs py-0.5 px-1.5 rounded-full bg-[var(--color-foreground)]/10">
                  {formatFileSize(selectedImage.size)}
                </span>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleChangeImage}
                disabled={isLoading}
                leftIcon={<EditIcon className="h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />}
                className={`text-xs py-1.5 px-3 font-medium shadow-md transition-all duration-300 ${
                  isLoading 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:shadow-lg"
                }`}
              >
                {isLoading ? "Analyzing..." : "Replace"}
              </Button>
            </div>
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
    <div className="w-full h-full">
      <div
        className={`group dropzone h-full transform-gpu motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-elastic ${
          isDragging ? "active" : ""
        } ${isDropped ? "dropped" : ""} ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }
        shadow-lg shadow-transparent ${isLoading ? "" : "hover:shadow-2xl hover:shadow-[var(--color-primary)]/10"}
        bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-lavender)]/20
        ${isLoading ? "" : "hover:from-[var(--color-lavender)]/5 hover:via-[var(--color-surface)] hover:to-[var(--color-primary)]/5"}
        border-2 border-dashed border-[var(--color-border)]/40 ${isLoading ? "" : "hover:border-[var(--color-primary)]/30"}
        rounded-xl backdrop-blur-sm`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ minHeight: "300px" }}
      >
        <div 
          className={`relative z-10 py-8 px-6 text-center cursor-pointer transition-all duration-500 ease-in-out h-full flex flex-col justify-center items-center ${
            fileHovering ? "scale-105" : ""
          }`}
        >
          <div className={`upload-icon-container flex items-center justify-center w-24 h-24 mx-auto mb-6 text-[var(--color-primary)] 
            ${isDragging ? "scale-110" : "hover:scale-105"} 
            transform-gpu motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-elastic
            ${fileHovering ? "animate-bounce-once" : ""}
            bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-primary)]/5
            shadow-lg shadow-[var(--color-primary)]/10 rounded-full p-5
            group-hover:shadow-xl group-hover:shadow-[var(--color-primary)]/20
            group-hover:bg-gradient-to-br group-hover:from-[var(--color-surface)] group-hover:to-[var(--color-primary)]/10
          `}>
            {fileHovering && hoveringFileType && hoveringFileType.startsWith('image/') ? (
              // Show a specialized icon when an image file is being dragged
              <div className="relative">
                <svg 
                  className="w-14 h-14 absolute inset-0 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <svg 
                  className="w-14 h-14 opacity-30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            ) : (
              // Default upload icon with slight glow effect
              <svg 
                className="w-14 h-14 drop-shadow-md group-hover:drop-shadow-xl"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
          
          <p className="mb-4 text-xl font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-elastic">
            {fileHovering 
              ? (hoveringFileType && hoveringFileType.startsWith('image/') 
                  ? "Release to upload image..." 
                  : "Drop your file here...") 
              : "Drop image or click to upload"}
          </p>
          
          {fileHovering && hoveringFileType && (
            <div className="mt-2 animate-fade-in">
              <div className="file-type-indicator hovering inline-flex items-center gap-2 mt-1 mx-auto px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 shadow-inner">
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
        <div className={`mt-5 p-3 text-sm text-center rounded-xl shadow-md backdrop-blur-sm transition-all duration-300
          ${errorType === "format" 
            ? "text-[var(--color-error)] bg-gradient-to-r from-[var(--color-error)]/20 to-[var(--color-error)]/5 border border-[var(--color-error)]/30 animate-error" 
            : "text-[var(--color-warning)] bg-gradient-to-r from-[var(--color-warning)]/20 to-[var(--color-warning)]/5 border border-[var(--color-warning)]/30 animate-pulse"
          }
          hover:shadow-lg hover:border-opacity-60 transform hover:scale-[1.02]
        `}>
          <div className="flex items-center justify-center gap-2">
            <div className={`p-1.5 rounded-full ${errorType === "format" ? "bg-[var(--color-error)]/20" : "bg-[var(--color-warning)]/20"}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                {errorType === "format" ? (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </div>
            <p className="font-medium">{error}</p>
          </div>
          
          <button 
            onClick={() => setError(null)}
            className={`mt-2 text-xs px-3 py-1 rounded-full ${
              errorType === "format" 
                ? "text-[var(--color-error)]/80 hover:text-[var(--color-error)] bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20" 
                : "text-[var(--color-warning)]/80 hover:text-[var(--color-warning)] bg-[var(--color-warning)]/10 hover:bg-[var(--color-warning)]/20"
            } transition-all duration-300`}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}