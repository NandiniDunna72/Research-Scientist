import {
  PaperComparisonResult,
  EligiblePapersResponse,
} from '../types';
import { authService } from './authService';

export const comparisonService = {
  /**
   * Retrieves all project papers with analysis readiness status.
   */
  async getEligiblePapers(projectId: string | number): Promise<EligiblePapersResponse> {
    const token = authService.getToken();
    const res = await fetch(`/api/paper-comparison/${encodeURIComponent(String(projectId))}/eligible-papers`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Failed to retrieve eligible papers.');
    }

    return await res.json();
  },

  /**
   * Retrieves the latest saved paper comparison for a project from PostgreSQL.
   */
  async getLatestComparison(projectId: string | number): Promise<PaperComparisonResult | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/paper-comparison/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch latest comparison:', err);
      return null;
    }
  },

  /**
   * Generates a multi-paper comparison for selected paper IDs.
   */
  async generateComparison(
    projectId: string | number,
    paperIds: (string | number)[]
  ): Promise<PaperComparisonResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate paper comparison.');
    }

    const res = await fetch('/api/paper-comparison/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        paper_ids: paperIds,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Paper comparison failed. Please try again.');
    }

    return data;
  },

  /**
   * Explicitly regenerates comparison using latest data.
   */
  async regenerateComparison(
    projectId: string | number,
    paperIds?: (string | number)[]
  ): Promise<PaperComparisonResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate comparison.');
    }

    const res = await fetch(`/api/paper-comparison/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        ...(paperIds && paperIds.length > 0 ? { paper_ids: paperIds } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate paper comparison.');
    }

    return data;
  },
};
