import React, { useState } from 'react';
import { PaperMetadata, ResearchPaperAnalysis } from '../types/research.ts';
import { ExternalLink, Github, Copy, Check, Download, FileText, RotateCcw, Calendar, Users, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { downloadJsonReport, downloadTxtReport, generateTextReport } from '../utils/exportHelpers.ts';

interface PaperHeaderProps {
  metadata: PaperMetadata;
  analysis: ResearchPaperAnalysis;
  onNewAnalysis: () => void;
}

export const PaperHeader: React.FC<PaperHeaderProps> = ({
  metadata,
  analysis,
  onNewAnalysis,
}) => {
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedResearch, setCopiedResearch] = useState<boolean>(false);

  const handleCopyResearch = async () => {
    try {
      const fullText = generateTextReport(analysis);
      await navigator.clipboard.writeText(fullText);
      setCopiedResearch(true);
      setTimeout(() => setCopiedResearch(false), 2000);
    } catch (err) {
      console.error('Failed to copy research text:', err);
    }
  };

  const handleCopyReport = async () => {
    try {
      const fullText = generateTextReport(analysis);
      await navigator.clipboard.writeText(fullText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const handleDownloadJson = () => {
    downloadJsonReport(analysis);
  };

  const handleDownloadTxt = () => {
    downloadTxtReport(analysis);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Meta Line: Clean unboxed metadata with typographic separators */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{metadata.retrievalSource}</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            {metadata.venueOrCategory && (
              <>
                <span className="flex items-center gap-1 text-slate-300">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>{metadata.venueOrCategory}</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
              </>
            )}
            {metadata.publicationDate && (
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Published {metadata.publicationDate}</span>
              </span>
            )}
          </div>

          {/* Action buttons toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Research */}
            <button
              onClick={handleCopyResearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 text-xs border border-indigo-700/60 transition-colors shadow-sm cursor-pointer"
              title="Copy complete 11-section research analysis to clipboard"
            >
              {copiedResearch ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied Research!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium">Copy Research</span>
                </>
              )}
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Download structured JSON report (includes all 11 research sections)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download JSON</span>
            </button>

            {/* Download TXT */}
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Download formatted TXT report (includes all 11 research sections)"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Download TXT</span>
            </button>

            {/* Copy Report */}
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Copy complete analysis report"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            {/* New Analysis */}
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Paper Title */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
            {metadata.title}
          </h1>

          {/* Authors */}
          {metadata.authors && metadata.authors.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-400">
              <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{metadata.authors.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Paper Source & Links Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-300 transition-colors max-w-xl truncate"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{metadata.url}</span>
          </a>

          {metadata.githubRepoUrl && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <a
                href={metadata.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Source Implementation</span>
              </a>
            </>
          )}

          {metadata.arxivId && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">arXiv:{metadata.arxivId}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
