import React, { useState } from 'react';
import { FutureWorkOpportunity } from '../types/research.ts';
import { Rocket, Target, Wrench, Sparkles, TrendingUp, Layers, Check, Copy } from 'lucide-react';

interface Section3FutureWorkProps {
  opportunities: FutureWorkOpportunity[];
}

export const Section3FutureWork: React.FC<Section3FutureWorkProps> = ({ opportunities }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyProject = async (proj: FutureWorkOpportunity) => {
    const text = `PROJECT: ${proj.projectTitle}
Exact Technical Extension: ${proj.exactTechnicalExtension}
Part of Paper Extended: ${proj.paperPartModified}
Target Performance Metric: ${proj.targetPerformanceMetric}
Expected Improvement: ${proj.expectedImprovement}
Recommended Stack: ${proj.recommendedTechStack.join(', ')}
Technical Significance: ${proj.whyTechnicallyMeaningful}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(proj.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy project text:', err);
    }
  };

  return (
    <section id="student-opportunities" className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <span>Section 3</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Applied Research & Portfolios</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Future Work & Internship Opportunities
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Rocket className="w-3.5 h-3.5 text-purple-400" />
          <span>3 Undergraduate Implementable Extensions</span>
        </div>
      </div>

      <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
        High-impact, realistic extensions designed for a 3rd-year CS student aiming for top AI research labs, industry internships, or capstone theses. Each project specifies the architectural modification, target benchmark metric, and suggested technology stack.
      </p>

      {/* Grid of Exactly 3 Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {opportunities.map((proj, idx) => (
          <div
            key={proj.id || idx}
            className="rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 flex flex-col justify-between shadow-xl hover:border-indigo-500/40 transition-all duration-200 group"
          >
            <div className="space-y-5">
              {/* Card Header: Editorial Number and Copy Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider">
                  0{idx + 1}. EXTENSION PROJECT
                </span>
                <button
                  onClick={() => handleCopyProject(proj)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy project specification"
                >
                  {copiedId === proj.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Project Title */}
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                {proj.projectTitle}
              </h3>

              {/* Exact Technical Extension */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Exact Technical Extension</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {proj.exactTechnicalExtension}
                </p>
              </div>

              {/* Part of Paper Modified */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>Component Modified</span>
                </div>
                <p className="text-xs text-slate-300">
                  {proj.paperPartModified}
                </p>
              </div>

              {/* Metrics & Expected Improvement Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    <Target className="w-3 h-3" />
                    <span>Target Metric</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200">
                    {proj.targetPerformanceMetric}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Improvement</span>
                  </div>
                  <p className="text-xs text-emerald-300 font-medium">
                    {proj.expectedImprovement}
                  </p>
                </div>
              </div>

              {/* Recommended Tech Stack (Interactive / Functional tags) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
                  <Wrench className="w-3 h-3" />
                  <span>Recommended Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.recommendedTechStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-xs font-mono bg-slate-800/80 text-sky-200 rounded border border-slate-700/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Why Technically Meaningful */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed italic">
              <span className="font-semibold text-slate-300 not-italic">Internship Value: </span>
              {proj.whyTechnicallyMeaningful}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
