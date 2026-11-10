/**
 * Paper Fetcher: Extracts academic paper text and metadata with token-efficient extraction.
 * Supports arXiv (API + ar5iv + abs), Hugging Face Papers, OpenReview, and general academic HTML.
 */

export interface FetchedPaperData {
  title: string;
  url: string;
  authors: string[];
  publicationDate?: string;
  venueOrCategory?: string;
  arxivId?: string;
  githubRepoUrl?: string;
  abstract: string;
  extractedSections: {
    introduction?: string;
    methodology?: string;
    conclusion?: string;
    keyPoints?: string;
  };
  retrievalSource: string;
  retrievalStatus: 'full' | 'abstract_only' | 'unsupported_fallback';
  retrievalNotes?: string;
}

// Helper to extract arXiv ID from any arXiv URL or raw string
export function extractArxivId(input: string): string | null {
  const trimmed = input.trim();
  // Matches e.g. 1706.03762 or 1706.03762v5 or math/0303109 or cs/0601001
  const urlPatterns = [
    /arxiv\.org\/(?:abs|pdf|html|format)\/([a-zA-Z\-]+(?:\.[a-zA-Z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i,
    /ar5iv\.labs\.arxiv\.org\/html\/([a-zA-Z\-]+(?:\.[a-zA-Z\-]+)?\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i,
    /huggingface\.co\/papers\/(\d{4}\.\d{4,5})/i,
    /(?:arxiv:)?(\d{4}\.\d{4,5}(?:v\d+)?)/i,
  ];

  for (const regex of urlPatterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1].replace(/\.pdf$/i, '');
    }
  }
  return null;
}

// Clean HTML tags and entities
function cleanHtml(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to limit text to token-efficient length (approx words)
function limitWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '... [truncated for token efficiency]';
}

// Fetch from official arXiv Export API
async function fetchArxivApi(arxivId: string, originalUrl: string): Promise<FetchedPaperData | null> {
  try {
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ResearchPaperIntelligence/1.0 (academic analysis; mailto:madhuresh.3635@gmail.com)'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const xml = await res.text();

    if (!xml.includes('<entry>') || xml.includes('<title>Error</title>')) {
      return null;
    }

    // Extract title
    const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Unknown Paper Title';

    // Extract abstract / summary
    const summaryMatch = xml.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/i);
    const abstract = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract authors
    const authorMatches = [...xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)];
    const authors = authorMatches.map(m => m[1].trim()).slice(0, 10);

    // Published date
    const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/i);
    const publicationDate = publishedMatch ? publishedMatch[1].trim().split('T')[0] : undefined;

    // Category
    const categoryMatch = xml.match(/<arxiv:primary_category[^>]*term="([^"]+)"/i);
    const venueOrCategory = categoryMatch ? `arXiv:${categoryMatch[1]}` : 'arXiv Pre-print';

    // Comments / Github Repo
    const commentMatch = xml.match(/<arxiv:comment>([\s\S]*?)<\/arxiv:comment>/i);
    let githubRepoUrl: string | undefined;
    if (commentMatch) {
      const ghMatch = commentMatch[1].match(/https?:\/\/github\.com\/[a-zA-Z0-9_\-\.\/]+/i);
      if (ghMatch) githubRepoUrl = ghMatch[0];
    }

    // Now try to fetch the HTML version from ar5iv to retrieve Introduction & Methodology
    let extractedSections: FetchedPaperData['extractedSections'] = {};
    let status: FetchedPaperData['retrievalStatus'] = 'abstract_only';

    try {
      const ar5ivUrl = `https://ar5iv.labs.arxiv.org/html/${arxivId}`;
      const ar5ivCtrl = new AbortController();
      const ar5ivTimeout = setTimeout(() => ar5ivCtrl.abort(), 8000);
      const ar5ivRes = await fetch(ar5ivUrl, {
        signal: ar5ivCtrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(ar5ivTimeout);

      if (ar5ivRes.ok) {
        const ar5ivHtml = await ar5ivRes.text();
        
        // Find GitHub repo in full paper if not found yet
        if (!githubRepoUrl) {
          const ghMatch = ar5ivHtml.match(/https?:\/\/github\.com\/[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+/i);
          if (ghMatch) githubRepoUrl = ghMatch[0];
        }

        // Try extracting Introduction
        const introMatch = ar5ivHtml.match(/<section[^>]*id="[^"]*intro[^"]*"[^>]*>([\s\S]*?)<\/section>/i) 
          || ar5ivHtml.match(/<h\d[^>]*>(?:1\.?\s*)?Introduction<\/h\d>([\s\S]*?)(?=<h\d|$)/i);
        if (introMatch) {
          extractedSections.introduction = limitWords(cleanHtml(introMatch[1]), 500);
        }

        // Try extracting Methodology / Architecture / Model
        const methodMatch = ar5ivHtml.match(/<section[^>]*id="[^"]*(?:method|model|architect|approach)[^"]*"[^>]*>([\s\S]*?)<\/section>/i)
          || ar5ivHtml.match(/<h\d[^>]*>(?:[234]\.?\s*)?(?:Model|Architecture|Method|Approach|The Proposed Method)[\s\S]*?<\/h\d>([\s\S]*?)(?=<h\d|$)/i);
        if (methodMatch) {
          extractedSections.methodology = limitWords(cleanHtml(methodMatch[1]), 800);
        }

        // Try extracting Conclusion
        const conclusionMatch = ar5ivHtml.match(/<section[^>]*id="[^"]*conclu[^"]*"[^>]*>([\s\S]*?)<\/section>/i)
          || ar5ivHtml.match(/<h\d[^>]*>(?:\d\.?\s*)?(?:Conclusion|Discussion and Conclusion)[\s\S]*?<\/h\d>([\s\S]*?)(?=<h\d|$)/i);
        if (conclusionMatch) {
          extractedSections.conclusion = limitWords(cleanHtml(conclusionMatch[1]), 350);
        }

        if (extractedSections.introduction || extractedSections.methodology) {
          status = 'full';
        }
      }
    } catch {
      // ar5iv fetch is best-effort; fallback to official abstract
    }

    return {
      title: rawTitle,
      url: originalUrl.startsWith('http') ? originalUrl : `https://arxiv.org/abs/${arxivId}`,
      authors,
      publicationDate,
      venueOrCategory,
      arxivId,
      githubRepoUrl,
      abstract: limitWords(abstract, 600),
      extractedSections,
      retrievalSource: status === 'full' ? 'arXiv API & ar5iv HTML' : 'arXiv Official API',
      retrievalStatus: status,
      retrievalNotes: status === 'full' 
        ? 'Full sections (Abstract, Intro, Methodology, Conclusion) retrieved successfully.'
        : 'Official peer-reviewed pre-print abstract and metadata retrieved from arXiv.'
    };
  } catch (err: any) {
    console.warn('Notice fetching from arXiv API:', err.message);
    return null;
  }
}

// Fetch generic Academic URL or OpenReview
async function fetchAcademicWebPage(url: string): Promise<FetchedPaperData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
      // Direct PDF URL without arXiv identifier
      return {
        title: url.split('/').pop()?.replace('.pdf', '').replace(/[-_]/g, ' ') || 'Academic Paper PDF',
        url,
        authors: ['Specified in PDF'],
        abstract: 'Direct PDF document reached. Academic content will be parsed based on document reference.',
        extractedSections: {},
        retrievalSource: 'Direct PDF Link',
        retrievalStatus: 'abstract_only',
        retrievalNotes: 'Direct PDF URL detected. Metadata extracted from endpoint header.'
      };
    }

    const html = await res.text();

    // 1. Title extraction
    let title = '';
    const citationTitleMatch = html.match(/<meta[^>]*name=["']citation_title["'][^>]*content=["']([^"']+)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const htmlTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (citationTitleMatch) {
      title = citationTitleMatch[1];
    } else if (ogTitleMatch) {
      title = ogTitleMatch[1];
    } else if (htmlTitleMatch) {
      title = htmlTitleMatch[1].replace(/\|.*$/, '').replace(/-.*$/, '').trim();
    }

    // 2. Abstract extraction
    let abstract = '';
    const citationAbstractMatch = html.match(/<meta[^>]*name=["'](?:citation_abstract|dc\.description|description)["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

    if (citationAbstractMatch) {
      abstract = citationAbstractMatch[1];
    } else if (ogDescMatch) {
      abstract = ogDescMatch[1];
    }

    // Fallback: look for <div class="abstract"> or <section id="abstract">
    if (!abstract || abstract.length < 50) {
      const sectionAbstractMatch = html.match(/<(?:div|section|p)[^>]*(?:class|id)=["'][^"']*abstract[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|p)>/i);
      if (sectionAbstractMatch) {
        abstract = cleanHtml(sectionAbstractMatch[1]);
      }
    }

    // 3. Authors extraction
    const authors: string[] = [];
    const authorMatches = [...html.matchAll(/<meta[^>]*name=["']citation_author["'][^>]*content=["']([^"']+)["']/gi)];
    for (const m of authorMatches) {
      if (m[1] && !authors.includes(m[1].trim())) {
        authors.push(m[1].trim());
      }
    }

    // 4. GitHub link extraction
    let githubRepoUrl: string | undefined;
    const ghMatch = html.match(/https?:\/\/github\.com\/[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+/i);
    if (ghMatch) githubRepoUrl = ghMatch[0];

    // 5. Venue or Date
    const dateMatch = html.match(/<meta[^>]*name=["']citation_publication_date["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*name=["']citation_date["'][^>]*content=["']([^"']+)["']/i);
    const publicationDate = dateMatch ? dateMatch[1].trim() : undefined;

    const journalMatch = html.match(/<meta[^>]*name=["']citation_journal_title["'][^>]*content=["']([^"']+)["']/i);
    const venueOrCategory = journalMatch ? journalMatch[1].trim() : 'Academic Repository';

    if (!title && !abstract) {
      return null;
    }

    return {
      title: title || 'Academic Research Publication',
      url,
      authors: authors.length > 0 ? authors.slice(0, 10) : ['Not clearly specified in available metadata.'],
      publicationDate,
      venueOrCategory,
      githubRepoUrl,
      abstract: limitWords(abstract || 'Full text or abstract restricted by provider access.', 600),
      extractedSections: {},
      retrievalSource: 'Web Scraper & Meta Parser',
      retrievalStatus: abstract ? 'abstract_only' : 'unsupported_fallback',
      retrievalNotes: abstract 
        ? 'Successfully parsed paper abstract and metadata from publication web page.' 
        : 'Page reached, but full academic text is behind a paywall or login.'
    };
  } catch (err: any) {
    console.warn('Notice fetching academic web page:', err.message);
    return null;
  }
}

// Master function to fetch paper content
export async function fetchPaperContent(rawUrl: string): Promise<FetchedPaperData> {
  const url = rawUrl.trim();
  const arxivId = extractArxivId(url);

  if (arxivId) {
    const arxivResult = await fetchArxivApi(arxivId, url);
    if (arxivResult) {
      return arxivResult;
    }
  }

  // If not arXiv or arXiv failed, try generic web scraping
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const webResult = await fetchAcademicWebPage(url);
    if (webResult) {
      return webResult;
    }
  }

  // Graceful fallback when paper cannot be directly fetched
  return {
    title: 'Research Paper at ' + (url.length > 50 ? url.substring(0, 47) + '...' : url),
    url,
    authors: ['Not clearly specified in the available paper content.'],
    abstract: 'Not clearly specified in the available paper content. The destination URL could not be accessed directly due to network restrictions, paywall, or non-HTML format.',
    extractedSections: {},
    retrievalSource: 'Fallback Provider',
    retrievalStatus: 'unsupported_fallback',
    retrievalNotes: 'Paper content could not be directly retrieved from the supplied URL. Please check the link or try an open-access arXiv or Hugging Face paper URL.'
  };
}
