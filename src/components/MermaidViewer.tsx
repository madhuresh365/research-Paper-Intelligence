import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, Code2, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface MermaidViewerProps {
  code: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  // Initialize mermaid configuration once
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          background: '#090d16',
          primaryColor: '#1e1b4b',
          primaryTextColor: '#e0e7ff',
          primaryBorderColor: '#6366f1',
          lineColor: '#818cf8',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a',
          edgeLabelBackground: '#0f172a',
          clusterBkg: '#0d1322',
          clusterBorder: '#3730a3',
          nodeBorder: '#4f46e5'
        },
        securityLevel: 'loose',
        suppressErrorRendering: true,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });
    } catch (e) {
      console.warn('Mermaid init notice:', e);
    }
  }, []);

  // Render diagram whenever code changes
  useEffect(() => {
    let isMounted = true;
    setRenderError(null);

    const renderDiagram = async () => {
      if (!code) return;

      const uniqueId = `m_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      try {
        // Clean any possible extra markdown
        const cleanedCode = code
          .replace(/^```(?:mermaid)?/i, '')
          .replace(/```$/, '')
          .trim();

        const { svg } = await mermaid.render(uniqueId, cleanedCode);
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError(err?.message || 'Failed to parse Mermaid diagram syntax.');
          setSvgContent('');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Clean up any rogue elements mermaid adds to document.body
      const rogue = document.querySelectorAll(`[id^="dmermaid-"]`);
      rogue.forEach(el => el.remove());
    };
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Mermaid.js Architecture Graph</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">graph TD</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
            <button
              onClick={handleZoomOut}
              title="Zoom out"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom in"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset zoom"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Mermaid Code */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              showCode
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCode ? 'Hide Code' : 'View Mermaid Code'}</span>
          </button>

          {/* Copy Mermaid Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Drawer (if toggled) */}
      {showCode && (
        <div className="border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Raw Mermaid.js Flowchart Source</span>
            <span className="font-mono">Ready to paste into Mermaid Live Editor or Markdown</span>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-indigo-200 overflow-x-auto selection:bg-indigo-500/40">
            <code>{code}</code>
          </pre>
        </div>
      )}

      {/* Visual Render Canvas */}
      <div className="relative min-h-[360px] p-6 bg-[#080d1a] overflow-x-auto flex items-center justify-center">
        {renderError ? (
          <div className="max-w-lg p-5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-sm space-y-3">
            <div className="flex items-center gap-2 font-medium text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Diagram Rendering Notice</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              The Mermaid diagram had a minor syntax variant that prevented visual compilation in the browser. You can inspect the valid flow structure directly in the source code.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowCode(true)}
                className="px-3 py-1.5 text-xs font-medium bg-amber-900/60 hover:bg-amber-900 border border-amber-700 text-amber-100 rounded-lg transition-colors"
              >
                Inspect Mermaid Code
              </button>
            </div>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center transition-transform duration-150 origin-center"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Compiling architecture diagram...</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Includes system inputs, preprocessing, layers, algorithms, and output representations.</span>
        <span>Use zoom controls or scroll to pan</span>
      </div>
    </div>
  );
};
