import { ArchitectureResult } from '../types';
import { authService } from './authService';

export const architectureService = {
  /**
   * Retrieves the latest saved system architecture for a project from PostgreSQL.
   */
  async getLatestArchitecture(projectId: string | number): Promise<ArchitectureResult | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/architecture/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const payload: ArchitectureResult = json.data;
      payload.id = json.id;
      payload.created_at = json.created_at;
      payload.updated_at = json.updated_at;
      return payload;
    } catch (err) {
      console.warn('Failed to fetch latest architecture:', err);
      return null;
    }
  },

  /**
   * Generates a tailored research system architecture.
   */
  async generateArchitecture(projectId: string | number): Promise<ArchitectureResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate system architecture.');
    }

    const res = await fetch('/api/architecture/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'System architecture generation failed. Please try again.');
    }

    const payload: ArchitectureResult = data.data;
    payload.id = data.id;
    payload.created_at = data.created_at;
    payload.updated_at = data.updated_at;
    return payload;
  },

  /**
   * Explicitly regenerates system architecture using latest upstream assets.
   */
  async regenerateArchitecture(projectId: string | number): Promise<ArchitectureResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate architecture.');
    }

    const res = await fetch(`/api/architecture/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate system architecture.');
    }

    const payload: ArchitectureResult = data.data;
    payload.id = data.id;
    payload.created_at = data.created_at;
    payload.updated_at = data.updated_at;
    return payload;
  },
};
