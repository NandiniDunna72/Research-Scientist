import { PresentationConfig, Slide } from '../types';
import { authService } from './authService';

function normalizeBackendPresentation(raw: any): PresentationConfig {
  const d = raw.data || raw;

  const rawSlides = Array.isArray(d.slides) ? d.slides : (Array.isArray(raw.structured_slides) ? raw.structured_slides : []);

  const normalizedSlides: Slide[] = rawSlides.map((s: any, idx: number) => {
    const rawBullets = Array.isArray(s.bullet_points) ? s.bullet_points : (Array.isArray(s.bulletPoints) ? s.bulletPoints : []);
    const bullets = rawBullets.map((b: any) => (typeof b === 'string' ? b : String(b || '')));

    return {
      id: s.id || idx + 1,
      slideNumber: s.slide_number || s.slideNumber || idx + 1,
      slide_number: s.slide_number || s.slideNumber || idx + 1,
      title: s.title || `Slide ${idx + 1}`,
      subtitle: s.subtitle || '',
      slideType: s.slide_type || s.slideType || 'bullet',
      slide_type: s.slide_type || s.slideType || 'bullet',
      mainMessage: s.main_message || s.mainMessage || '',
      main_message: s.main_message || s.mainMessage || '',
      bulletPoints: bullets,
      bullet_points: bullets,
      badge: s.badge || '',
      notes: s.notes || '',
      visualType: s.visual_type || s.visualType || 'bullet',
      visual_type: s.visual_type || s.visualType || 'bullet',
      keyMetric: s.key_metric || s.keyMetric || undefined,
      key_metric: s.key_metric || s.keyMetric || undefined,
      sourcePaperIds: s.source_paper_ids || s.sourcePaperIds || [],
      source_paper_ids: s.source_paper_ids || s.sourcePaperIds || [],
    };
  });

  return {
    id: raw.id || d.id,
    project_id: raw.project_id || d.project_id,
    title: raw.title || d.title || 'Academic Research Presentation',
    presentationType: raw.presentation_type || d.presentation_type || d.presentationType || 'Project Proposal',
    presentation_type: raw.presentation_type || d.presentation_type || d.presentationType || 'Project Proposal',
    theme: raw.theme || d.theme || 'Professional Academic',
    slideCount: raw.slide_count || d.slide_count || d.slideCount || normalizedSlides.length,
    slide_count: raw.slide_count || d.slide_count || d.slideCount || normalizedSlides.length,
    style: d.style || 'Academic Formal',
    template: d.template || 'Academic Standard',
    presenterName: d.presenter_name || d.presenterName || '',
    presenter_name: d.presenter_name || d.presenterName || '',
    institution: d.institution || '',
    supervisorName: d.supervisor_name || d.supervisorName || '',
    supervisor_name: d.supervisor_name || d.supervisorName || '',
    includeArchitecture: d.include_architecture !== false,
    includeComparison: d.include_comparison !== false,
    includeResearchGaps: d.include_research_gaps !== false,
    includeMethodology: d.include_methodology !== false,
    includeSpeakerNotes: d.include_speaker_notes !== false,
    include_speaker_notes: d.include_speaker_notes !== false,
    status: raw.status || d.status || 'generated',
    version: raw.version || d.version || 1,
    filePath: raw.file_path || d.file_path || d.filePath || '',
    file_path: raw.file_path || d.file_path || d.filePath || '',
    missing_upstream_context: d.missing_upstream_context || [],
    created_at: raw.created_at || d.created_at,
    updated_at: raw.updated_at || d.updated_at,
    slides: normalizedSlides,
  };
}

