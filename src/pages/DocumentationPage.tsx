import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { documentationService } from '../services/documentationService';
import { DocumentationConfig, DocumentationSection } from '../types';
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  CheckSquare,
  Square,
  Check,
  Copy,
  BookOpen,
  FileCheck,
  Save,
  RotateCw,
  Edit3,
  Settings2,
  Loader2,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Printer,
  Undo,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import ReactMarkdown from 'react-markdown';

export const DocumentationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast } = useResearch();

  const projectId = id || currentProject?.id || '';

  // State
  const [config, setConfig] = useState<DocumentationConfig | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-abstract');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Active section editor state
  const [editedSectionContent, setEditedSectionContent] = useState<string>('');

  // Default initial section list for projects without saved docs
  const defaultInitialSections: DocumentationSection[] = [
    { id: 'sec-title', number: 1, title: 'Title Page', content: '', included: true, wordCount: 0, section_key: 'title_page' },
    { id: 'sec-abstract', number: 2, title: 'Abstract', content: '', included: true, wordCount: 0, section_key: 'abstract' },
    { id: 'sec-intro', number: 3, title: 'Introduction', content: '', included: true, wordCount: 0, section_key: 'introduction' },
    { id: 'sec-problem', number: 4, title: 'Problem Statement and Objectives', content: '', included: true, wordCount: 0, section_key: 'problem_statement' },
    { id: 'sec-questions', number: 5, title: 'Research Questions', content: '', included: true, wordCount: 0, section_key: 'research_questions' },
    { id: 'sec-lit-review', number: 6, title: 'Literature Review', content: '', included: true, wordCount: 0, section_key: 'literature_review' },
    { id: 'sec-gaps', number: 7, title: 'Research Gap Analysis', content: '', included: true, wordCount: 0, section_key: 'research_gaps' },
    { id: 'sec-methodology', number: 8, title: 'Research Methodology', content: '', included: true, wordCount: 0, section_key: 'methodology' },
    { id: 'sec-architecture', number: 9, title: 'Proposed System Architecture', content: '', included: true, wordCount: 0, section_key: 'architecture' },
    { id: 'sec-comparison', number: 10, title: 'Comparative Analysis', content: '', included: true, wordCount: 0, section_key: 'comparative_analysis' },
    { id: 'sec-solution', number: 11, title: 'Proposed Solution & Expected Contributions', content: '', included: true, wordCount: 0, section_key: 'solution_contributions' },
    { id: 'sec-results', number: 12, title: 'Planned Evaluation & Protocol', content: '', included: true, wordCount: 0, section_key: 'planned_evaluation' },
    { id: 'sec-limitations', number: 13, title: 'Limitations & Future Work', content: '', included: true, wordCount: 0, section_key: 'limitations_future_work' },
    { id: 'sec-conclusion', number: 14, title: 'Conclusion', content: '', included: true, wordCount: 0, section_key: 'conclusion' },
    { id: 'sec-references', number: 15, title: 'References', content: '', included: true, wordCount: 0, section_key: 'references' },
  ];

  // Load existing saved documentation on mount or project switch
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const savedDoc = await documentationService.getLatestDocumentation(projectId);
        if (isMounted) {
          if (savedDoc && savedDoc.sections && savedDoc.sections.length > 0) {
            setConfig(savedDoc);
            const firstActive = savedDoc.sections.find((s) => s.included) || savedDoc.sections[0];
            setActiveSectionId(firstActive.id);
            setEditedSectionContent(firstActive.content);
          } else {
            // Fresh project template state
            const initialDoc: DocumentationConfig = {
              project_id: projectId,
              paperTitle: currentProject?.title || 'Academic Research Manuscript',
              template: 'IEEE Conference',
              targetJournal: 'IEEE Transactions / ACM Digital Library',
              referenceStyle: 'IEEE',
              authors: '',
              institution: '',
              status: 'draft',
              version: 1,
              sections: defaultInitialSections,
              compiledMarkdown: '',
              totalWordCount: 0,
              missing_upstream_context: [],
            };
            setConfig(initialDoc);
            setActiveSectionId('sec-abstract');
            setEditedSectionContent('');
          }
        }
      } catch (err) {
        console.warn('Failed to load project documentation:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasUnsavedChanges(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Sync active section content into editor when active section changes
  useEffect(() => {
    if (config) {
      const active = config.sections.find((s) => s.id === activeSectionId);
      if (active) {
        setEditedSectionContent(active.content);
      }
    }
  }, [activeSectionId]);

  if (isLoading || !config) {
    return (
      <div className="py-12">
        <LoadingState
          title="Loading Research Documentation"
          subtitle="Fetching saved manuscript draft, bibliography citations, and structured sections from PostgreSQL..."
        />
      </div>
    );
  }

  // Toggle section inclusion
  const toggleSection = (sectionId: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, included: !s.included } : s
        ),
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Select all / clear sections
  const handleSelectAll = (included: boolean) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => ({ ...s, included })),
      };
    });
    setHasUnsavedChanges(true);
  };

  // Generate / Synthesize fresh document from upstream modules
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await documentationService.generateDocumentation({
        projectId,
        template: config.template,
        targetJournal: config.targetJournal,
        referenceStyle: config.referenceStyle,
        authors: config.authors,
        institution: config.institution,
        sectionsToInclude: config.sections.filter((s) => s.included).map((s) => s.id),
      });

      setConfig(generated);
      const active = generated.sections.find((s) => s.id === activeSectionId) || generated.sections[0];
      setEditedSectionContent(active.content);
      setHasUnsavedChanges(false);

      addToast({
        type: 'success',
        title: 'Manuscript Draft Generated',
        message: `Synthesized ${generated.totalWordCount?.toLocaleString()} words formatted to ${generated.template}.`,
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: err?.message || 'Could not synthesize research documentation.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate only the active section
  const handleRegenerateActiveSection = async () => {
    const activeSec = config.sections.find((s) => s.id === activeSectionId);
    if (!activeSec) return;

    setIsGenerating(true);
    try {
      const updated = await documentationService.regenerateDocumentation(projectId, {
        sectionIds: [activeSec.id],
        template: config.template,
        referenceStyle: config.referenceStyle,
      });

      setConfig(updated);
      const freshlyActive = updated.sections.find((s) => s.id === activeSectionId);
      if (freshlyActive) {
        setEditedSectionContent(freshlyActive.content);
      }
      setHasUnsavedChanges(false);

      addToast({
        type: 'success',
        title: 'Section Regenerated',
        message: `Refreshed "${activeSec.title}" while preserving your edits on all other sections.`,
      });
    } catch (err: any) {
      console.error('Section regeneration failed:', err);
      addToast({
        type: 'error',
        title: 'Section Refresh Failed',
        message: err?.message || 'Failed to refresh section content.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save manual edits to PostgreSQL
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // First update the currently active section if in editor mode
      const updatedSections = config.sections.map((s) =>
        s.id === activeSectionId
          ? {
              ...s,
              content: editedSectionContent,
              wordCount: editedSectionContent.trim().split(/\s+/).filter(Boolean).length,
            }
          : s
      );

      const saved = await documentationService.updateDocumentation(projectId, {
        title: config.paperTitle,
        template: config.template,
        targetJournal: config.targetJournal,
        referenceStyle: config.referenceStyle,
        authors: config.authors,
        institution: config.institution,
        status: 'draft',
        sections: updatedSections,
      });

      setConfig(saved);
      setHasUnsavedChanges(false);

      addToast({
        type: 'success',
        title: 'Draft Saved',
        message: 'Your manuscript edits have been persisted to PostgreSQL.',
      });
    } catch (err: any) {
      console.error('Save error:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save manuscript changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export handler (Markdown, DOCX, PDF)
  const handleDownload = async (format: 'markdown' | 'docx' | 'pdf') => {
    setIsExporting(format);
    try {
      await documentationService.downloadExport(projectId, format, config.paperTitle);
      addToast({
        type: 'success',
        title: `Exported ${format.toUpperCase()}`,
        message: `Downloaded formatted ${format.toUpperCase()} draft to your computer.`,
      });
    } catch (err: any) {
      console.error(`Export ${format} error:`, err);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err?.message || `Failed to generate ${format.toUpperCase()} file.`,
      });
    } finally {
      setIsExporting(null);
    }
  };

  // Copy full markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(compiledMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      type: 'info',
      title: 'Markdown Copied',
      message: 'Full manuscript text copied to your clipboard.',
    });
  };

  // Compile active included sections into single markdown
  const compiledMarkdown = config.sections
    .filter((s) => s.included)
    .map((s) => (s.id === activeSectionId && viewMode === 'editor' ? editedSectionContent : s.content))
    .filter((text) => text && text.trim().length > 0)
    .join('\n\n---\n\n');

  const totalWords = config.sections
    .filter((s) => s.included)
    .reduce((acc, s) => {
      if (s.id === activeSectionId && viewMode === 'editor') {
        return acc + editedSectionContent.trim().split(/\s+/).filter(Boolean).length;
      }
      return acc + (s.wordCount || 0);
    }, 0);

  const activeSection =
    config.sections.find((s) => s.id === activeSectionId) || config.sections[0];

  const templates: string[] = [
    'IEEE Conference',
    'ACM Transactions',
    'Nature Scientific Reports',
    'Standard Thesis / Dissertation',
    'ArXiv Preprint',
  ];

  const referenceStyles: string[] = ['IEEE', 'APA', 'Harvard', 'ACM'];

  const hasAnyContent = config.sections.some((s) => s.content && s.content.trim().length > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2245]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <FileText className="w-5 h-5 animate-neon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              Documentation
            </h1>
            <Badge variant="indigo" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              Module 10
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono text-slate-300 border-slate-700">
              v{config.version || 1} • {config.template}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="warning" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-400/30">
                Unsaved Edits
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            Autonomous doctoral-grade manuscript drafting grounded in your papers, literature review, methodology, and system architecture.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            disabled={!hasAnyContent}
            className="text-xs gap-1.5 h-9 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('docx')}
            disabled={!hasAnyContent || isExporting !== null}
            className="text-xs gap-1.5 h-9 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            {isExporting === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export DOCX</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('pdf')}
            disabled={!hasAnyContent || isExporting !== null}
            className="text-xs gap-1.5 h-9 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            {isExporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export PDF</span>
          </Button>

          {hasUnsavedChanges && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="text-xs gap-1.5 h-9 text-emerald-300 border border-emerald-500/40 bg-emerald-950/40"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </Button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{hasAnyContent ? 'Regenerate Manuscript' : 'Generate Manuscript'}</span>
          </button>
        </div>
      </div>

      {/* Upstream Context Banner (if some modules were optional/missing) */}
      {config.missing_upstream_context && config.missing_upstream_context.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="font-semibold block">Incomplete Upstream Pipeline Context Noted:</strong>
            <p className="text-[11px] text-amber-800 dark:text-amber-400">
              The documentation engine generated all available sections with verified grounding. The following optional upstream modules were not executed and were noted transparently rather than inventing fabricated content:
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-400 space-y-0.5">
              {config.missing_upstream_context.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Section Toggles (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metadata & Formatting Options Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Manuscript Configuration</span>
                <Settings2 className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Publisher formatting template and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Document Title
                </label>
                <Input
                  value={config.paperTitle}
                  onChange={(e) => {
                    setConfig({ ...config, paperTitle: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="text-xs h-8.5"
                  placeholder="e.g. Multimodal Graph Alignment for Oncological Diagnosis"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Publisher Template
                  </label>
                  <select
                    value={config.template}
                    onChange={(e) => {
                      setConfig({ ...config, template: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                  >
                    {templates.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Reference Style
                  </label>
                  <select
                    value={config.referenceStyle || 'IEEE'}
                    onChange={(e) => {
                      setConfig({ ...config, referenceStyle: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                  >
                    {referenceStyles.map((s) => (
                      <option key={s} value={s}>{s} Standard</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Author Details (Optional)
                  </label>
                  <Input
                    value={config.authors || ''}
                    onChange={(e) => {
                      setConfig({ ...config, authors: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. Alex Chen, Priya Sharma"
                    className="text-xs h-8.5"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Institution / Affiliation
                  </label>
                  <Input
                    value={config.institution || ''}
                    onChange={(e) => {
                      setConfig({ ...config, institution: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g. MIT Dept. of EECS"
                    className="text-xs h-8.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Selection Toggles Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Manuscript Sections ({config.sections.filter((s) => s.included).length}/{config.sections.length})</span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline px-1 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="text-[11px] text-muted-foreground hover:underline px-1 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <CardDescription>Select sections to include in the compiled manuscript and choose an active section to preview/edit</CardDescription>
            </CardHeader>

            <CardContent className="space-y-1.5 p-4 pt-0">
              <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
                {config.sections.map((section) => {
                  const isActive = section.id === activeSectionId;
                  const wordCount =
                    isActive && viewMode === 'editor'
                      ? editedSectionContent.trim().split(/\s+/).filter(Boolean).length
                      : section.wordCount || 0;

                  return (
                    <div
                      key={section.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-foreground'
                          : 'border-border/60 hover:bg-secondary/40 text-muted-foreground'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setActiveSectionId(section.id);
                        }}
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <span className="text-[11px] font-mono font-bold text-muted-foreground w-5 text-right">
                          {section.number}.
                        </span>
                        <span className={`truncate font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-foreground'}`}>
                          {section.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {wordCount} words
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(section.id);
                          }}
                          className="p-1 hover:text-foreground text-muted-foreground"
                          title={section.included ? 'Exclude section' : 'Include section'}
                        >
                          {section.included ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manuscript Size Calculation */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated Manuscript Size:</span>
                <strong className="font-mono text-foreground font-semibold">
                  {totalWords.toLocaleString()} Words (~{Math.max(1, Math.round(totalWords / 450))} Pages)
                </strong>
              </div>

              {/* Generate / Regenerate CTA Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full gap-1.5 shadow-sm"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isGenerating ? 'Synthesizing Academic Manuscript...' : hasAnyContent ? 'Regenerate Entire Document' : 'Generate Full Research Document'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Document Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="shadow-md border-border">
            {/* Canvas Header Bar with Mode Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 border-b border-border bg-secondary/30 gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
                  Active Section: <strong className="text-indigo-600 dark:text-indigo-400">{activeSection.title}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* View Mode Toggle: Preview vs Section Editor */}
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setViewMode('editor')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      viewMode === 'editor'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Section</span>
                  </button>
                </div>

                {/* Regenerate Current Section */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateActiveSection}
                  disabled={isGenerating}
                  title="Regenerate only this section using upstream data without altering other sections"
                  className="text-xs h-7.5 px-2.5 gap-1"
                >
                  <RotateCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh Section</span>
                </Button>
              </div>
            </div>

            {/* Canvas Body: Live Markdown Preview or Markdown Editor */}
            {viewMode === 'preview' ? (
              <div className="p-6 sm:p-8 bg-card max-h-[760px] overflow-y-auto prose-academic font-sans text-xs sm:text-sm">
                {compiledMarkdown ? (
                  <ReactMarkdown>{compiledMarkdown}</ReactMarkdown>
                ) : (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">No Generated Manuscript Content Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Click <strong>"Generate Manuscript"</strong> on the left to synthesize all 15 academic sections grounded in your analyzed papers, research gaps, methodology, and architecture.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesize Now</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-6 bg-card space-y-3">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-border/60">
                  <span className="text-muted-foreground">
                    Editing: <strong className="text-foreground">{activeSection.title}</strong> (Markdown Supported)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {editedSectionContent.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="h-7 px-2.5 text-xs gap-1"
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      <span>Save Section</span>
                    </Button>
                  </div>
                </div>

                <textarea
                  value={editedSectionContent}
                  onChange={(e) => {
                    setEditedSectionContent(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={22}
                  className="w-full font-mono text-xs sm:text-sm rounded-lg border border-input bg-secondary/20 p-4 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 resize-y leading-relaxed"
                  placeholder="Enter or modify markdown content for this academic section..."
                />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Changes are retained in live memory and saved permanently to PostgreSQL on clicking Save.</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('preview')}
                    className="h-6 text-[11px]"
                  >
                    View Compiled Preview →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
