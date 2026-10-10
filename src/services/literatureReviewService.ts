import {
  LiteratureReviewGenerationResult,
  LiteratureThemeItem,
  LiteraturePaperSummaryItem,
  LiteratureResearchLandscape,
  LiteratureMethodologicalAnalysis,
  LiteratureComparativeSynthesis,
} from '../types';
import { authService } from './authService';
import { AnalyzedPaperSummary, researchGapService } from './researchGapService';

export function normalizeLiteratureReviewResult(raw: any): LiteratureReviewGenerationResult {
  const landscapeRaw = raw.research_landscape || {};
  const landscape: LiteratureResearchLandscape = {
    overview: landscapeRaw.overview || 'Comprehensive synthesis of the current research corpus.',
    major_themes: Array.isArray(landscapeRaw.major_themes) ? landscapeRaw.major_themes : [],
    research_period: landscapeRaw.research_period || 'Recent Literature',
    dominant_approaches: Array.isArray(landscapeRaw.dominant_approaches) ? landscapeRaw.dominant_approaches : [],
  };

  const themesRaw = raw.themes || [];
  const themes: LiteratureThemeItem[] = themesRaw.map((t: any, idx: number) => ({
    theme_id: t.theme_id || `theme-${idx + 1}`,
    title: t.title || `Research Theme #${idx + 1}`,
    description: t.description || 'Thematic cluster addressing domain paradigms.',
    paper_ids: Array.isArray(t.paper_ids) ? t.paper_ids : (t.paper_ids ? [t.paper_ids] : []),
    paper_titles: Array.isArray(t.paper_titles) ? t.paper_titles : [],
    common_methods: Array.isArray(t.common_methods) ? t.common_methods : [],
    key_findings: Array.isArray(t.key_findings) ? t.key_findings : [],
    differences: Array.isArray(t.differences) ? t.differences : [],
  }));

  const methodsRaw = raw.methodological_analysis || {};
  const methodological_analysis: LiteratureMethodologicalAnalysis = {
    common_methods: Array.isArray(methodsRaw.common_methods) ? methodsRaw.common_methods : [],
    algorithms_models: Array.isArray(methodsRaw.algorithms_models) ? methodsRaw.algorithms_models : [],
    datasets: Array.isArray(methodsRaw.datasets) ? methodsRaw.datasets : [],
    evaluation_methods: Array.isArray(methodsRaw.evaluation_methods) ? methodsRaw.evaluation_methods : [],
    synthesis: methodsRaw.synthesis || 'Cross-paper methodological synthesis.',
  };

  const compRaw = raw.comparative_synthesis || {};
  const comparative_synthesis: LiteratureComparativeSynthesis = {
    similarities: Array.isArray(compRaw.similarities) ? compRaw.similarities : [],
    differences: Array.isArray(compRaw.differences) ? compRaw.differences : [],
    strengths: Array.isArray(compRaw.strengths) ? compRaw.strengths : [],
    limitations: Array.isArray(compRaw.limitations) ? compRaw.limitations : [],
  };

  const summariesRaw = raw.paper_summaries || [];
  const paper_summaries: LiteraturePaperSummaryItem[] = summariesRaw.map((s: any) => ({
    paper_id: s.paper_id,
    title: s.title || 'Academic Manuscript',
    authors: Array.isArray(s.authors) ? s.authors : (s.authors ? [String(s.authors)] : []),
    year: s.year ?? null,
    methodology: s.methodology || 'Empirical Investigation',
    dataset: s.dataset || 'Evaluation Dataset',
    algorithms_models: Array.isArray(s.algorithms_models) ? s.algorithms_models : (s.algorithms_models ? [String(s.algorithms_models)] : []),
    key_findings: Array.isArray(s.key_findings) ? s.key_findings.join('. ') : (s.key_findings || 'Task findings documented.'),
    limitations: Array.isArray(s.limitations) ? s.limitations.join('. ') : (s.limitations || 'Study limitations noted.'),
    contribution: s.contribution || 'Advances domain baseline.',
    relevance_to_topic: s.relevance_to_topic || 'Directly relevant to research project.',
  }));

  return {
    id: raw.id,
    project_id: raw.project_id,
    topic: raw.topic || 'Academic Research',
    papers_considered: raw.papers_considered || paper_summaries.length,
    papers_with_analysis: raw.papers_with_analysis || paper_summaries.length,
    papers_discovered: raw.papers_discovered || raw.papers_considered || paper_summaries.length,
    papers_without_analysis: Array.isArray(raw.papers_without_analysis) ? raw.papers_without_analysis : [],
    introduction: raw.introduction || 'Introduction grounded in analyzed papers.',
    research_landscape: landscape,
    themes,
    methodological_analysis,
    comparative_synthesis,
    research_trends: Array.isArray(raw.research_trends) ? raw.research_trends : [],
    limitations_in_literature: Array.isArray(raw.limitations_in_literature) ? raw.limitations_in_literature : [],
    research_gaps: raw.research_gaps || [],
    research_question_connection: raw.research_question_connection || 'Research questions connection synthesized.',
    conclusion: raw.conclusion || 'Literature review synthesis conclusion.',
    paper_summaries,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export const literatureReviewService = {
  /**
   * Retrieves the latest generated literature review for a project from PostgreSQL.
   */
  async getLiteratureReview(projectId: string | number): Promise<LiteratureReviewGenerationResult | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/literature-review/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return normalizeLiteratureReviewResult(data);
    } catch (err) {
      console.warn('Failed to fetch literature review from backend:', err);
      return null;
    }
  },

  /**
   * Generates a structured academic literature review for the project.
   */
  async generateLiteratureReview(
    projectId: string | number,
    paperIds?: (string | number)[],
  ): Promise<LiteratureReviewGenerationResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate literature review.');
    }

    const payload: { project_id: string | number; paper_ids?: (string | number)[] } = {
      project_id: projectId,
    };
    if (paperIds && paperIds.length > 0) {
      payload.paper_ids = paperIds;
    }

    const res = await fetch('/api/literature-review/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Literature review generation failed. Please try again.');
    }

    return normalizeLiteratureReviewResult(data);
  },

  /**
   * Regenerates the literature review using the latest paper analysis, gaps, and questions.
   */
  async regenerateLiteratureReview(projectId: string | number): Promise<LiteratureReviewGenerationResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate literature review.');
    }

    const res = await fetch(`/api/literature-review/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate literature review.');
    }

    return normalizeLiteratureReviewResult(data);
  },

  /**
   * Retrieves analyzed papers for the project.
   */
  async getAnalyzedPapers(projectId: string | number): Promise<AnalyzedPaperSummary[]> {
    const token = authService.getToken();
    if (!token) return [];

    try {
      // 1. Try literature review analyzed-papers endpoint
      const res = await fetch(`/api/literature-review/${encodeURIComponent(String(projectId))}/analyzed-papers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }

      // 2. Fall back to research gap service
      return await researchGapService.getAnalyzedPapers(projectId);
    } catch (err) {
      console.warn('Error fetching analyzed papers for literature review:', err);
      return await researchGapService.getAnalyzedPapers(projectId);
    }
  },
};
