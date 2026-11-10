import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { PaperHeader } from './components/PaperHeader.tsx';
import { Section1CoreConcept } from './components/Section1CoreConcept.tsx';
import { Section2Architecture } from './components/Section2Architecture.tsx';
import { Section3FutureWork } from './components/Section3FutureWork.tsx';
import { LoadingState } from './components/LoadingState.tsx';
import { ResearchPaperAnalysis, ExamplePaper } from './types/research.ts';
import {
  Search,
  ArrowRight,
  Sparkles,
  AlertCircle,
  BookOpen,
  FileCheck2,
  ExternalLink,
  Info,
  Clock,
  CheckCircle,
  HelpCircle,
  Download,
  FileText,
  RotateCcw,
} from 'lucide-react';

const FALLBACK_EXAMPLES: ExamplePaper[] = [
  {
    title: "Attention Is All You Need",
    category: "Transformer Architecture",
    year: "2017",
    url: "https://arxiv.org/abs/1706.03762",
    description: "Introduced the foundational multi-head self-attention transformer architecture, replacing recurrence entirely."
  },
  {
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    category: "Parameter-Efficient Fine-Tuning",
    year: "2021",
    url: "https://arxiv.org/abs/2106.09685",
    description: "Freezes pre-trained model weights and injects trainable rank decomposition matrices, slashing trainable parameters by 10,000x."
  },
  {
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    category: "Systems & GPU Optimization",
    year: "2022",
    url: "https://arxiv.org/abs/2205.14135",
    description: "Pioneered tiling and recomputation to eliminate memory bandwidth bottlenecks in GPU SRAM."
  },
  {
    title: "Direct Preference Optimization (DPO): Your Language Model is Secretly a Reward Model",
    category: "Reinforcement Learning & Alignment",
    year: "2023",
    url: "https://arxiv.org/abs/2305.18290",
    description: "Replaces traditional RLHF reward model training with an exact closed-form objective directly on human preferences."
  }
];

