import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { presentationService } from '../services/presentationService';
import { PresentationConfig, Slide } from '../types';
import {
  Presentation,
  Sparkles,
  Download,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Settings2,
  Layers,
  Clock,
  CheckCircle2,
  Tv,
  X,
  Edit3,
  RotateCw,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Building,
  GraduationCap,
  Volume2,
  VolumeX,
  Square,
  ExternalLink,
  BookOpen,
  Info,
  Palette,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { voiceService } from '../services/voiceService';

const presentationGenerationSteps = [
  'Extracting saved research manuscript & upstream module outputs...',
  'Synthesizing structured presentation outline and slide archetypes...',
  'Grounding problem statement, research gaps, & methodology...',
  'Integrating verified system architecture & comparison matrices...',
  'Composing oral speaker notes & key analytical takeaways...',
  'Compiling authentic 16:9 widescreen PowerPoint (.pptx) file...',
];

export const PresentationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast, settings } = useResearch();

  const projectId = id || currentProject?.id || '';

  // Core state
  const [config, setConfig] = useState<PresentationConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [isSpeakingSlide, setIsSpeakingSlide] = useState<boolean>(false);

  useEffect(() => {
    const unsub = voiceService.subscribeSpeaking(setIsSpeakingSlide);
    return () => {
      unsub();
      voiceService.stop();
    };
  }, []);

  const handleSpeakSlide = (notes?: string) => {
    if (!notes) {
      addToast({
        type: 'info',
        title: 'No Speaker Notes',
        message: 'This slide does not contain oral delivery notes to narrate.',
      });
      return;
    }
    if (isSpeakingSlide) {
      voiceService.stop();
      setIsSpeakingSlide(false);
    } else {
      setIsSpeakingSlide(true);
      voiceService.speak(notes, settings?.voice, () => setIsSpeakingSlide(false));
    }
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isSavingSlide, setIsSavingSlide] = useState<boolean>(false);

  // Generation options
  const [titleInput, setTitleInput] = useState<string>('');
  const [presentationType, setPresentationType] = useState<string>('Project Proposal');
  const [theme, setTheme] = useState<string>('Professional Academic');
  const [style, setStyle] = useState<string>('Academic Formal');
  const [slideCount, setSlideCount] = useState<number>(12);
  const [presenterName, setPresenterName] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState<boolean>(true);
  const [includeArchitecture, setIncludeArchitecture] = useState<boolean>(true);
  const [includeComparison, setIncludeComparison] = useState<boolean>(true);
  const [includeResearchGaps, setIncludeResearchGaps] = useState<boolean>(true);
  const [includeMethodology, setIncludeMethodology] = useState<boolean>(true);

  // Load existing saved presentation on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSavedPresentation() {
      setIsLoading(true);
      try {
        const saved = await presentationService.getLatestPresentation(projectId);
        if (isMounted) {
          if (saved) {
            setConfig(saved);
            setTitleInput(saved.title || currentProject?.title || '');
            setPresentationType(saved.presentationType || saved.presentation_type || 'Project Proposal');
            setTheme(saved.theme || 'Professional Academic');
            setStyle(saved.style || 'Academic Formal');
            setSlideCount(saved.slideCount || saved.slide_count || 12);
            setPresenterName(saved.presenterName || saved.presenter_name || '');
            setInstitution(saved.institution || '');
            setSupervisorName(saved.supervisorName || saved.supervisor_name || '');
            setIncludeSpeakerNotes(saved.includeSpeakerNotes ?? true);
            setIncludeArchitecture(saved.includeArchitecture ?? true);
            setIncludeComparison(saved.includeComparison ?? true);
            setIncludeResearchGaps(saved.includeResearchGaps ?? true);
            setIncludeMethodology(saved.includeMethodology ?? true);
          } else {
            // Prepopulate defaults from current project
            if (currentProject) {
              setTitleInput(currentProject.title || currentProject.topic || 'Academic Research Presentation');
            }
          }
        }
      } catch (err) {
        console.warn('Error loading presentation:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSavedPresentation();
    return () => {
      isMounted = false;
    };
  }, [projectId, currentProject]);

  // Handle Generate Presentation
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await presentationService.generatePresentation({
        projectId,
        title: titleInput || currentProject?.title || 'Academic Research Presentation',
        presentationType,
        theme,
        style,
        slideCount,
        presenterName: presenterName.trim() || undefined,
        institution: institution.trim() || undefined,
        supervisorName: supervisorName.trim() || undefined,
        includeArchitecture,
        includeComparison,
        includeResearchGaps,
        includeMethodology,
        includeSpeakerNotes,
      });

      setConfig(generated);
      setIsSettingsOpen(false);
      setActiveSlideIndex(0);
      addToast({
        type: 'success',
        title: 'PowerPoint Deck Generated',
        message: `Successfully created ${generated.slides.length}-slide academic presentation and compiled .pptx file.`,
      });
    } catch (err: any) {
      console.error('Presentation generation error:', err);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: err.message || 'Could not generate PowerPoint presentation. Please verify project context.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Download Genuine PPTX
  const handleDownloadPPTX = async () => {
    if (!config || !config.id) {
      addToast({
        type: 'error',
        title: 'Presentation Not Ready',
        message: 'Please generate the presentation deck first before downloading.',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const result = await presentationService.downloadPresentation(
        projectId,
        config.id,
        config.title || 'Research_Presentation'
      );
      addToast({
        type: 'success',
        title: 'PowerPoint Downloaded',
        message: `Saved '${result.filename}' to your downloads folder.`,
      });
    } catch (err: any) {
      console.error('Download error:', err);
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Failed to download PowerPoint .pptx file.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Instant Theme Switcher
  const handleQuickThemeChange = async (newTheme: string) => {
    if (!config || !config.id) return;
    setTheme(newTheme);
    try {
      const updated = await presentationService.updatePresentation(projectId, config.id, {
        theme: newTheme,
      });
      setConfig(updated);
      addToast({
        type: 'success',
        title: 'Theme Applied',
        message: `PowerPoint re-compiled with '${newTheme}' template styling.`,
      });
    } catch (err: any) {
      console.error('Failed to update theme:', err);
      addToast({
        type: 'error',
        title: 'Theme Update Failed',
        message: err.message || 'Could not apply theme.',
      });
    }
  };

  // Open Slide Editor
  const handleOpenEditSlide = (slide: Slide, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Clone slide to avoid direct mutation
    setEditingSlide({
      ...slide,
      bulletPoints: [...(slide.bulletPoints || slide.bullet_points || [])],
      bullet_points: [...(slide.bulletPoints || slide.bullet_points || [])],
    });
  };

  // Save Slide Edits
  const handleSaveSlide = async () => {
    if (!config || !config.id || !editingSlide) return;

    setIsSavingSlide(true);
    try {
      const updatedSlides = config.slides.map((s) => {
        if (s.id === editingSlide.id || s.slideNumber === editingSlide.slideNumber) {
          return {
            ...editingSlide,
            bulletPoints: editingSlide.bulletPoints,
            bullet_points: editingSlide.bulletPoints,
          };
        }
        return s;
      });

      const updated = await presentationService.updatePresentation(projectId, config.id, {
        slides: updatedSlides,
      });

      setConfig(updated);
      setEditingSlide(null);
      addToast({
        type: 'success',
        title: 'Slide Updated',
        message: `Slide ${editingSlide.slideNumber} saved and .pptx file re-compiled.`,
      });
    } catch (err: any) {
      console.error('Slide update error:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save slide modifications.',
      });
    } finally {
      setIsSavingSlide(false);
    }
  };

  // Regenerate Single Slide
  const handleRegenerateSingleSlide = async (slideNumber: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!config || !config.id) return;

    setIsRegeneratingSlide(slideNumber);
    try {
      const updated = await presentationService.regeneratePresentation(projectId, config.id, {
        slideNumbers: [slideNumber],
      });
      setConfig(updated);
      addToast({
        type: 'success',
        title: 'Slide Regenerated',
        message: `Slide ${slideNumber} updated with fresh research analysis.`,
      });
    } catch (err: any) {
      console.error('Regenerate slide error:', err);
      addToast({
        type: 'error',
        title: 'Regeneration Failed',
        message: err.message || 'Could not regenerate this slide.',
      });
    } finally {
      setIsRegeneratingSlide(null);
    }
  };

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!isSlideshowOpen || !config) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIndex((prev) => Math.min(prev + 1, config.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsSlideshowOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideshowOpen, config]);

  // Loading spinner for initial fetch
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <LoadingState
          title="Loading Presentation Workspace"
          subtitle="Connecting to PostgreSQL and checking saved presentation decks..."
          steps={[
            'Retrieving research project context...',
            'Checking PostgreSQL presentation repository...',
            'Preparing interactive slide deck canvas...',
          ]}
        />
      </div>
    );
  }

  // Generation loading screen
  if (isGenerating) {
    return (
      <div className="py-12">
        <LoadingState
          title="Generating Academic Presentation Deck"
          subtitle="Translating research papers, gap analysis, methodology, and documentation into a professional PowerPoint deck"
          steps={presentationGenerationSteps}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2245]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <Presentation className="w-5 h-5 animate-neon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              PPT Generation
            </h1>
            <Badge variant="indigo" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              Module 11
            </Badge>
            {config && (
              <>
                <Badge variant="secondary" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
                  {config.slides.length} Slides
                </Badge>
                <Badge variant="outline" size="sm" className="font-mono text-slate-300 border-slate-700">
                  {config.presentationType || config.presentation_type || 'Proposal'}
                </Badge>
                <Badge variant="secondary" size="sm" className="text-fuchsia-300 border-fuchsia-500/30">
                  {config.theme || 'Professional Academic'}
                </Badge>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            Converts your research project papers, gap analysis, methodology, architecture, and documentation into an authentic 16:9 widescreen PowerPoint (.pptx) presentation.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs gap-1.5 h-9 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deck Settings</span>
          </Button>

          {config && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSlideshowOpen(true)}
              className="text-xs gap-1.5 h-9 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Preview Slideshow</span>
            </Button>
          )}

          {config ? (
            <button
              onClick={handleDownloadPPTX}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading .pptx...' : 'Download PPTX'}</span>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Presentation</span>
            </button>
          )}
        </div>
      </div>

      {/* Upstream context notice if any */}
      {config && config.missing_upstream_context && config.missing_upstream_context.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Note on Project Context: </span>
            The presentation was generated with available project data. Missing modules (
            {config.missing_upstream_context.join(', ')}) are clearly identified and represented as planned academic workflows rather than fabricated data.
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!config || config.slides.length === 0 ? (
        /* Empty / Generation Configurator State */
        <Card className="border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Configure Research Presentation</CardTitle>
                <CardDescription className="text-xs">
                  Customize presentation type, academic theme, and slide deck requirements before synthesis.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Presentation Title
                </label>
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g., Deep Learning Framework for Multi-Modal Healthcare Analytics"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Academic Presentation Type
                </label>
                <select
                  value={presentationType}
                  onChange={(e) => setPresentationType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="Project Proposal">Project Proposal (Problem, Gaps, Methodology, Scope)</option>
                  <option value="Final-Year Project Review">Final-Year Project Review (Comprehensive Architecture & Defense)</option>
                  <option value="Research Seminar">Research Seminar (Theoretical Rigor & Methodology)</option>
                  <option value="Literature Review Presentation">Literature Review Presentation (Comparative Taxonomy)</option>
                  <option value="Technical Demonstration">Technical Demonstration (Implementation & Workflow)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  PowerPoint Visual Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="Professional Academic">Professional Academic (Deep Oxford Navy & Royal Blue)</option>
                  <option value="Modern Technical">Modern Technical (Obsidian Cyber & Neon Cyan)</option>
                  <option value="Prestige Crimson">Prestige Crimson (Harvard Velvet & Academic Gold)</option>
                  <option value="Minimal Research">Minimal Research (Clean Editorial Swiss Slate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Desired Slide Count
                </label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value={8}>8 Slides (Fast Overview)</option>
                  <option value={10}>10 Slides (Standard Presentation)</option>
                  <option value={12}>12 Slides (Recommended Academic Structure)</option>
                  <option value={14}>14 Slides (Detailed Seminar Review)</option>
                  <option value={16}>16 Slides (Comprehensive Thesis Defense)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Presenter / Student Name (Optional)</span>
                </label>
                <Input
                  value={presenterName}
                  onChange={(e) => setPresenterName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Institution / Department (Optional)</span>
                </label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g., Dept. of Computer Science & Engineering"
                  className="text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Faculty Guide / Supervisor Name (Optional)</span>
                </label>
                <Input
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="e.g., Dr. Jane Smith, Professor"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 border-t border-border flex flex-wrap items-center gap-5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeSpeakerNotes}
                  onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium">Generate Oral Speaker Notes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeArchitecture}
                  onChange={(e) => setIncludeArchitecture(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include System Architecture</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Baseline Comparison</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeResearchGaps}
                  onChange={(e) => setIncludeResearchGaps(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Research Gaps</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeMethodology}
                  onChange={(e) => setIncludeMethodology(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Methodology</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Academic PowerPoint (.pptx)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Slide Deck View */
        <div className="space-y-6">
          {/* Quick Deck Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-foreground">{config.title}</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-foreground">Theme:</span>
                <select
                  value={config.theme || theme}
                  onChange={(e) => handleQuickThemeChange(e.target.value)}
                  className="text-xs font-semibold rounded-md border border-border bg-background px-2 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Switch PowerPoint Theme Palette"
                >
                  <option value="Professional Academic">Professional Academic (Oxford Navy)</option>
                  <option value="Modern Technical">Modern Technical (Deep Obsidian)</option>
                  <option value="Prestige Crimson">Prestige Crimson (Harvard Velvet)</option>
                  <option value="Minimal Research">Minimal Research (Clean Swiss Light)</option>
                </select>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>Type:</span>
                <span className="font-medium text-foreground">{config.presentationType || config.presentation_type}</span>
              </div>
              {config.presenterName && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">Presenter: <strong className="text-foreground">{config.presenterName}</strong></span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs gap-1.5 h-7.5"
              >
                <RotateCw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>Regenerate Deck</span>
              </Button>
            </div>
          </div>

          {/* Slide Deck Grid: 16:9 PowerPoint Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {config.slides.map((slide, index) => {
              const bullets = slide.bulletPoints || slide.bullet_points || [];
              const slideNum = slide.slideNumber || slide.slide_number || index + 1;
              const isRegeneratingThis = isRegeneratingSlide === slideNum;

              return (
                <div
                  key={slide.id || index}
                  onClick={() => {
                    setActiveSlideIndex(index);
                    setIsSlideshowOpen(true);
                  }}
                  className="group cursor-pointer rounded-2xl neon-card-project hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all duration-300 overflow-hidden flex flex-col relative"
                >
                  {/* 16:9 Aspect Ratio PPT Slide Canvas */}
                  <div className="aspect-[16/9] w-full p-5 flex flex-col justify-between relative select-none bg-gradient-to-br from-[#06091a] via-[#0a0f28] to-[#0e1438] border-b border-[#1b2245] text-slate-100">
                    {/* High-tech tech grid pattern overlay */}
                    <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

                    {/* Slide Top Bar */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          Slide {slideNum}
                        </span>
                        {slide.badge && (
                          <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
                            {slide.badge}
                          </span>
                        )}
                      </div>
                      {(slide.keyMetric || slide.key_metric) && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          {(slide.keyMetric || slide.key_metric)?.label}: {(slide.keyMetric || slide.key_metric)?.value}
                        </span>
                      )}
                    </div>

                    {/* Slide Main Content */}
                    <div className="space-y-1.5 my-auto relative z-10">
                      <h3 className="text-xs sm:text-sm font-bold group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                        {slide.title}
                      </h3>
                      {(slide.mainMessage || slide.main_message) && (
                        <p className="text-[10px] text-cyan-300 font-medium line-clamp-1">
                          ✦ {slide.mainMessage || slide.main_message}
                        </p>
                      )}
                      <ul className="space-y-1 pt-1 text-[10px] opacity-85">
                        {bullets.slice(0, 3).map((bp, bIdx) => (
                          <li key={bIdx} className="line-clamp-1 flex items-start gap-1.5">
                            <span className="text-cyan-400 shrink-0 font-bold">•</span>
                            <span className="text-slate-300">{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Slide Bottom Bar */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-[#1b2245] pt-1 relative z-10 font-mono">
                      <span className="truncate max-w-[140px] text-cyan-400/80">{config.title || 'AI Research Scientist'}</span>
                      <span className="text-cyan-300 font-bold">{slideNum} / {config.slides.length}</span>
                    </div>

                    {/* Overlay spinner when regenerating */}
                    {isRegeneratingThis && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center text-white z-20">
                        <div className="flex flex-col items-center gap-1.5 text-xs font-medium">
                          <RotateCw className="w-5 h-5 animate-spin text-cyan-400" />
                          <span className="font-mono text-cyan-200">Synthesizing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Meta & Action Footer */}
                  <div className="p-3 bg-[#0a0d26]/80 border-t border-[#1b2245] flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold text-slate-200 truncate">
                      {slide.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {slide.notes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakSlide(slide.notes);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Listen to Slide Voiceover Script"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleOpenEditSlide(slide, e)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit Slide Content"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRegeneratingThis}
                        onClick={(e) => handleRegenerateSingleSlide(slideNum, e)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-500"
                        title="Regenerate this slide"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRegeneratingThis ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide Editor Modal */}
      {editingSlide && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSlide(null)}
          title={`Edit Slide ${editingSlide.slideNumber || editingSlide.slide_number}: ${editingSlide.title}`}
          description="Refine slide title, main message, bullet points, and speaker notes. Changes re-compile the PowerPoint .pptx file."
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Slide Title
              </label>
              <Input
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Category Badge / Tag
              </label>
              <Input
                value={editingSlide.badge || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                placeholder="e.g., Problem Statement, Methodology, Architecture"
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Main Takeaway / High-Level Message
              </label>
              <Input
                value={editingSlide.mainMessage || editingSlide.main_message || ''}
                onChange={(e) =>
                  setEditingSlide({
                    ...editingSlide,
                    mainMessage: e.target.value,
                    main_message: e.target.value,
                  })
                }
                placeholder="Key sentence summarizing the slide's essential message"
                className="text-xs"
              />
            </div>

            {/* Bullet Points List Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Slide Bullet Points ({editingSlide.bulletPoints?.length || 0})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = editingSlide.bulletPoints || editingSlide.bullet_points || [];
                    setEditingSlide({
                      ...editingSlide,
                      bulletPoints: [...current, 'New concise academic point...'],
                      bullet_points: [...current, 'New concise academic point...'],
                    });
                  }}
                  className="text-[11px] h-6 px-2 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Point</span>
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(editingSlide.bulletPoints || editingSlide.bullet_points || []).map((bp, bpIdx) => (
                  <div key={bpIdx} className="flex items-start gap-2">
                    <span className="text-xs font-mono text-muted-foreground mt-2 w-4 shrink-0">
                      {bpIdx + 1}.
                    </span>
                    <Input
                      value={bp}
                      onChange={(e) => {
                        const updated = [...(editingSlide.bulletPoints || editingSlide.bullet_points || [])];
                        updated[bpIdx] = e.target.value;
                        setEditingSlide({
                          ...editingSlide,
                          bulletPoints: updated,
                          bullet_points: updated,
                        });
                      }}
                      className="text-xs flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = (editingSlide.bulletPoints || editingSlide.bullet_points || []).filter(
                          (_, idx) => idx !== bpIdx
                        );
                        setEditingSlide({
                          ...editingSlide,
                          bulletPoints: updated,
                          bullet_points: updated,
                        });
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Speaker Notes */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Oral Speaker Notes (for presenter voiceover)</span>
              </label>
              <textarea
                value={editingSlide.notes || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
                rows={3}
                placeholder="Script notes and oral talking points for this slide..."
                className="w-full text-xs rounded-lg border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSlide(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSlide}
                disabled={isSavingSlide}
                className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingSlide ? 'Saving & Recompiling...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deck Settings Modal */}
      {isSettingsOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSettingsOpen(false)}
          title="Presentation Deck Settings & Re-Generation"
          description="Adjust presentation type, visual theme, slide count, and presenter details."
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Presentation Title
              </label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Presentation Type
                </label>
                <select
                  value={presentationType}
                  onChange={(e) => setPresentationType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="Project Proposal">Project Proposal</option>
                  <option value="Final-Year Project Review">Final-Year Project Review</option>
                  <option value="Research Seminar">Research Seminar</option>
                  <option value="Literature Review Presentation">Literature Review Presentation</option>
                  <option value="Technical Demonstration">Technical Demonstration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Visual Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="Professional Academic">Professional Academic (Oxford Navy & Blue)</option>
                  <option value="Modern Technical">Modern Technical (Obsidian & Cyan)</option>
                  <option value="Prestige Crimson">Prestige Crimson (Harvard Velvet & Gold)</option>
                  <option value="Minimal Research">Minimal Research (Clean Swiss Light)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Slide Count
                </label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-input bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value={8}>8 Slides (Fast Talk)</option>
                  <option value={10}>10 Slides (Standard)</option>
                  <option value={12}>12 Slides (Recommended)</option>
                  <option value={14}>14 Slides (Extended)</option>
                  <option value={16}>16 Slides (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Presenter Name
                </label>
                <Input
                  value={presenterName}
                  onChange={(e) => setPresenterName(e.target.value)}
                  placeholder="Optional name"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Institution / Dept
                </label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Optional institution"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Faculty Guide / Supervisor
                </label>
                <Input
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="Optional supervisor"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSpeakerNotes}
                  onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Include Speaker Notes</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeArchitecture}
                  onChange={(e) => setIncludeArchitecture(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Architecture</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Comparison</span>
              </label>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-Generate Deck</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fullscreen Interactive Slideshow Modal */}
      {isSlideshowOpen && config && config.slides.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 text-white animate-fade-in">
          {/* Top Slideshow Header */}
          <div className="flex items-center justify-between max-w-6xl w-full mx-auto pb-3">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold tracking-tight">Academic Presentation Mode</span>
              <span className="text-xs text-slate-400 font-mono">
                Slide {activeSlideIndex + 1} of {config.slides.length}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                {config.theme}
              </span>
            </div>
            <button
              onClick={() => setIsSlideshowOpen(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Close Slideshow (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active 16:9 Presentation Canvas */}
          <div className="flex-1 flex items-center justify-center max-w-5xl w-full mx-auto my-auto">
            <div className={`aspect-[16/9] w-full border rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative ${
              config.theme === 'Minimal Research'
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : config.theme === 'Modern Technical'
                ? 'bg-[#0b0f19] border-slate-800 text-slate-100'
                : 'bg-[#0f172a] border-slate-800 text-slate-100'
            }`}>
              {/* Slide Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/40">
                    Slide {config.slides[activeSlideIndex].slideNumber || activeSlideIndex + 1}
                  </span>
                  {config.slides[activeSlideIndex].badge && (
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                      {config.slides[activeSlideIndex].badge}
                    </span>
                  )}
                </div>
                {(config.slides[activeSlideIndex].keyMetric || config.slides[activeSlideIndex].key_metric) && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                    {(config.slides[activeSlideIndex].keyMetric || config.slides[activeSlideIndex].key_metric)?.label}: {(config.slides[activeSlideIndex].keyMetric || config.slides[activeSlideIndex].key_metric)?.value}
                  </span>
                )}
              </div>

              {/* Title & Bullets */}
              <div className="my-auto space-y-4">
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {config.slides[activeSlideIndex].title}
                </h2>

                {(config.slides[activeSlideIndex].mainMessage || config.slides[activeSlideIndex].main_message) && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs sm:text-sm text-indigo-200 font-medium">
                    ✦ {config.slides[activeSlideIndex].mainMessage || config.slides[activeSlideIndex].main_message}
                  </div>
                )}

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-200 max-w-4xl">
                  {(config.slides[activeSlideIndex].bulletPoints || config.slides[activeSlideIndex].bullet_points || []).map((bp, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speaker Notes Bar */}
              {config.slides[activeSlideIndex].notes && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-300">Oral Speaker Notes: </strong>
                      <span>{config.slides[activeSlideIndex].notes}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSpeakSlide(config.slides[activeSlideIndex].notes)}
                    className="h-7 text-[11px] gap-1.5 shrink-0 bg-slate-700/60 border-slate-600 text-slate-200 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all"
                  >
                    {isSpeakingSlide ? (
                      <>
                        <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-indigo-400" />
                        <span>Narrate Slide</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Slide Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/70 pt-2">
                <span>{config.title}</span>
                <span className="font-mono">{activeSlideIndex + 1} / {config.slides.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom Slideshow Navigation */}
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto pt-3">
            <Button
              variant="outline"
              size="md"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((prev) => prev - 1)}
              className="gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous (←)</span>
            </Button>

            {/* Slide jump pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {config.slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveSlideIndex(dotIdx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    dotIdx === activeSlideIndex
                      ? 'bg-indigo-400 w-6'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={activeSlideIndex === config.slides.length - 1}
              onClick={() => setActiveSlideIndex((prev) => prev + 1)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <span>Next (→)</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
