import { DocumentationConfig, DocumentationSection } from '../types';
import { authService } from './authService';

function normalizeBackendDoc(data: any): DocumentationConfig {
  const d = data.data || data;
  return {
    id: data.id || d.id,
    project_id: data.project_id || d.project_id,
    template: d.template || 'IEEE Conference',
    paperTitle: d.title || 'Academic Research Manuscript',
    authors: typeof d.authors === 'string' ? d.authors : (Array.isArray(d.authors) ? d.authors.join(', ') : ''),
    institution: d.institution || '',
    targetJournal: d.target_journal || '',
    referenceStyle: d.reference_style || 'IEEE',
    status: d.status || 'draft',
    version: d.version || 1,
    sections: Array.isArray(d.sections)
      ? d.sections.map((s: any, idx: number) => ({
          id: s.id || `sec-${idx + 1}`,
          number: s.number || idx + 1,
          title: s.title || `Section ${idx + 1}`,
          content: s.content || '',
          included: s.included !== false,
          wordCount: s.wordCount || 0,
          section_key: s.section_key,
        }))
      : [],
    compiledMarkdown: d.compiled_markdown || '',
    totalWordCount: d.total_word_count || 0,
    missing_upstream_context: d.missing_upstream_context || [],
    created_at: data.created_at || d.created_at,
    updated_at: data.updated_at || d.updated_at,
  };
}

export const documentationService = {
  /**
   * Retrieves the latest saved research documentation for a project from PostgreSQL.
   */
  async getLatestDocumentation(projectId: string | number): Promise<DocumentationConfig | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/documentation/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      return normalizeBackendDoc(json);
    } catch (err) {
      console.warn('Failed to fetch latest documentation:', err);
      return null;
    }
  },

  /**
   * Generates doctoral-grade academic documentation grounded in project research modules.
   */
  async generateDocumentation(params: {
    projectId: string | number;
    template?: string;
    targetJournal?: string;
    referenceStyle?: string;
    authors?: string;
    institution?: string;
    sectionsToInclude?: string[];
  }): Promise<DocumentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate research documentation.');
    }

    const res = await fetch('/api/documentation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: params.projectId,
        template: params.template || 'IEEE Conference',
        target_journal: params.targetJournal,
        reference_style: params.referenceStyle || 'IEEE',
        authors: params.authors ? params.authors.split(',').map((a) => a.trim()) : undefined,
        institution: params.institution,
        sections_to_include: params.sectionsToInclude,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Documentation generation failed. Please try again.');
    }

    return normalizeBackendDoc(data);
  },

  /**
   * Updates edited document sections, metadata, or template and persists to PostgreSQL.
   */
  async updateDocumentation(
    projectId: string | number,
    updates: {
      title?: string;
      template?: string;
      targetJournal?: string;
      referenceStyle?: string;
      authors?: string;
      institution?: string;
      status?: string;
      sections?: DocumentationSection[];
      compiledMarkdown?: string;
    }
  ): Promise<DocumentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to update research documentation.');
    }

    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.template !== undefined) payload.template = updates.template;
    if (updates.targetJournal !== undefined) payload.target_journal = updates.targetJournal;
    if (updates.referenceStyle !== undefined) payload.reference_style = updates.referenceStyle;
    if (updates.authors !== undefined) {
      payload.authors = updates.authors ? updates.authors.split(',').map((a) => a.trim()) : [];
    }
    if (updates.institution !== undefined) payload.institution = updates.institution;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.sections !== undefined) payload.sections = updates.sections;
    if (updates.compiledMarkdown !== undefined) payload.compiled_markdown = updates.compiledMarkdown;

    const res = await fetch(`/api/documentation/${encodeURIComponent(String(projectId))}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to update research documentation.');
    }

    return normalizeBackendDoc(data);
  },

  /**
   * Regenerates entire manuscript or specific sections while preserving manual edits.
   */
  async regenerateDocumentation(
    projectId: string | number,
    options?: {
      sectionIds?: string[];
      template?: string;
      referenceStyle?: string;
    }
  ): Promise<DocumentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate documentation.');
    }

    const res = await fetch(`/api/documentation/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        section_ids: options?.sectionIds,
        template: options?.template,
        reference_style: options?.referenceStyle,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate research documentation.');
    }

    return normalizeBackendDoc(data);
  },

  /**
   * Downloads genuinely formatted export file (Markdown, DOCX, or PDF).
   */
  async downloadExport(
    projectId: string | number,
    format: 'markdown' | 'docx' | 'pdf',
    filenamePrefix?: string
  ): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to export documentation.');
    }

    const res = await fetch(
      `/api/documentation/${encodeURIComponent(String(projectId))}/export?format=${encodeURIComponent(format)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || errJson.error || `Failed to export document as ${format.toUpperCase()}.`);
    }

    const blob = await res.blob();
    const ext = format === 'markdown' ? 'md' : format;
    const cleanPrefix = (filenamePrefix || 'AI_Research_Manuscript').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const downloadName = `${cleanPrefix}.${ext}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