export const presentationService = {
  /**
   * Retrieves the latest saved PowerPoint presentation for a project from PostgreSQL.
   */
  async getLatestPresentation(projectId: string | number): Promise<PresentationConfig | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/presentations/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      return normalizeBackendPresentation(json);
    } catch (err) {
      console.warn('Failed to fetch latest presentation:', err);
      return null;
    }
  },

  /**
   * Retrieves a specific saved presentation by ID.
   */
  async getPresentationById(projectId: string | number, presentationId: number): Promise<PresentationConfig | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/presentations/${encodeURIComponent(String(projectId))}/${presentationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      return normalizeBackendPresentation(json);
    } catch (err) {
      console.warn('Failed to fetch presentation by id:', err);
      return null;
    }
  },

  /**
   * Generates a new academic presentation deck from project research data and creates genuine .pptx.
   */
  async generatePresentation(options: {
    projectId: string | number;
    title?: string;
    presentationType?: string;
    theme?: string;
    style?: string;
    slideCount?: number;
    presenterName?: string;
    institution?: string;
    supervisorName?: string;
    includeArchitecture?: boolean;
    includeComparison?: boolean;
    includeResearchGaps?: boolean;
    includeMethodology?: boolean;
    includeSpeakerNotes?: boolean;
    sectionsToInclude?: string[];
  }): Promise<PresentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate presentations.');
    }

    const payload = {
      project_id: options.projectId,
      title: options.title?.trim() || undefined,
      presentation_type: options.presentationType || 'Project Proposal',
      theme: options.theme || 'Professional Academic',
      style: options.style || 'Academic Formal',
      slide_count: options.slideCount || 12,
      presenter_name: options.presenterName?.trim() || undefined,
      institution: options.institution?.trim() || undefined,
      supervisor_name: options.supervisorName?.trim() || undefined,
      include_architecture: options.includeArchitecture ?? true,
      include_comparison: options.includeComparison ?? true,
      include_research_gaps: options.includeResearchGaps ?? true,
      include_methodology: options.includeMethodology ?? true,
      include_speaker_notes: options.includeSpeakerNotes ?? true,
      sections_to_include: options.sectionsToInclude,
    };

    const res = await fetch('/api/presentations/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = 'Failed to generate presentation';
      try {
        const errorData = await res.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch {
        // use fallback
      }
      throw new Error(errMsg);
    }

    const json = await res.json();
    return normalizeBackendPresentation(json);
  },

  /**
   * Updates slide contents or presentation metadata, recreating the genuine .pptx file.
   */
  async updatePresentation(
    projectId: string | number,
    presentationId: number,
    updates: {
      title?: string;
      theme?: string;
      presentationType?: string;
      presenterName?: string;
      institution?: string;
      supervisorName?: string;
      slides?: Slide[];
    }
  ): Promise<PresentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to update presentations.');
    }

    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.theme) payload.theme = updates.theme;
    if (updates.presentationType) payload.presentation_type = updates.presentationType;
    if (updates.presenterName !== undefined) payload.presenter_name = updates.presenterName;
    if (updates.institution !== undefined) payload.institution = updates.institution;
    if (updates.supervisorName !== undefined) payload.supervisor_name = updates.supervisorName;

    if (updates.slides) {
      payload.slides = updates.slides.map((s, idx) => ({
        id: s.id || idx + 1,
        slide_number: s.slideNumber || s.slide_number || idx + 1,
        title: s.title,
        subtitle: s.subtitle || null,
        slide_type: s.slideType || s.slide_type || 'bullet',
        main_message: s.mainMessage || s.main_message || null,
        bullet_points: s.bulletPoints || s.bullet_points || [],
        notes: s.notes || null,
        badge: s.badge || null,
        visual_type: s.visualType || s.visual_type || 'bullet',
        key_metric: s.keyMetric || s.key_metric || null,
        source_paper_ids: s.sourcePaperIds || s.source_paper_ids || [],
      }));
    }

    const res = await fetch(`/api/presentations/${encodeURIComponent(String(projectId))}/${presentationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = 'Failed to update presentation';
      try {
        const errorData = await res.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    const json = await res.json();
    return normalizeBackendPresentation(json);
  },

  /**
   * Regenerates slides using updated research context.
   */
  async regeneratePresentation(
    projectId: string | number,
    presentationId: number,
    options?: {
      slideNumbers?: number[];
      theme?: string;
      presentationType?: string;
      slideCount?: number;
    }
  ): Promise<PresentationConfig> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate presentations.');
    }

    const payload: any = {};
    if (options?.slideNumbers && options.slideNumbers.length > 0) {
      payload.slide_numbers = options.slideNumbers;
    }
    if (options?.theme) payload.theme = options.theme;
    if (options?.presentationType) payload.presentation_type = options.presentationType;
    if (options?.slideCount) payload.slide_count = options.slideCount;

    const res = await fetch(`/api/presentations/${encodeURIComponent(String(projectId))}/${presentationId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = 'Failed to regenerate presentation';
      try {
        const errorData = await res.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    const json = await res.json();
    return normalizeBackendPresentation(json);
  },

  /**
   * Downloads the genuine PowerPoint .pptx file generated by the backend.
   */
  async downloadPresentation(
    projectId: string | number,
    presentationId: number,
    fallbackTitle = 'Research_Presentation'
  ): Promise<{ success: boolean; filename: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to download PowerPoint presentation.');
    }

    const url = `/api/presentations/${encodeURIComponent(String(projectId))}/${presentationId}/download`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errMsg = 'Failed to download PowerPoint presentation';
      try {
        const errorData = await res.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    // Parse filename from Content-Disposition header
    let filename = `${fallbackTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.pptx`;
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { success: true, filename };
  },
};
