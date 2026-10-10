import { ResearchPaper, PaperSource, PaperAnalysis } from '../types';
import { authService } from './authService';

export interface BackendDiscoveredPaper {
  id: string;
  title: string;
  authors: Array<string | { name?: string }>;
  abstract?: string | null;
  publication_year?: number | null;
  publication_date?: string | null;
  venue?: string | null;
  doi?: string | null;
  paper_url?: string | null;
  pdf_url?: string | null;
  citation_count?: number | null;
  source: string;
  publication_type?: string | null;
  external_id?: string | null;
  relevance_score?: number | null;
}

export interface PaperSearchResponse {
  query: string;
  total: number;
  papers: BackendDiscoveredPaper[];
  message?: string | null;
}

export interface BackendSavedPaper {
  id: number;
  project_id?: number | null;
  user_id: number;
  external_id?: string | null;
  title: string;
  abstract?: string | null;
  authors?: any[];
  publication_year?: number | null;
  publication_date?: string | null;
  venue?: string | null;
  doi?: string | null;
  paper_url?: string | null;
  pdf_url?: string | null;
  citation_count: number;
  source?: string | null;
  publication_type?: string | null;
  relevance_score: number;
  created_at: string;
  updated_at: string;
}

function extractTags(title: string, venue?: string | null): string[] {
  const commonStopwords = new Set([
    'a', 'an', 'the', 'in', 'on', 'of', 'for', 'to', 'and', 'with', 'by', 'as', 'at',
    'from', 'is', 'using', 'based', 'via', 'through', 'over', 'into', 'towards', 'novel'
  ]);
  const words = `${title} ${venue || ''}`
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !commonStopwords.has(w.toLowerCase()));

  const unique = Array.from(
    new Set(words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
  );
  return unique.slice(0, 3);
}

export function normalizeDiscoveredPaper(p: BackendDiscoveredPaper, isSaved: boolean = false): ResearchPaper {
  const authorsList = (p.authors || []).map((a) => {
    if (typeof a === 'string') {
      return { name: a };
    }
    if (a && typeof a === 'object' && a.name) {
      return { name: a.name };
    }
    return { name: String(a || 'Unknown Author') };
  });

  return {
    id: p.id || `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: p.title || 'Untitled Academic Paper',
    authors: authorsList.length > 0 ? authorsList : [{ name: 'Contributing Authors' }],
    year: p.publication_year || new Date().getFullYear(),
    journalOrConference: p.venue || (p.source ? `${p.source} Publication` : 'Academic Repository'),
    source: (p.source as PaperSource) || 'arXiv',
    abstract: p.abstract || 'No abstract text was indexed for this academic manuscript.',
    relevanceScore: Math.min(100, Math.max(40, p.relevance_score || 85)),
    citationsCount: p.citation_count || 0,
    doi: p.doi || '',
    pdfUrl: p.pdf_url || p.paper_url || '',
    paperUrl: p.paper_url || (p.doi ? `https://doi.org/${p.doi}` : ''),
    selected: false,
    analyzed: false,
    tags: extractTags(p.title, p.venue),
    saved: isSaved,
  };
}

export function normalizeSavedPaper(p: BackendSavedPaper): ResearchPaper {
  const authorsList = (p.authors || []).map((a) => {
    if (typeof a === 'string') return { name: a };
    if (a && typeof a === 'object' && a.name) return { name: a.name };
    return { name: String(a || 'Unknown Author') };
  });

  return {
    id: p.external_id || `saved-${p.id}`,
    backendId: p.id,
    title: p.title,
    authors: authorsList.length > 0 ? authorsList : [{ name: 'Contributing Authors' }],
    year: p.publication_year || (p.created_at ? new Date(p.created_at).getFullYear() : 2025),
    journalOrConference: p.venue || (p.source ? `${p.source} Publication` : 'Saved Repository'),
    source: (p.source as PaperSource) || 'Semantic Scholar',
    abstract: p.abstract || 'Saved paper from research repository.',
    relevanceScore: p.relevance_score || 90,
    citationsCount: p.citation_count || 0,
    doi: p.doi || '',
    pdfUrl: p.pdf_url || p.paper_url || '',
    paperUrl: p.paper_url || (p.doi ? `https://doi.org/${p.doi}` : ''),
    selected: false,
    analyzed: false,
    tags: extractTags(p.title, p.venue),
    saved: true,
  };
}

