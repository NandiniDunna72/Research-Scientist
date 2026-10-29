import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ResearchProject, 
  ResearchPaper, 
  UserSettings 
} from '../types';
import { researchService } from '../services/researchService';
import { paperService } from '../services/paperService';
import { defaultSettings } from '../data/mockSettings';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface ResearchContextType {
  projects: ResearchProject[];
  currentProject: ResearchProject | null;
  setCurrentProjectId: (id: string) => void;
  createProject: (data: Partial<ResearchProject>) => Promise<ResearchProject>;
  updateProject: (id: string, updates: Partial<ResearchProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Papers
  papers: ResearchPaper[];
  setPapers: React.Dispatch<React.SetStateAction<ResearchPaper[]>>;
  loadProjectPapers: (projectId: string) => Promise<ResearchPaper[]>;
  togglePaperSelect: (paperId: string) => Promise<void>;
  selectAllPapers: (select: boolean) => Promise<void>;
  reloadPapers: (projectId?: string) => Promise<void>;
  discoverPapers: (query: string, limit?: number) => Promise<ResearchPaper[]>;
  savePaper: (paper: ResearchPaper) => Promise<void>;
  isDiscovering: boolean;
  discoveryError: string | null;

  // AI Assistant Drawer
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  toggleAIAssistant: () => void;

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Loading
  isLoading: boolean;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ResearchProject | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');

  // Load initial data
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        // Clean up any stale mock data from localStorage for a fresh workspace
        try {
          const purgeIfMock = (key: string) => {
            const val = localStorage.getItem(key);
            if (val && (
              val.includes('paper-1') ||
              val.includes('paper-2') ||
              val.includes('proj-healthcare-ai') ||
              val.includes('proj-llm-edu') ||
              val.includes('OncVision') ||
              val.includes('Multimodal Vision-Language')
            )) {
              localStorage.removeItem(key);
            }
          };
          purgeIfMock('ai_research_projects');
          purgeIfMock('ai_research_papers');
          purgeIfMock('ai_research_gaps');
          purgeIfMock('ai_research_questions');
        } catch {}


        const [loadedProjects, loadedSettings] = await Promise.all([
          researchService.getProjects(),
          researchService.getSettings(),
        ]);
        setProjects(loadedProjects);
        setSettings(loadedSettings);
        if (loadedProjects.length > 0) {
          const firstProj = loadedProjects[0];
          setCurrentProject(firstProj);
          const firstPapers = await researchService.getPapers(firstProj.id);
          setPapers(firstPapers);
        } else {
          setCurrentProject(null);
          setPapers([]);
        }
        setThemeState(loadedSettings.appearance.theme);
      } catch (err) {
        console.error('Failed to initialize research data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);


  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    const updated = {
      ...settings,
      appearance: {
        ...settings.appearance,
        theme: newTheme,
      },
    };
    setSettings(updated);
    researchService.saveSettings(updated);
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadProjectPapers = async (projectId: string): Promise<ResearchPaper[]> => {
    try {
      const p = await researchService.getPapers(projectId);
      setPapers(p);
      return p;
    } catch (err) {
      console.warn('Failed to load papers for project:', err);
      return [];
    }
  };

  const setCurrentProjectId = async (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
    }
    await loadProjectPapers(id);
  };

  const createProject = async (data: Partial<ResearchProject>): Promise<ResearchProject> => {
    const newProj = await researchService.createProject(data);
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProject(newProj);
    addToast({
      type: 'success',
      title: 'Research Project Created',
      message: `"${newProj.title}" has been created with automated paper discovery.`,
    });
    return newProj;
  };

  const updateProject = async (id: string, updates: Partial<ResearchProject>) => {
    const updated = await researchService.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (currentProject?.id === id) {
      setCurrentProject(updated);
    }
    addToast({
      type: 'success',
      title: 'Project Updated',
      message: 'Changes saved successfully.',
    });
  };

  const deleteProject = async (id: string) => {
    await researchService.deleteProject(id);
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (currentProject?.id === id) {
      setCurrentProject(remaining[0] || null);
    }
    addToast({
      type: 'info',
      title: 'Project Removed',
      message: 'The research project has been deleted.',
    });
  };

  const togglePaperSelect = async (paperId: string) => {
    const updated = await researchService.togglePaperSelect(paperId);
    setPapers(updated);
  };

  const selectAllPapers = async (select: boolean) => {
    const updated = await researchService.selectAllPapers(select);
    setPapers(updated);
    addToast({
      type: 'info',
      title: select ? 'All Papers Selected' : 'Selection Cleared',
      message: select ? `${updated.length} papers queued for analysis.` : 'No papers selected.',
    });
  };

  const reloadPapers = async (projectId?: string) => {
    const targetId = projectId || currentProject?.id;
    if (targetId) {
      await loadProjectPapers(targetId);
    } else {
      const p = await researchService.getPapers();
      setPapers(p);
    }
  };

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const discoverPapers = async (query: string, limit: number = 20): Promise<ResearchPaper[]> => {
    setIsDiscovering(true);
    setDiscoveryError(null);
    try {
      const { papers: discoveredList, message } = await paperService.searchPapers(query, limit);
      setPapers(discoveredList);
      setIsDiscovering(false);
      if (discoveredList.length > 0) {
        addToast({
          type: 'success',
          title: 'Papers Discovered',
          message: `Retrieved ${discoveredList.length} relevant academic papers.`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'No Papers Found',
          message: message || 'Try a broader research topic or different keywords.',
        });
      }
      return discoveredList;
    } catch (err: any) {
      setIsDiscovering(false);
      setDiscoveryError(err.message || 'Paper discovery failed.');
      addToast({
        type: 'error',
        title: 'Search Error',
        message: err.message || 'Unable to retrieve academic papers. Please try again.',
      });
      return [];
    }
  };

  const savePaper = async (paper: ResearchPaper): Promise<void> => {
    try {
      const savedResult = await paperService.savePaper(paper, currentProject?.id);
      setPapers((prev) =>
        prev.map((p) =>
          p.id === paper.id ? { ...p, saved: true, backendId: savedResult.id } : p
        )
      );
      addToast({
        type: 'success',
        title: 'Paper Saved',
        message: `"${paper.title.slice(0, 45)}..." saved to PostgreSQL.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save paper to database.',
      });
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    const saved = await researchService.saveSettings(newSettings);
    setSettings(saved);
    setThemeState(saved.appearance.theme);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'User preferences updated.',
    });
  };

  const toggleAIAssistant = () => setIsAIAssistantOpen((prev) => !prev);

  return (
    <ResearchContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProjectId,
        createProject,
        updateProject,
        deleteProject,
        papers,
        setPapers,
        loadProjectPapers,
        togglePaperSelect,
        selectAllPapers,
        reloadPapers,
        discoverPapers,
        savePaper,
        isDiscovering,
        discoveryError,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        toggleAIAssistant,
        settings,
        updateSettings,
        theme,
        setTheme,
        toasts,
        addToast,
        removeToast,
        isLoading,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
