import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchPaperContent } from './server/paperFetcher.ts';
import { analyzePaperWithGemini } from './server/geminiAnalyzer.ts';
import { ExamplePaper } from './src/types/research.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

// Curated list of benchmark academic papers for quick one-click testing
const EXAMPLE_PAPERS: ExamplePaper[] = [
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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Provide curated papers
app.get('/api/examples', (_req, res) => {
  res.json({ examples: EXAMPLE_PAPERS });
});

// Validate URL helper
function isValidPaperInput(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (trimmed.length < 5) return false;

  // Check if it's an arXiv ID or has http/https
  if (/^(?:arxiv:)?\d{4}\.\d{4,5}(?:v\d+)?$/i.test(trimmed)) return true;
  if (/^https?:\/\/.+/i.test(trimmed)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// POST /api/analyze-paper
app.post('/api/analyze-paper', async (req, res) => {
  const { url } = req.body;

  // 1. Validate empty / malformed input
  if (!url || typeof url !== 'string' || !url.trim()) {
    res.status(400).json({
      success: false,
      error: 'Please enter a valid research paper URL or arXiv identifier (e.g. https://arxiv.org/abs/1706.03762).'
    });
    return;
  }

  const cleanUrl = url.trim();

  if (!isValidPaperInput(cleanUrl)) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL format. Please provide a standard HTTP/HTTPS web address or an arXiv identifier (e.g. 1706.03762 or https://arxiv.org/abs/1706.03762).'
    });
    return;
  }

  try {
    // 2. Token-efficient paper fetching
    const paperData = await fetchPaperContent(cleanUrl);

    // 3. Check if paper retrieval totally failed
    if (paperData.retrievalStatus === 'unsupported_fallback') {
      res.status(422).json({
        success: false,
        error: 'Unable to retrieve paper content from the provided URL.',
        details: paperData.retrievalNotes || 'The destination server returned an error, is protected by anti-bot verification, or requires institutional login.',
        canRetryWithFallback: true,
        fallbackData: {
          url: cleanUrl,
          suggestedFormat: 'Try pasting an arXiv URL (e.g. https://arxiv.org/abs/...) or a Hugging Face Papers URL.'
        }
      });
      return;
    }

    // 4. Gemini structured analysis
    const analysis = await analyzePaperWithGemini(paperData);

    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      data: analysis
    });
  } catch (err: any) {
    console.warn('Handled API Error in /api/analyze-paper:', err?.message || err);

    res.setHeader('Content-Type', 'application/json');

    const errStr = String(err?.message || '');
    const isServiceUnavailable =
      errStr.includes('503') ||
      errStr.includes('UNAVAILABLE') ||
      errStr.includes('high demand') ||
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('quota') ||
      errStr.includes('500') ||
      errStr.includes('INTERNAL') ||
      err?.name === 'GeminiApiError' ||
      err?.isTransient;

    if (isServiceUnavailable) {
      // Use HTTP 200 with success: false to prevent Nginx proxy_intercept_errors
      // from intercepting 503/502/504 and serving an HTML warmup page
      res.status(200).json({
        success: false,
        error: 'Gemini AI Service Temporarily Saturated (High Demand)',
        details: err?.message || 'The Gemini AI model is currently experiencing high demand. Automatic retries with exponential backoff were executed, but the servers remain momentarily busy. Please wait a moment and click Retry Analysis.',
        errorType: 'API_UNAVAILABLE',
        canRetry: true
      });
      return;
    }

    res.status(200).json({
      success: false,
      error: err.message || 'An unexpected error occurred while analyzing the research paper.',
      details: 'Please check your connection and click Retry Analysis.',
      errorType: 'GENERAL_ERROR',
      canRetry: true
    });
  }
});

// Setup server and mount Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Research Paper Intelligence server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