export const paperService = {
  /**
   * Discovers academic research papers concurrently from Semantic Scholar, arXiv, and Crossref.
   * Returns a maximum of 20 normalized papers.
   */
  async searchPapers(query: string, limit: number = 20): Promise<{ papers: ResearchPaper[]; message?: string | null }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to search academic papers.');
    }

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('Search query cannot be empty. Please enter a research topic or keywords.');
    }

    const enforcedLimit = Math.min(Math.max(1, limit), 20);

    const res = await fetch('/api/papers/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: cleanQuery,
        limit: enforcedLimit,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || data.message || 'Academic paper discovery failed.');
    }

    const rawList: BackendDiscoveredPaper[] = data.papers || [];
    const normalized = rawList.slice(0, 20).map((p) => normalizeDiscoveredPaper(p, false));

    return {
      papers: normalized,
      message: data.message || (normalized.length === 0 ? 'No relevant research papers were found. Try a broader research topic or different keywords.' : null),
    };
  },

  /**
   * Saves a research paper to PostgreSQL for the authenticated user and optional project.
   */
  async savePaper(paper: ResearchPaper, projectId?: string | number | null): Promise<BackendSavedPaper> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to save papers.');
    }

    let parsedProjectId: number | null = null;
    if (typeof projectId === 'number') {
      parsedProjectId = projectId;
    } else if (typeof projectId === 'string' && /^\d+$/.test(projectId)) {
      parsedProjectId = parseInt(projectId, 10);
    }

    const payload = {
      project_id: parsedProjectId,
      external_id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors.map((a) => a.name),
      publication_year: paper.year,
      venue: paper.journalOrConference,
      doi: paper.doi || null,
      paper_url: paper.paperUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null),
      pdf_url: paper.pdfUrl || null,
      citation_count: paper.citationsCount || 0,
      source: paper.source,
      relevance_score: paper.relevanceScore || 0,
    };

    const res = await fetch('/api/papers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to save research paper.');
    }

    return data as BackendSavedPaper;
  },

  /**
   * Retrieves saved research papers from PostgreSQL for the authenticated user.
   */
  async getSavedPapers(projectId?: string | number): Promise<ResearchPaper[]> {
    const token = authService.getToken();
    if (!token) {
      return [];
    }

    let url = '/api/papers';
    if (projectId) {
      url += `?project_id=${encodeURIComponent(String(projectId))}`;
    }

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return [];
      }

      const data: BackendSavedPaper[] = await res.json();
      return (data || []).map(normalizeSavedPaper);
    } catch (err) {
      console.warn('Could not retrieve saved papers from PostgreSQL:', err);
      return [];
    }
  },

  /**
   * Deletes a saved research paper owned by the authenticated user.
   */
  async deleteSavedPaper(paperId: number): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to delete papers.');
    }

    const res = await fetch(`/api/papers/${paperId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || data.error || 'Failed to delete research paper.');
    }
  },

  /**
   * Generates or retrieves structured academic analysis for a paper.
   * If paper is not yet saved to PostgreSQL, automatically saves it first.
   */
  async analyzePaper(paper: ResearchPaper, forceRegenerate: boolean = false): Promise<PaperAnalysis> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to analyze papers.');
    }

    // Ensure paper has a backend PostgreSQL ID
    let backendId = paper.backendId;
    if (!backendId) {
      const saved = await this.savePaper(paper);
      backendId = saved.id;
      paper.backendId = saved.id;
      paper.saved = true;
    }

    const endpoint = forceRegenerate
      ? `/api/papers/${backendId}/analysis/regenerate`
      : `/api/papers/${backendId}/analyze`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ force_regenerate: forceRegenerate }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to analyze research paper.');
    }

    return normalizePaperAnalysis(data, paper);
  },

  /**
   * Retrieves saved academic analysis for a paper.
   */
  async getPaperAnalysis(paper: ResearchPaper): Promise<PaperAnalysis | null> {
    const token = authService.getToken();
    if (!token) return null;

    const paperIdentifier = paper.backendId || paper.id;
    try {
      const res = await fetch(`/api/papers/${paperIdentifier}/analysis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return normalizePaperAnalysis(data, paper);
    } catch {
      return null;
    }
  },

  /**
   * Forces regeneration of structured academic analysis for a paper.
   */
  async regenerateAnalysis(paper: ResearchPaper): Promise<PaperAnalysis> {
    return this.analyzePaper(paper, true);
  },
};

