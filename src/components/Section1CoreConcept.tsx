import React, { useState } from 'react';
import { CoreConceptExtraction } from '../types/research.ts';
import { Copy, Check, FileText, CheckCircle2, Lightbulb, Compass, Award } from 'lucide-react';

interface Section1CoreConceptProps {
  data: CoreConceptExtraction;
}

export const Section1CoreConcept: React.FC<Section1CoreConceptProps> = ({ data }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(data.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <section id="core-concept" className="w-full space-y-6">
      {/* Section Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <span>Section 1</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Technical Synthesis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Core Concept Extraction
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums font-mono">
            {data.wordCount} / 300 words
          </span>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 300-word Plain Language Summary Callout */}
      <div className="rounded-xl border border-indigo-950/60 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-1">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">
              Accessible Technical Overview
            </h3>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Analytical Pillars: Problem, Methodology, Breakthroughs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Column 1: Problem Being Solved */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Compass className="w-4 h-4" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Problem Being Solved</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.problemSolved}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Root CS Challenge
          </div>
        </div>

        {/* Column 2: Primary Methodology */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Primary Methodology</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.primaryMethodology}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Algorithmic Paradigm
          </div>
        </div>

        {/* Column 3: Mathematical & Algorithmic Breakthroughs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Award className="w-4 h-4" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Breakthroughs & Formulas</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {data.mathematicalOrAlgorithmicBreakthroughs && data.mathematicalOrAlgorithmicBreakthroughs.length > 0 ? (
                data.mathematicalOrAlgorithmicBreakthroughs.map((breakthrough, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                    <span className="leading-snug">{breakthrough}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 text-xs italic">
                  Not clearly specified in the available paper content.
                </li>
              )}
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Mathematical Novelty
          </div>
        </div>
      </div>

      {/* 3rd Year CS Student Key Takeaway Banner */}
      {data.csStudentKeyTakeaway && (
        <div className="p-4 sm:p-5 rounded-xl border border-purple-900/40 bg-purple-950/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              3rd-Year CS Student Insight
            </h4>
            <p className="text-sm text-purple-100/90 leading-relaxed">
              {data.csStudentKeyTakeaway}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
