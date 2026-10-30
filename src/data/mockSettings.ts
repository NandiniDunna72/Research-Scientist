import { UserSettings } from '../types';

export const defaultSettings: UserSettings = {
  profile: {
    name: 'Dr. Alex Vance',
    email: 'alex.vance@stanford.edu',
    institution: 'Department of Computer Science & Autonomous AI Lab',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Principal AI Research Scientist',
  },
  appearance: {
    theme: 'dark',
    compactMode: false,
    highContrast: false,
  },
  ai: {
    model: 'claude-3-5-sonnet',
    temperature: 0.2,
    summaryLength: 'comprehensive',
    autoCite: true,
  },
  voice: {
    enabled: true,
    engine: 'gemini-live-audio',
    voiceId: 'aoede',
    speechRate: 1.0,
    pitch: 1.0,
    autoReadResponses: false,
  },
  research: {
    defaultPaperCount: 20,
    defaultYearRange: [2021, 2025],
    preferredSources: ['PubMed', 'Nature', 'IEEE Xplore', 'ScienceDirect', 'arXiv'],
    autoExtractGaps: true,
  },
  export: {
    defaultFormat: 'pdf',
    includeVisuals: true,
    citationStyle: 'IEEE',
  },
};