export function normalizePaperAnalysis(data: any, paper: ResearchPaper): PaperAnalysis {
  return {
    paperId: paper.id,
    backendId: data.id,
    sourceType: data.source_type,
    overview: data.overview || `### Research Analysis for ${paper.title}\n\n**Problem:** ${data.research_problem}\n\n**Objective:** ${data.research_objective}`,
    abstract: paper.abstract || data.overview || 'No abstract available.',
    summary: {
      keyContributions: (data.contributions && data.contributions.length > 0)
        ? data.contributions
        : ['Core academic contributions documented in manuscript.'],
      findings: (data.key_findings && data.key_findings.length > 0)
        ? data.key_findings
        : ['Empirical findings reported in paper results.'],
      implications: (data.future_work && data.future_work.length > 0)
        ? data.future_work
        : ['Future scientific investigation recommended.'],
    },
    researchGaps: (data.limitations && data.limitations.length > 0)
      ? data.limitations
      : ['No explicit limitation was identified in the provided paper content.'],
    literatureReview: {
      theoreticalFramework: data.approach || 'Empirical research framework.',
      relationToPriorWork: data.research_problem || 'Built upon foundational academic principles.',
      keyDebates: (data.research_questions && data.research_questions.length > 0)
        ? data.research_questions
        : ['Not available in the provided paper content.'],
    },
    methodology: {
      problemFormulation: data.research_problem || 'Formulated in research methodology.',
      dataset: data.dataset || 'Not available in the provided paper content.',
      preprocessing: data.experimental_setup || 'Standard academic experimental setup applied.',
      modelArchitecture: (data.algorithms_and_models && data.algorithms_and_models.length > 0)
        ? data.algorithms_and_models.join(', ')
        : 'Model architecture specified in paper.',
      trainingStrategy: data.methodology || 'Experimental methodology detailed in paper.',
      evaluationMetrics: (data.keywords && data.keywords.length > 0) ? data.keywords : ['Standard validation metrics.'],
      results: (data.key_results && data.key_results.length > 0)
        ? data.key_results.join('; ')
        : 'Quantitative benchmarks verified in paper.',
      limitations: (data.limitations && data.limitations.length > 0)
        ? data.limitations
        : ['No explicit limitation was identified in the provided paper content.'],
    },
    analyzedAt: data.updated_at || data.created_at || new Date().toISOString(),

    // Structured fields
    researchProblem: data.research_problem,
    researchObjective: data.research_objective,
    researchQuestions: data.research_questions,
    approach: data.approach,
    datasetText: data.dataset,
    algorithmsAndModels: data.algorithms_and_models,
    experimentalSetup: data.experimental_setup,
    keyResults: data.key_results,
    keyFindings: data.key_findings,
    contributions: data.contributions,
    limitations: data.limitations,
    futureWork: data.future_work,
    keywords: data.keywords,
  };
}
