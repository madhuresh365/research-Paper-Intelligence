import React from 'react';
import { ArchitecturalFlowchart } from '../types/research.ts';
import { MermaidViewer } from './MermaidViewer.tsx';
import { GitCommit, ArrowRight, Database, Cpu, Send } from 'lucide-react';

interface Section2ArchitectureProps {
  data: ArchitecturalFlowchart;
}

export const Section2Architecture: React.FC<Section2ArchitectureProps> = ({ data }) => {
  return (
    <section id="architecture-flowchart" className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <span>Section 2</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Systems & Model Anatomy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Architectural Flowchart
          </h2>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Visual Graph</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
        This structural flowchart illustrates the complete computational pipeline described in the paper: raw inputs, data preprocessing stages, core neural layers and algorithms, internal state flow, and final inference outputs.
      </p>

      {/* Mermaid Visual Diagram Component */}
      <div className="w-full">
        <MermaidViewer code={data.mermaidCode} />
      </div>

      {/* Pipeline Stage Decomposition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Stage 1: System Inputs */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>1. System Inputs</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              {data.systemInputs && data.systemInputs.length > 0 ? (
                data.systemInputs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-mono mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Not clearly specified in available content.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Stage 2: Data Preprocessing */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>2. Preprocessing</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              {data.dataPreprocessing && data.dataPreprocessing.length > 0 ? (
                data.dataPreprocessing.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-mono mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Not clearly specified in available content.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Stage 3: Key Components & Layers */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>3. Core Layers</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              {data.keyComponents && data.keyComponents.length > 0 ? (
                data.keyComponents.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-mono mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Not clearly specified in available content.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Stage 4: System Outputs */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Send className="w-3.5 h-3.5" />
              <span>4. System Outputs</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              {data.systemOutputs && data.systemOutputs.length > 0 ? (
                data.systemOutputs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-mono mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Not clearly specified in available content.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
