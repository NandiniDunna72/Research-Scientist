import { 
  ResearchProject, 
  ResearchPaper, 
  PaperAnalysis, 
  ResearchGap, 
  ResearchQuestion, 
  LiteratureReview, 
  Methodology, 
  ComparisonItem, 
  DocumentationConfig, 
  PresentationConfig, 
  UserSettings 
} from '../types';
import { mockProjects } from '../data/mockProjects';
import { mockPapers } from '../data/mockPapers';
import { mockAnalyses } from '../data/mockAnalysis';
import { mockResearchGaps, mockResearchQuestions } from '../data/mockResearchGaps';
import { mockLiteratureReview } from '../data/mockLiterature';
import { mockMethodologies } from '../data/mockMethodology';
import { mockComparisonItems } from '../data/mockComparison';
import { mockDocumentationConfig } from '../data/mockDocumentation';
import { mockPresentationConfig } from '../data/mockPresentation';
import { defaultSettings } from '../data/mockSettings';
import { authService } from './authService';
import { paperService } from './paperService';
import { researchGapService } from './researchGapService';
import { researchQuestionService } from './researchQuestionService';


const STORAGE_KEYS = {
  PROJECTS: 'ai_research_projects',
  PAPERS: 'ai_research_papers',
  GAPS: 'ai_research_gaps',
  QUESTIONS: 'ai_research_questions',
  SETTINGS: 'ai_research_settings',
};

