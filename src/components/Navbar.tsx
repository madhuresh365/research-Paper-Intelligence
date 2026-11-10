import React from 'react';
import { BookOpen, Sparkles, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onNewAnalysis?: () => void;
  showNewAnalysisButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAnalysis,
  showNewAnalysisButton = false,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              if (onNewAnalysis) {
                e.preventDefault();
                onNewAnalysis();
              }
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            Research Paper Intelligence
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
          <a href="#core-concept" className="hover:text-slate-200 transition-colors">
            Core Concepts
          </a>
          <a href="#architecture-flowchart" className="hover:text-slate-200 transition-colors">
            Architecture Diagram
          </a>
          <a href="#student-opportunities" className="hover:text-slate-200 transition-colors">
            Student Projects
          </a>
          <a href="#examples" className="hover:text-slate-200 transition-colors">
            Benchmark Papers
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          {showNewAnalysisButton ? (
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300/80 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">CS Student Technical Breakdown</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
