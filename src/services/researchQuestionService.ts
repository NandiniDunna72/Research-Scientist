import { ResearchQuestion, ResearchQuestionGenerationResult } from '../types';
import { authService } from './authService';

export function normalizeResearchQuestion(raw: any, index: number): ResearchQuestion {
  const id = raw.id ? String(raw.id) : (raw.question_id ? String(raw.question_id) : `rq-${index + 1}`);
  const qType = raw.type || raw.question_type || (index === 0 ? 'Primary Research Question' : 'Secondary Research Question');
  const relatedGapId = raw.related_gap_id ?? raw.gapId ?? (index + 1);
  const relatedGapTitle = raw.related_gap_title || `Research Gap #${relatedGapId}`;
  const motivation = raw.motivation || raw.rationale || raw.hypothesis || 'Critical research motivation identified from literature gaps.';
  const expectedInv = raw.expected_investigation || raw.suggestedMethodology || 'Empirical benchmark and ablation experiments.';
  const feasibility = raw.feasibility || 'High';
  const priority = raw.priority || 'High';
  const supportingEvidence = raw.supporting_evidence || 'Evidence synthesized across analyzed literature.';

  return {
    id,
    question_id: id,
    gapId: String(relatedGapId).startsWith('gap-') ? String(relatedGapId) : `gap-${relatedGapId}`,
    question: raw.question || 'Actionable research question derived from identified gap.',
    type: qType,
    question_type: qType,
    related_gap_id: relatedGapId,
    related_gap_title: relatedGapTitle,
    motivation,
    supporting_evidence: supportingEvidence,
    expected_investigation: expectedInv,
    feasibility,
    priority,
    // Backwards-compatible mappings for existing components
    hypothesis: motivation,
    rationale: motivation,
    suggestedMethodology: expectedInv,
    difficulty: feasibility === 'High' ? 'Feasible' : feasibility === 'Medium' ? 'Moderate' : 'High Breakthrough',
    saved: !!raw.saved,
    created_at: raw.created_at,
  };
}

export function normalizeQuestionGenerationResult(data: any): ResearchQuestionGenerationResult {
  const rawAll = data.research_questions || [];
  const normalizedAll = rawAll.map((q: any, i: number) => normalizeResearchQuestion(q, i));

  let primaryQ = data.primary_research_question
    ? normalizeResearchQuestion(data.primary_research_question, 0)
    : normalizedAll.find((q: ResearchQuestion) => q.type === 'Primary Research Question') || normalizedAll[0] || null;

  const rawSecondary = data.secondary_questions || [];
  let secondaryQs = rawSecondary.length > 0
    ? rawSecondary.map((q: any, i: number) => normalizeResearchQuestion(q, i + 1))
    : normalizedAll.filter((q: ResearchQuestion) => primaryQ ? q.id !== primaryQ.id : true);

  return {
    id: data.id,
    project_id: data.project_id,
    topic: data.topic || 'Research Project',
    papers_considered: data.papers_considered || 0,
    gaps_considered: data.gaps_considered || 0,
    primary_research_question: primaryQ,
    secondary_questions: secondaryQs,
    research_questions: normalizedAll.length > 0 ? normalizedAll : (primaryQ ? [primaryQ, ...secondaryQs] : []),
    overall_research_direction: data.overall_research_direction || 'A comprehensive inquiry addressing fundamental literature gaps.',
    recommended_next_step: data.recommended_next_step || 'Design controlled baseline experiments validating hypothesis.',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export const researchQuestionService = {
  /**
   * Retrieves the latest generated research questions for a project from PostgreSQL.
   */
  async getResearchQuestions(projectId: string | number): Promise<ResearchQuestionGenerationResult | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/research-questions/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return normalizeQuestionGenerationResult(data);
    } catch (err) {
      console.warn('Failed to fetch research questions from backend:', err);
      return null;
    }
  },

  /**
   * Generates research questions for the specified project.
   */
  async generateResearchQuestions(projectId: string | number): Promise<ResearchQuestionGenerationResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate research questions.');
    }

    const res = await fetch('/api/research-questions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Research question generation failed. Please try again.');
    }

    return normalizeQuestionGenerationResult(data);
  },

  /**
   * Regenerates research questions for the specified project using the latest analysis and gaps.
   */
  async regenerateResearchQuestions(projectId: string | number): Promise<ResearchQuestionGenerationResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate research questions.');
    }

    const res = await fetch(`/api/research-questions/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate research questions.');
    }

    return normalizeQuestionGenerationResult(data);
  },
};