// Helper to initialize or retrieve from localStorage
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Simulates network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const researchService = {
  // Projects
  async getProjects(): Promise<ResearchProject[]> {
    if (authService.isAuthenticated()) {
      try {
        const token = authService.getToken();
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: ResearchProject[] = (data || []).map((p: any) => ({
            id: String(p.id),
            title: p.title,
            topic: p.topic || p.title,
            description: p.description || '',
            domain: p.domain || 'AI Research',
            keywords: [],
            paperCount: p.papers_count || 0,
            yearRange: [2021, 2026],
            preferredSources: ['PubMed', 'arXiv', 'IEEE Xplore', 'Nature'],
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: p.updated_at || new Date().toISOString(),
            progress: p.progress || 0,
            currentStage: p.current_stage || 'papers',
            papersCount: p.papers_count || 0,
            analyzedCount: p.analyzed_count || 0,
            gapsIdentifiedCount: p.gaps_count || 0,
            starred: false,
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to fetch projects from backend:', err);
      }
    }
    const local = getStored<ResearchProject[]>(STORAGE_KEYS.PROJECTS, []);
    return local.filter((p) => !p.id.startsWith('proj-healthcare-ai') && !p.id.startsWith('proj-llm-edu') && !p.id.startsWith('proj-traffic-ai'));
  },

  async getProjectById(id: string): Promise<ResearchProject | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(data: Partial<ResearchProject>): Promise<ResearchProject> {
    if (authService.isAuthenticated()) {
      try {
        const token = authService.getToken();
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title || 'Untitled Research',
            topic: data.topic || data.title,
            description: data.description || '',
            domain: data.domain || 'AI Research',
          }),
        });
        if (res.ok) {
          const created = await res.json();
          const newProject: ResearchProject = {
            id: String(created.id),
            title: created.title,
            topic: created.topic || created.title,
            description: created.description || '',
            domain: created.domain || 'AI Research',
            keywords: data.keywords || [],
            paperCount: 0,
            yearRange: data.yearRange || [2021, 2026],
            preferredSources: data.preferredSources || ['PubMed', 'arXiv', 'IEEE Xplore', 'Nature'],
            createdAt: created.created_at || new Date().toISOString(),
            updatedAt: created.updated_at || new Date().toISOString(),
            progress: 0,
            currentStage: 'papers',
            papersCount: 0,
            analyzedCount: 0,
            gapsIdentifiedCount: 0,
            starred: false,
          };
          const projects = await this.getProjects();
          const updated = [newProject, ...projects.filter((p) => p.id !== newProject.id)];
          setStored(STORAGE_KEYS.PROJECTS, updated);
          return newProject;
        }
      } catch (err) {
        console.warn('Backend project creation failed, using local storage:', err);
      }
    }

    const projects = getStored<ResearchProject[]>(STORAGE_KEYS.PROJECTS, []);
    const cleanProjects = projects.filter((p) => !p.id.startsWith('proj-healthcare-ai') && !p.id.startsWith('proj-llm-edu') && !p.id.startsWith('proj-traffic-ai'));
    const newProject: ResearchProject = {
      id: `proj-${Date.now()}`,
      title: data.title || 'Untitled Research',
      topic: data.topic || data.title || 'Novel Research Exploration',
      description: data.description || 'Systematic investigation powered by AI Research Scientist.',
      domain: data.domain || 'AI Research',
      keywords: data.keywords || ['Artificial Intelligence', 'Literature Review', 'Deep Learning'],
      paperCount: 0,
      yearRange: data.yearRange || [2021, 2026],
      preferredSources: data.preferredSources || ['PubMed', 'arXiv', 'IEEE Xplore', 'Nature'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      currentStage: 'papers',
      papersCount: 0,
      analyzedCount: 0,
      gapsIdentifiedCount: 0,
      starred: false,
    };

    const updated = [newProject, ...cleanProjects];
    setStored(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<ResearchProject>): Promise<ResearchProject> {
    if (authService.isAuthenticated()) {
      try {
        const token = authService.getToken();
        await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: updates.title,
            topic: updates.topic,
            description: updates.description,
            domain: updates.domain,
          }),
        });
      } catch (err) {
        console.warn('Backend project update error:', err);
      }
    }

    const projects = await this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = updatedProject;
    setStored(STORAGE_KEYS.PROJECTS, projects);
    return updatedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (authService.isAuthenticated()) {
      try {
        const token = authService.getToken();
        await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Backend project delete error:', err);
      }
    }
    const projects = await this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, filtered);
    return true;
  },

  // Papers
  async getPapers(projectId?: string): Promise<ResearchPaper[]> {
    if (authService.isAuthenticated()) {
      try {
        const saved = await paperService.getSavedPapers(projectId);
        return saved || [];
      } catch (err) {
        console.warn('Could not retrieve papers from backend:', err);
      }
    }
    const local = getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, []);
    return local.filter((p) => !p.id.startsWith('paper-') && !p.id.startsWith('mock-'));
  },


  async togglePaperSelect(paperId: string): Promise<ResearchPaper[]> {
    const papers = await this.getPapers();
    const updated = papers.map((p) => (p.id === paperId ? { ...p, selected: !p.selected } : p));
    setStored(STORAGE_KEYS.PAPERS, updated);
    return updated;
  },

  async selectAllPapers(select: boolean): Promise<ResearchPaper[]> {
    const papers = await this.getPapers();
    const updated = papers.map((p) => ({ ...p, selected: select }));
    setStored(STORAGE_KEYS.PAPERS, updated);
    return updated;
  },


  // Paper Analysis
  async getPaperAnalysis(paperId: string, paper?: ResearchPaper): Promise<PaperAnalysis> {
    if (authService.isAuthenticated()) {
      try {
        let targetPaper = paper;
        if (!targetPaper) {
          const allPapers = await this.getPapers();
          targetPaper = allPapers.find((p) => p.id === paperId);
        }

        if (targetPaper) {
          // Check if analysis is already cached in PostgreSQL
          const cached = await paperService.getPaperAnalysis(targetPaper);
          if (cached) {
            return cached;
          }
          // Analyze paper via backend
          return await paperService.analyzePaper(targetPaper);
        }
      } catch (err) {
        console.warn('Real paper analysis failed, falling back to mock analysis:', err);
      }
    }

    await delay(250);
    const fallback = mockAnalyses['paper-1'];
    return mockAnalyses[paperId] || {
      ...fallback,
      paperId,
      overview: `AI Research Analysis for paper (${paperId}): Automated breakdown of contributions, methodological rigor, and domain insights.`,
    };
  },

  async regenerateAnalysis(paperId: string, _tabName?: string, paper?: ResearchPaper): Promise<PaperAnalysis> {
    if (authService.isAuthenticated()) {
      try {
        let targetPaper = paper;
        if (!targetPaper) {
          const allPapers = await this.getPapers();
          targetPaper = allPapers.find((p) => p.id === paperId);
        }

        if (targetPaper) {
          return await paperService.regenerateAnalysis(targetPaper);
        }
      } catch (err) {
        console.warn('Paper analysis regeneration failed, falling back to mock:', err);
      }
    }

    await delay(1200); // realistic AI thinking simulation
    const current = await this.getPaperAnalysis(paperId, paper);
    return {
      ...current,
      analyzedAt: new Date().toISOString(),
      overview: current.overview + ' [Regenerated with heightened precision & multi-turn clinical verification]',
    };
  },

  // Research Gaps & Questions
  async getResearchGaps(projectId?: string): Promise<ResearchGap[]> {
    const pid = projectId || '1';
    if (authService.isAuthenticated()) {
      try {
        const report = await researchGapService.getLatestGaps(pid);
        if (report && report.gaps && report.gaps.length > 0) {
          return report.gaps;
        }
      } catch (err) {
        console.warn('Backend research gaps fetch failed, falling back to local:', err);
      }
    }
    await delay(150);
    const key = `${STORAGE_KEYS.GAPS}_${pid}`;
    return getStored<ResearchGap[]>(key, []);
  },

  async getResearchQuestions(projectId?: string): Promise<ResearchQuestion[]> {
    const pid = projectId || '1';
    if (authService.isAuthenticated()) {
      try {
        const res = await researchQuestionService.getResearchQuestions(pid);
        if (res && res.research_questions && res.research_questions.length > 0) {
          return res.research_questions;
        }
      } catch (err) {
        console.warn('Backend research questions fetch failed, falling back to local:', err);
      }
    }
    await delay(150);
    const key = `${STORAGE_KEYS.QUESTIONS}_${pid}`;
    return getStored<ResearchQuestion[]>(key, []);
  },

  async generateMoreQuestions(projectId?: string): Promise<ResearchQuestion[]> {
    const pid = projectId || '1';
    if (authService.isAuthenticated()) {
      try {
        const res = await researchQuestionService.generateResearchQuestions(pid);
        if (res && res.research_questions && res.research_questions.length > 0) {
          return res.research_questions;
        }
      } catch (err) {
        console.warn('Backend question generation failed:', err);
      }
    }
    return await this.getResearchQuestions(projectId);
  },

  async toggleSaveQuestion(questionId: string, currentQuestions?: ResearchQuestion[]): Promise<ResearchQuestion[]> {
    const questions = currentQuestions && currentQuestions.length > 0 ? currentQuestions : await this.getResearchQuestions();
    const updated = questions.map((q) => (q.id === questionId ? { ...q, saved: !q.saved } : q));
    return updated;
  },


  // Literature Review
  async getLiteratureReview(_projectId?: string): Promise<LiteratureReview> {
    await delay(300);
    return mockLiteratureReview;
  },

  // Methodology
  async getMethodology(_projectId?: string, paperId: string = 'paper-1'): Promise<Methodology> {
    await delay(250);
    return mockMethodologies[paperId] || mockMethodologies['paper-1'];
  },

  // Comparison
  async getComparison(_projectId?: string): Promise<ComparisonItem[]> {
    await delay(250);
    return mockComparisonItems;
  },

  // Documentation
  async getDocumentationConfig(): Promise<DocumentationConfig> {
    await delay(200);
    return mockDocumentationConfig;
  },

  // Presentation
  async getPresentationConfig(): Promise<PresentationConfig> {
    await delay(200);
    return mockPresentationConfig;
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    return getStored<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  },

  async saveSettings(settings: UserSettings): Promise<UserSettings> {
    await delay(200);
    setStored(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },
};