export default function App() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
    errorType?: 'API_UNAVAILABLE' | 'RETRIEVAL_ERROR' | 'VALIDATION_ERROR' | 'GENERAL_ERROR';
    canRetry?: boolean;
    canRetryWithFallback?: boolean;
  } | null>(null);
  const [analysis, setAnalysis] = useState<ResearchPaperAnalysis | null>(null);
  const [examples, setExamples] = useState<ExamplePaper[]>(FALLBACK_EXAMPLES);
  const [recentAnalyses, setRecentAnalyses] = useState<ResearchPaperAnalysis[]>([]);

  // Fetch benchmark examples from server on mount
  useEffect(() => {
    fetch('/api/examples')
      .then(res => res.json())
      .then(data => {
        if (data.examples && Array.isArray(data.examples) && data.examples.length > 0) {
          setExamples(data.examples);
        }
      })
      .catch(() => {
        // Keep fallback examples
      });
  }, []);

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = (urlToAnalyze || urlInput).trim();

    // 1. Client validation for empty input
    if (!targetUrl) {
      setError({
        message: 'Please provide a paper URL or arXiv identifier.',
        details: 'You can paste an arXiv link (e.g. https://arxiv.org/abs/1706.03762) or select a benchmark paper below.',
        errorType: 'VALIDATION_ERROR'
      });
      return;
    }

    // 2. Validate URL format
    const isValidFormat =
      /^(?:arxiv:)?\d{4}\.\d{4,5}(?:v\d+)?$/i.test(targetUrl) ||
      /^https?:\/\/.+/i.test(targetUrl);

    if (!isValidFormat) {
      setError({
        message: 'Invalid URL format.',
        details: 'Please enter a valid HTTP/HTTPS web address or an arXiv ID (such as 1706.03762 or https://arxiv.org/abs/1706.03762).',
        errorType: 'VALIDATION_ERROR'
      });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const contentType = response.headers.get('content-type') || '';
      let result: any = null;

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const textContent = await response.text();
        const isWarmup = textContent.includes('Starting Server') || textContent.includes('warmup');
        setError({
          message: isWarmup
            ? 'Backend Server Warming Up'
            : 'Server communication disruption.',
          details: isWarmup
            ? 'The backend server is starting up. Please click "Retry Analysis" in a few seconds.'
            : 'Received an unexpected response from the network proxy. Please click "Retry Analysis".',
          errorType: 'GENERAL_ERROR',
          canRetry: true
        });
        setLoading(false);
        return;
      }

      if (!response.ok || !result.success) {
        const isApiUnavailable =
          response.status === 503 ||
          result.errorType === 'API_UNAVAILABLE' ||
          String(result.error || '').includes('503') ||
          String(result.error || '').includes('high demand') ||
          String(result.error || '').includes('Unavailable') ||
          String(result.error || '').includes('Saturated');

        setError({
          message: isApiUnavailable
            ? 'Gemini AI Service Temporarily Saturated (503 High Demand)'
            : result.error || 'Failed to analyze paper.',
          details: isApiUnavailable
            ? (result.details || 'The Gemini AI model is currently handling an exceptionally high volume of global requests. All 3 automatic retry attempts with exponential backoff were executed, but compute nodes remain busy. Your paper link was retrieved successfully—simply click "Retry Analysis" below in a few moments.')
            : (result.details || 'Unable to complete the analysis. Please check the provided paper URL.'),
          errorType: isApiUnavailable ? 'API_UNAVAILABLE' : (result.errorType || 'GENERAL_ERROR'),
          canRetry: true,
          canRetryWithFallback: result.canRetryWithFallback
        });
        setLoading(false);
        return;
      }

      setAnalysis(result.data);
      // Save to recent analyses
      setRecentAnalyses(prev => {
        const filtered = prev.filter(p => p.metadata.url !== result.data.metadata.url);
        return [result.data, ...filtered].slice(0, 5);
      });
      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError({
        message: 'Network or server communication disruption.',
        details: err?.message || 'Unable to connect to the analysis engine backend. Please check your connection and click Retry.',
        errorType: 'GENERAL_ERROR',
        canRetry: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (exUrl: string) => {
    setUrlInput(exUrl);
    handleAnalyze(exUrl);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setError(null);
    setUrlInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Top Bar */}
      <Navbar
        onNewAnalysis={handleNewAnalysis}
        showNewAnalysisButton={!!analysis}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* If analysis is active and not loading, show the full Analysis Dashboard */}
        {analysis && !loading ? (
          <div className="space-y-12">
            {/* Paper Information Header */}
            <PaperHeader
              metadata={analysis.metadata}
              analysis={analysis}
              onNewAnalysis={handleNewAnalysis}
            />

            {/* Section 1: Core Concept Extraction */}
            <Section1CoreConcept data={analysis.coreConcept} />

            {/* Section 2: Architectural Flowchart */}
            <Section2Architecture data={analysis.architecture} />

            {/* Section 3: Future Work & Internship Opportunities */}
            <Section3FutureWork opportunities={analysis.futureWorkOpportunities} />

            {/* Bottom Actions Bar */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Analysis completed · Evaluated for 3rd-year CS student comprehension
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    import('./utils/exportHelpers.ts').then(m => m.downloadJsonReport(analysis));
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download structured JSON report"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => {
                    import('./utils/exportHelpers.ts').then(m => m.downloadTxtReport(analysis));
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download readable TXT report"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download TXT</span>
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Analyze Another Paper
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Multi-Stage Loading Indicator */
          <LoadingState paperUrl={urlInput} />
        ) : (
          /* Homepage: Hero, Large Input Field, Benchmark Cards, Empty States */
          <div className="space-y-14 max-w-4xl mx-auto">
            {/* Hero Header */}
            <div className="text-center space-y-4 pt-4 sm:pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Undergraduate CS Technical Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
                Research Paper Intelligence
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
                Transform academic research publications into clear, accessible technical breakdowns, interactive Mermaid architecture flowcharts, and realistic student extension projects.
              </p>
            </div>

            {/* Large Input Card */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-900/50 p-6 sm:p-8 shadow-2xl space-y-4 relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyze();
                }}
                className="space-y-4"
              >
                <label
                  htmlFor="paper-url"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Research Paper URL or arXiv Identifier
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      id="paper-url"
                      type="text"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="https://arxiv.org/abs/1706.03762 (e.g. Attention Is All You Need)"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <span>Analyze Paper</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Small explanation note */}
                <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    The application retrieves and parses the paper, then generates an accessible 300-word technical summary, a Mermaid.js architectural flowchart (<code className="text-indigo-300 font-mono">graph TD</code>), and 3 concrete undergraduate extension opportunities.
                  </p>
                </div>
              </form>

              {/* Error Alert Display */}
              {error && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs sm:text-sm space-y-2 flex items-start gap-3 transition-all ${
                    error.errorType === 'API_UNAVAILABLE'
                      ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      error.errorType === 'API_UNAVAILABLE' ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p
                        className={`font-semibold ${
                          error.errorType === 'API_UNAVAILABLE' ? 'text-amber-300' : 'text-rose-300'
                        }`}
                      >
                        {error.message}
                      </p>
                      {error.errorType === 'API_UNAVAILABLE' && (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Automatic retries exhausted
                        </span>
                      )}
                    </div>

                    {error.details && (
                      <p
                        className={`leading-relaxed text-xs ${
                          error.errorType === 'API_UNAVAILABLE'
                            ? 'text-amber-200/90'
                            : 'text-rose-200/80'
                        }`}
                      >
                        {error.details}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {/* Retry Analysis Button */}
                      {(error.canRetry || error.errorType === 'API_UNAVAILABLE') && (
                        <button
                          type="button"
                          onClick={() => handleAnalyze()}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm ${
                            error.errorType === 'API_UNAVAILABLE'
                              ? 'bg-amber-600 hover:bg-amber-500 text-white font-semibold'
                              : 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Analysis</span>
                        </button>
                      )}

                      {/* Only show paper fallback suggestion if this is NOT an API server unavailability error */}
                      {error.errorType !== 'API_UNAVAILABLE' && error.canRetryWithFallback && (
                        <button
                          type="button"
                          onClick={() => handleSelectExample(FALLBACK_EXAMPLES[0].url)}
                          className="inline-flex items-center gap-1 font-medium text-xs text-indigo-300 hover:text-white underline underline-offset-2"
                        >
                          Try benchmark paper: Attention Is All You Need &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Benchmark Papers Section */}
            <div className="space-y-4" id="examples">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Quick Benchmark Papers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a foundational AI paper to test the analysis engine with 1 click
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400">
                  {examples.length} Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examples.map((paper, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectExample(paper.url)}
                    className="text-left p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all duration-200 group flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span className="text-indigo-400 font-semibold">{paper.category}</span>
                        <span>{paper.year}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {paper.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono text-slate-500 group-hover:text-indigo-300 transition-colors">
                      <span className="truncate max-w-[200px]">{paper.url.replace('https://', '')}</span>
                      <span className="font-semibold text-indigo-400 flex items-center gap-1">
                        Analyze &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Analyses in this session */}
            {recentAnalyses.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session History ({recentAnalyses.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentAnalyses.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => setAnalysis(rec)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      <span className="truncate max-w-[220px]">{rec.metadata.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Section 1</span>
                </div>
                <h3 className="text-sm font-bold text-white">Undergrad-Level Synthesis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  300-word targeted breakdown of the root problem, primary algorithmic technique, and mathematical breakthroughs.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                  <ExternalLink className="w-4 h-4" />
                  <span>Section 2</span>
                </div>
                <h3 className="text-sm font-bold text-white">Mermaid.js Flowchart</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive <code className="font-mono text-sky-300">graph TD</code> diagram depicting system inputs, layers, algorithms, and tensor flow.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Section 3</span>
                </div>
                <h3 className="text-sm font-bold text-white">Extension Projects</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  3 realistic, implementable project proposals with target benchmark metrics and recommended technology stacks.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Research Paper Intelligence · Academic Technical Analysis Engine</span>
          <span className="font-mono text-slate-600">Built for Computer Science Students & Researchers</span>
        </div>
      </footer>
    </div>
  );
}
