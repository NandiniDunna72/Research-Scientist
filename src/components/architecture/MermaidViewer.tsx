import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Code, 
  Check, 
  Copy, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MermaidViewerProps {
  source: string;
  title?: string;
  className?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  source,
  title,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [showSource, setShowSource] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 15,
      },
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!source) {
        setSvgContent('');
        return;
      }

      setError(null);
      try {
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, source);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render failure:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram syntax.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [source]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setZoom(1);

  const handleCopySource = () => {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-background p-4' : ''
      } ${className}`}
    >
      {/* Top Diagram Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title || 'Mermaid Architecture Flowchart'}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 w-8 p-0"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            variant={showSource ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowSource(!showSource)}
            className="h-8 text-xs gap-1.5 px-2.5"
            title="View or Hide Mermaid Source"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSource ? 'Hide Code' : 'View Code'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopySource}
            className="h-8 text-xs gap-1.5 px-2.5"
            title="Copy Mermaid Syntax"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mermaid Source Code Drawer */}
      {showSource && (
        <div className="border-b border-border bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-56">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span>Mermaid Definition (flowchart TD)</span>
            <button
              onClick={handleCopySource}
              className="text-xs hover:text-white transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Source'}
            </button>
          </div>
          <pre className="whitespace-pre leading-relaxed">{source}</pre>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[440px] max-h-[620px] overflow-auto p-6 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-center transition-all select-none"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Diagram Syntax Warning
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {error}
            </p>
            <div className="w-full text-left bg-muted p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36">
              <pre>{source}</pre>
            </div>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="flex items-center justify-center w-full min-w-max"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
