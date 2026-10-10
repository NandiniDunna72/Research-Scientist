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
    await delay(250);
    return getStored<ResearchProject[]>(STORAGE_KEYS.PROJECTS, mockProjects);
  },

  async getProjectById(id: string): Promise<ResearchProject | null> {
    await delay(150);
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || projects[0] || null;
  },

  async createProject(data: Partial<ResearchProject>): Promise<ResearchProject> {
    await delay(400);
    const projects = await this.getProjects();
    const newProject: ResearchProject = {
      id: `proj-${Date.now()}`,
      title: data.title || 'Untitled Research',
      topic: data.topic || data.title || 'Novel Research Exploration',
      description: data.description || 'Systematic investigation and synthesis powered by AI Research Scientist.',
      domain: data.domain || 'Multidisciplinary AI',
      keywords: data.keywords || ['Artificial Intelligence', 'Literature Review', 'Deep Learning'],
      paperCount: data.paperCount || 20,
      yearRange: data.yearRange || [2021, 2025],
      preferredSources: data.preferredSources || ['PubMed', 'arXiv', 'IEEE Xplore', 'Nature'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 25,
      currentStage: 'papers',
      papersCount: data.paperCount || 20,
      analyzedCount: 0,
      gapsIdentifiedCount: 0,
      starred: false,
    };

    const updated = [newProject, ...projects];
    setStored(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<ResearchProject>): Promise<ResearchProject> {
    await delay(200);
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
    await delay(200);
    const projects = await this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, filtered);
    return true;
  },

  // Papers
  async getPapers(_projectId?: string): Promise<ResearchPaper[]> {
    await delay(300);
    return getStored<ResearchPaper[]>(STORAGE_KEYS.PAPERS, mockPapers);
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
    if (authService.isAuthenticated()) {
      try {
        const pid = projectId || '1';
        const report = await researchGapService.getLatestGaps(pid);
        if (report && report.gaps && report.gaps.length > 0) {
          return report.gaps;
        }
      } catch (err) {
        console.warn('Backend research gaps fetch failed, falling back to mock:', err);
      }
    }
    await delay(250);
    return getStored<ResearchGap[]>(STORAGE_KEYS.GAPS, mockResearchGaps);
  },

  async getResearchQuestions(projectId?: string): Promise<ResearchQuestion[]> {
    if (authService.isAuthenticated()) {
      try {
        const pid = projectId || '1';
        const res = await researchQuestionService.getResearchQuestions(pid);
        if (res && res.research_questions && res.research_questions.length > 0) {
          return res.research_questions;
        }
      } catch (err) {
        console.warn('Backend research questions fetch failed, falling back to mock:', err);
      }
    }
    await delay(200);
    return getStored<ResearchQuestion[]>(STORAGE_KEYS.QUESTIONS, mockResearchQuestions);
  },

  async generateMoreQuestions(projectId?: string): Promise<ResearchQuestion[]> {
    if (authService.isAuthenticated()) {
      try {
        const pid = projectId || '1';
        const res = await researchQuestionService.generateResearchQuestions(pid);
        if (res && res.research_questions && res.research_questions.length > 0) {
          return res.research_questions;
        }
      } catch (err) {
        console.warn('Backend question generation failed, falling back to mock:', err);
      }
    }
    await delay(1000);
    const current = await this.getResearchQuestions(projectId);
    const newQuestion: ResearchQuestion = {
      id: `rq-${Date.now()}`,
      gapId: 'gap-1',
      question: 'How can dynamic low-rank feature projection prevent clinical drift without access to ground truth diagnostic labels?',
      type: 'Methodological Question',
      hypothesis: 'Unsupervised manifold regularization restricts gradient updates to orthogonal subspaces, stabilizing feature variance.',
      motivation: 'Addresses scanner incompatibility in emergency triage without manual re-calibration.',
      supporting_evidence: 'Empirical drift observed in multi-center validation.',
      expected_investigation: 'Apply test-time singular value thresholding on latent transformer activations.',
      feasibility: 'High',
      priority: 'High',
      rationale: 'Directly addresses scanner incompatibility in emergency triage without hospital IT manual re-calibration.',
      suggestedMethodology: 'Apply test-time singular value thresholding on latent transformer activations across 300 test biopsies.',
      saved: false,
      difficulty: 'High Breakthrough',
    };
    const updated = [newQuestion, ...current];
    setStored(STORAGE_KEYS.QUESTIONS, updated);
    return updated;
  },

  async toggleSaveQuestion(questionId: string, currentQuestions?: ResearchQuestion[]): Promise<ResearchQuestion[]> {
    const questions = currentQuestions && currentQuestions.length > 0 ? currentQuestions : await this.getResearchQuestions();
    const updated = questions.map((q) => (q.id === questionId ? { ...q, saved: !q.saved } : q));
    setStored(STORAGE_KEYS.QUESTIONS, updated);
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
