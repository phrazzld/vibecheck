import { useState, useRef, useEffect } from "react";
import { downloadMarkdownFile } from "../utils/download";
import ReactMarkdown from "react-markdown";
import { Button, CopyIcon, DownloadIcon } from "./ui";

interface StyleGuideDisplayProps {
  markdown: string;
}

interface StyleGuideSection {
  title: string;
  content: string;
  id: string;
  isOpen: boolean;
}

interface ColorSwatch {
  color: string;
  name: string;
}

const ColorSwatchesDisplay = ({ colors }: { colors: ColorSwatch[] }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error("Failed to copy color:", err);
    }
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-4">
      {colors.map((swatch, index) => (
        <button
          key={index}
          onClick={() => handleCopyColor(swatch.color)}
          className="flex flex-col items-center text-center rounded-lg overflow-hidden border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <div 
            className="w-full h-14 rounded-t-lg" 
            style={{ backgroundColor: swatch.color }}
          />
          <div className="p-2 w-full">
            <div className="font-medium text-xs text-[var(--color-foreground)]">{swatch.name}</div>
            <div className={`text-xs font-mono transition-all ${copiedColor === swatch.color ? 'text-[var(--color-accent-1)]' : 'text-[var(--color-foreground-light)]'}`}>
              {copiedColor === swatch.color ? 'Copied!' : swatch.color}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function StyleGuideDisplay({ markdown }: StyleGuideDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [showCopyError, setShowCopyError] = useState(false);
  const [sections, setSections] = useState<StyleGuideSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [colorSwatches, setColorSwatches] = useState<Record<string, ColorSwatch[]>>({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!markdown) return;
    
    // Parse markdown into sections
    const lines = markdown.split('\n');
    const parsedSections: StyleGuideSection[] = [];
    let currentSection: StyleGuideSection | null = null;
    const colors: Record<string, ColorSwatch[]> = {};
    
    lines.forEach(line => {
      // Create new section
      if (line.startsWith('## ')) {
        // Save previous section if exists
        if (currentSection) {
          parsedSections.push(currentSection);
        }
        
        const title = line.replace('## ', '');
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        currentSection = {
          title,
          content: line,
          id,
          isOpen: true // All open by default
        };
        
        // Initialize colors array for this section
        if (title.includes('Color')) {
          colors[id] = [];
        }
      } 
      // Extract color hex codes
      else if (currentSection && line.match(/#[0-9A-Fa-f]{6}/)) {
        const section = currentSection.id;
        if (colors[section]) {
          const colorMatch = line.match(/#[0-9A-Fa-f]{6}/);
          if (colorMatch) {
            const color = colorMatch[0];
            const nameParts = line.split(':');
            const name = nameParts.length > 1 
              ? nameParts[0].trim().replace(/[*_]/g, '')  // Remove markdown formatting
              : `Color ${colors[section].length + 1}`;
              
            colors[section].push({ color, name });
          }
        }
      }
      
      // Add line to current section content
      if (currentSection) {
        currentSection.content += '\n' + line;
      }
    });
    
    // Add the last section
    if (currentSection) {
      parsedSections.push(currentSection);
    }
    
    setSections(parsedSections);
    setColorSwatches(colors);
  }, [markdown]);

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
  
  const toggleSection = (id: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === id 
          ? { ...section, isOpen: !section.isOpen } 
          : section
      )
    );
    
    // If we're opening a section, set it as active
    const section = sections.find(s => s.id === id);
    if (section && !section.isOpen) {
      setActiveSection(id);
      
      // Scroll to section after a brief delay to allow animation
      setTimeout(() => {
        if (sectionRefs.current[id]) {
          sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  
  const handleSectionRef = (id: string, element: HTMLElement | null) => {
    sectionRefs.current[id] = element;
  };
  
  // CodeBlock component to handle code highlighting and copy feature
  const CodeBlock = ({ className, children, ...props }: React.HTMLProps<HTMLElement> & { node?: { position?: { start: { line: number } } } }) => {
    const [codeCopied, setCodeCopied] = useState(false);
    const isInline = !props.node?.position?.start.line;
    
    const codeContent = String(children).replace(/\n$/, '');
    
    const handleCopyCode = async () => {
      try {
        await navigator.clipboard.writeText(codeContent);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    };
    
    if (isInline) {
      return <code className={className} {...props}>{children}</code>;
    }
    
    return (
      <div className="relative group">
        <pre>
          <code className={className}>{children}</code>
        </pre>
        <button 
          onClick={handleCopyCode}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)]"
          aria-label="Copy code"
        >
          {codeCopied ? (
            <span className="text-xs font-medium px-1.5">Copied!</span>
          ) : (
            <CopyIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };
  
  // Extract Code Components
  const renderMarkdown = (content: string) => {
    // Remove the header line
    const contentWithoutHeader = content.split('\n').slice(1).join('\n');
    
    return (
      <ReactMarkdown
        components={{
          // Custom rendering for code blocks to support copy button
          code: CodeBlock
        }}
      >
        {contentWithoutHeader}
      </ReactMarkdown>
    );
  };

  if (!markdown) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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
            className="shadow-sm"
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
      
      {/* Section Navigation */}
      {sections.length > 0 && (
        <div className="mb-6 py-3 px-4 bg-[var(--color-soft-bg)] rounded-lg shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-[var(--color-primary)] rounded-full"></div>
            <h3 className="text-sm font-medium text-[var(--color-foreground)]">Jump to Section</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  
                  // Make sure the section is open
                  if (!section.isOpen) {
                    toggleSection(section.id);
                  }
                  
                  // Scroll to section
                  setTimeout(() => {
                    sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  activeSection === section.id
                    ? 'bg-[var(--color-primary)] text-white font-medium shadow-sm'
                    : 'bg-white hover:bg-[var(--color-primary-light)/10] text-[var(--color-foreground)] border border-[var(--color-border)]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Section Display */}
      <div className="space-y-6 mb-10">
        {sections.map((section) => (
          <div 
            key={section.id}
            ref={el => handleSectionRef(section.id, el)}
            className={`
              bg-white rounded-lg shadow-sm border border-[var(--color-border)] 
              overflow-hidden transition-all duration-300
              ${section.isOpen ? 'opacity-100 shadow-md' : 'opacity-80'}
            `}
            id={section.id}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex justify-between items-center bg-[var(--color-soft-bg)] hover:bg-[var(--color-soft-bg)]/80 transition-colors"
            >
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
                {section.title}
              </h3>
              <div className={`transform transition-transform ${section.isOpen ? 'rotate-180' : 'rotate-0'}`}>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </button>
            
            {section.isOpen && (
              <div className={`style-guide-section relative ${section.isOpen ? '' : 'collapsed'}`}>
                <div className="px-6 py-4">
                  {/* Special handling for color sections */}
                  {colorSwatches[section.id] && colorSwatches[section.id].length > 0 && (
                    <div className="mb-4">
                      <ColorSwatchesDisplay colors={colorSwatches[section.id]} />
                    </div>
                  )}
                  
                  {/* Regular markdown content */}
                  <div className="prose prose-sm sm:prose max-w-none">
                    {renderMarkdown(section.content)}
                  </div>
                </div>
                
                {/* Only show the gradient fade for larger content */}
                {section.content.length > 1000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Hidden container for full content that will be copied */}
      <div className="markdown hidden">
        <ReactMarkdown>
          {markdown}
        </ReactMarkdown>
      </div>
      
      {/* Floating export bar that appears when scrolling */}
      <div className={`
        sticky bottom-4 flex justify-center transition-all duration-300
        ${scrollPosition > 300 ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="bg-[var(--color-card-bg)] shadow-lg rounded-full py-2 px-4 flex gap-3 border border-[var(--color-border)]">
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleCopy}
            leftIcon={<CopyIcon className="w-3 h-3 text-[var(--color-primary)]" />}
            showSuccess={showCopySuccess}
            showError={showCopyError}
          >
            {copied ? "Copied!" : "Copy All"}
          </Button>
          
          <div className="w-px h-full bg-[var(--color-border)]"></div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<DownloadIcon className="w-3 h-3" />}
            showSuccess={showDownloadSuccess}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}