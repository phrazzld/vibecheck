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
  
  // Determine if it's a dark color to ensure text contrast
  const isDarkColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.6;
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-6">
      {colors.map((swatch, index) => {
        const isDark = isDarkColor(swatch.color);
        
        return (
          <button
            key={index}
            onClick={() => handleCopyColor(swatch.color)}
            className="group relative flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg rounded-lg border border-[var(--color-border)] hover:translate-y-[-2px]"
            style={{ 
              backgroundColor: '#fff',
              boxShadow: `0 2px 8px ${swatch.color}15`
            }}
          >
            {/* Color preview */}
            <div 
              className="w-full h-24 flex items-center justify-center"
              style={{ backgroundColor: swatch.color }}
            >
              {copiedColor === swatch.color && (
                <div className="bg-white/30 backdrop-blur-sm p-2 rounded-full">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="w-6 h-6"
                    style={{ color: isDark ? '#fff' : '#000' }}
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path 
                      d="M5 13l4 4L19 7" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Color info */}
            <div className="flex flex-col items-start p-3 bg-white">
              <span className="text-sm font-medium">{swatch.name}</span>
              <span className={`text-xs font-mono mt-1 ${copiedColor === swatch.color ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]/70'}`}>
                {swatch.color}
              </span>
              
              <div className="mt-2 pt-2 border-t w-full flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-foreground)]/60">
                  Click to copy
                </span>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-[var(--color-foreground)]/40"
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* Tooltip */}
            {copiedColor === swatch.color && (
              <span className="absolute top-2 right-2 px-2 py-1 text-[10px] bg-[var(--color-primary)] text-white rounded-md opacity-90">
                Copied!
              </span>
            )}
          </button>
        );
      })}
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
    let colorPaletteSection: StyleGuideSection | null = null;
    
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
        
        // Identify color palette section
        if (title.includes('Color')) {
          colorPaletteSection = currentSection;
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
    
    // Reorganize sections to prioritize color palette
    const reorderedSections = [...parsedSections];
    if (colorPaletteSection) {
      // Remove color palette from its current position
      const colorIndex = reorderedSections.findIndex(s => s.id === colorPaletteSection?.id);
      if (colorIndex !== -1) {
        const [colorSection] = reorderedSections.splice(colorIndex, 1);
        // Add it to the beginning
        reorderedSections.unshift(colorSection);
      }
    }
    
    setSections(reorderedSections);
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
              <div className={`style-guide-section ${section.isOpen ? '' : 'collapsed'}`}>
                {/* Special handling for color sections */}
                {colorSwatches[section.id] && colorSwatches[section.id].length > 0 ? (
                  <div className="pt-6 pb-2 px-6">
                    <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-[var(--color-border)]">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full"></div>
                        <h4 className="text-lg font-semibold text-[var(--color-foreground)]" style={{ fontFamily: 'var(--font-accent)' }}>
                          Color Palette
                        </h4>
                      </div>
                      <div className="overflow-hidden">
                        <ColorSwatchesDisplay colors={colorSwatches[section.id]} />
                      </div>
                    </div>
                    
                    {/* Remaining markdown content */}
                    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                      {renderMarkdown(section.content)}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-5">
                    {/* Regular markdown content */}
                    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                      {renderMarkdown(section.content)}
                    </div>
                  </div>
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