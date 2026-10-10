import { ResearchGap, ResearchGapAnalysisReport } from '../types';
import { authService } from './authService';

export interface AnalyzedPaperSummary {
  id: number;
  title: string;
  authors: any[];
  publication_year?: number | null;
  venue?: string | null;
  source?: string | null;
  abstract?: string | null;
  has_analysis: boolean;
}

export function normalizeResearchGap(raw: any, index: number): ResearchGap {
  const priority = raw.priority || index + 1;
  const title = raw.title || raw.gap_title || `Research Gap #${priority}`;
  const category = raw.category || 'Methodological Gap';
  const confidence = (raw.confidence || 'High') as 'High' | 'Medium' | 'Low';
  const affectedPapers = Array.isArray(raw.affected_papers)
    ? raw.affected_papers
    : (raw.affected_papers ? [String(raw.affected_papers)] : []);

  const evidenceList = Array.isArray(raw.evidence)
    ? raw.evidence
    : (raw.evidence ? [String(raw.evidence)] : []);
  
  const evidenceCount = evidenceList.length;
  const frequencyScore = Math.max(5, Math.min(10, 10 - priority + Math.min(2, evidenceCount)));

  return {
    id: `gap-${raw.id || raw.gap_id || priority}`,
    gapNumber: priority,
    gap_id: raw.gap_id || raw.id || priority,
    title,
    gap_title: title,
    category,
    description: raw.description || 'Academic research gap synthesized from cross-paper analysis.',
    sourcePaperIds: affectedPapers,
    affected_papers: affectedPapers,
    importance: confidence === 'High' ? 'High' : confidence === 'Medium' ? 'Medium' : 'Low',
    confidence,
    confidence_rationale: raw.confidence_rationale || undefined,
    evidence: evidenceList.length > 0 ? evidenceList : ['Corroborated across analyzed literature.'],
    why_it_matters: raw.why_it_matters || 'Resolving this research gap advances foundational and practical frontiers.',
    potential_direction: raw.potential_direction || 'Conduct further experimental investigation.',
    potentialResearchOpportunity: raw.potential_direction || 'Conduct further experimental investigation.',
    domain: category,
    frequencyScore,
    priority,
  };
}

export function normalizeResearchGapReport(data: any): ResearchGapAnalysisReport {
  const rawGaps = data.gaps || [];
  const normalizedGaps = rawGaps.map((g: any, i: number) => normalizeResearchGap(g, i));
  return {
    id: data.id,
    project_id: data.project_id,
    papers_analyzed: data.papers_analyzed || normalizedGaps.length,
    gaps_identified: data.gaps_identified || normalizedGaps.length,
    overall_summary: data.overall_summary || 'Cross-paper analytical synthesis completed.',
    major_categories: data.major_categories || Array.from(new Set(normalizedGaps.map((g: ResearchGap) => g.category || 'Methodological Gap'))),
    most_important_gap: data.most_important_gap || (normalizedGaps[0]?.title || null),
    warning: data.warning || null,
    gaps: normalizedGaps,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export const researchGapService = {
  /**
   * Retrieves the latest generated research gap analysis for a project.
   */
  async getLatestGaps(projectId: string | number): Promise<ResearchGapAnalysisReport | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/research-gaps/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return normalizeResearchGapReport(data);
    } catch (err) {
      console.warn('Failed to fetch research gaps from backend:', err);
      return null;
    }
  },

  /**
   * Generates cross-paper research gaps for a project with optional paper IDs subset.
   */
  async analyzeGaps(
    projectId: string | number,
    paperIds?: (string | number)[],
  ): Promise<ResearchGapAnalysisReport> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to perform research gap analysis.');
    }

    const payload: { project_id: string | number; paper_ids?: (string | number)[] } = {
      project_id: projectId,
    };
    if (paperIds && paperIds.length > 0) {
      payload.paper_ids = paperIds;
    }

    const res = await fetch('/api/research-gaps/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Research gap analysis failed.');
    }

    return normalizeResearchGapReport(data);
  },

  /**
   * Regenerates research gaps for a project.
   */
  async regenerateGaps(
    projectId: string | number,
    paperIds?: (string | number)[],
  ): Promise<ResearchGapAnalysisReport> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate research gaps.');
    }

    const payload: { project_id: string | number; paper_ids?: (string | number)[] } = {
      project_id: projectId,
    };
    if (paperIds && paperIds.length > 0) {
      payload.paper_ids = paperIds;
    }

    const res = await fetch(`/api/research-gaps/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate research gaps.');
    }

    return normalizeResearchGapReport(data);
  },

  /**
   * Retrieves analyzed papers available for the project.
   */
  async getAnalyzedPapers(projectId: string | number): Promise<AnalyzedPaperSummary[]> {
    const token = authService.getToken();
    if (!token) return [];

    try {
      const res = await fetch(`/api/research-gaps/${encodeURIComponent(String(projectId))}/analyzed-papers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },
};
