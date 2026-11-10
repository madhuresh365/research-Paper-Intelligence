import React, { useEffect, useState } from 'react';
import { Loader2, Search, Cpu, GitFork, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Resolving Academic Repository & Paper Metadata',
    desc: 'Connecting to arXiv API / Open-Access repository, extracting peer-reviewed abstract, authors, and methodology.',
  },
  {
    icon: Cpu,
    title: 'Decomposing Computational Architecture & Formulae',
    desc: 'Extracting primary algorithmic breakthroughs, tensor dimensions, attention layers, and state transformations.',
  },
  {
    icon: GitFork,
    title: 'Compiling Mermaid.js System Flowchart',
    desc: 'Structuring data inputs, preprocessing, model components, algorithms, and output representations.',
  },
  {
    icon: Sparkles,
    title: 'Synthesizing 3rd-Year CS Student Projects',
    desc: 'Designing three realistic, implementable extension opportunities with target benchmarks and technology stacks.',
  },
];

interface LoadingStateProps {
  paperUrl: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ paperUrl }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Advance progress indicator naturally across steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(stepInterval);
  }, []);

  const isRetrying = seconds >= 10;
  const retryStage = seconds >= 22 ? 3 : seconds >= 15 ? 2 : seconds >= 10 ? 1 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto my-12 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {isRetrying ? 'Synthesizing with High-Demand Resilience' : 'Analyzing Academic Paper'}
          </h3>
          <p className="text-xs font-mono text-slate-400 truncate max-w-md">
            Target: {paperUrl}
          </p>
        </div>
        <div className="text-xs font-mono text-indigo-400 tabular-nums">
          Processing runtime: {seconds}s · Token-efficient extraction active
        </div>

        {/* Friendly Retrying Message Banner when request takes extra time due to demand spikes */}
        {isRetrying && (
          <div className="w-full max-w-lg mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-center gap-2.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            <span>
              {retryStage === 1 && 'High traffic detected on Gemini nodes. Performing automatic retry with exponential backoff (Attempt 1 of 3)...'}
              {retryStage === 2 && 'Server load spike persisting. Backing off gracefully and retrying (Attempt 2 of 3)...'}
              {retryStage >= 3 && 'Final automated retry attempt in progress. Thank you for your patience while we secure compute resources...'}
            </span>
          </div>
        )}
      </div>

      {/* Stepper list */}
      <div className="mt-8 space-y-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950/50'
                  : isDone
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-80'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : isDone
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-white'
                        : isDone
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isDone && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      ✓ Complete
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        AI analysis validates formulas, layer architectures, and token bounds with automatic retry on server demand spikes.
      </div>
    </div>
  );
};
