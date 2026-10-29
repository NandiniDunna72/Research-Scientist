import React, { useState, useEffect, useMemo } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { researchService } from '../services/researchService';
import { authService } from '../services/authService';
import { paperService } from '../services/paperService';
import { PaperAnalysis as PaperAnalysisType, ResearchPaper } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Bookmark, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Cpu, 
  Share2,
  ExternalLink,
  ChevronRight,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import ReactMarkdown from 'react-markdown';

type TabKey = 'overview' | 'abstract' | 'summary' | 'gaps' | 'literature' | 'methodology';

export const PaperAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { papers, currentProject, loadProjectPapers, setPapers, addToast } = useResearch();

  // Ensure project papers are loaded when visiting analysis directly
  useEffect(() => {
    const targetId = id || currentProject?.id;
    if (targetId && papers.length === 0) {
      loadProjectPapers(targetId);
    }
  }, [id, currentProject?.id]);
  
  // Filter out any lingering mock papers with mock IDs
  const validPapers = useMemo(() => {
    return papers.filter((p) => !p.id.startsWith('paper-') && !p.id.startsWith('mock-'));
  }, [papers]);

  // Selected paper state: prefer selected paper, then first paper
  const initialPaperId = validPapers.find((p) => p.selected)?.id || validPapers[0]?.id || '';

  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialPaperId);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [analysis, setAnalysis] = useState<PaperAnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Active paper object
  const activePaper: ResearchPaper | undefined = validPapers.find((p) => p.id === selectedPaperId) || validPapers[0];

  // Synchronize selection if papers load asynchronously
  useEffect(() => {
    if (validPapers.length > 0 && !validPapers.some((p) => p.id === selectedPaperId)) {
      const preferred = validPapers.find((p) => p.selected)?.id || validPapers[0].id;
      setSelectedPaperId(preferred);
    }
  }, [validPapers, selectedPaperId]);


  useEffect(() => {
    if (activePaper) {
      loadAnalysis(activePaper);
    }
  }, [activePaper?.id]);

  const loadAnalysis = async (paper: ResearchPaper) => {
    setIsLoading(true);
    setLoadingStage('Extracting paper content (PDF / Abstract)...');
    try {
      let data: PaperAnalysisType | null = null;
      if (authService.isAuthenticated()) {
        // Check for cached analysis first
        data = await paperService.getPaperAnalysis(paper);
      }
      if (!data) {
        setLoadingStage('Analyzing methodology, empirical results, and findings...');
        if (authService.isAuthenticated()) {
          data = await paperService.analyzePaper(paper);
        } else {
          data = await researchService.getPaperAnalysis(paper.id, paper);
        }
      }
      setAnalysis(data);
      if (data && setPapers) {
        setPapers((prev) =>
          prev.map((p) =>
            p.id === paper.id
              ? { ...p, analyzed: true, backendId: paper.backendId || p.backendId }
              : p
          )
        );
      }
    } catch (err: any) {
      try {
        const fallback = await researchService.getPaperAnalysis(paper.id, paper);
        setAnalysis(fallback);
        if (fallback && setPapers) {
          setPapers((prev) =>
            prev.map((p) =>
              p.id === paper.id ? { ...p, analyzed: true } : p
            )
          );
        }
      } catch {
        addToast({
          type: 'error',
          title: 'Analysis Error',
          message: err?.message || 'Could not load analysis for paper.',
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleRegenerate = async () => {
    if (!activePaper) return;
    setIsRegenerating(true);
    try {
      let updated: PaperAnalysisType;
      if (authService.isAuthenticated()) {
        updated = await paperService.regenerateAnalysis(activePaper);
      } else {
        updated = await researchService.regenerateAnalysis(activePaper.id, activeTab, activePaper);
      }
      setAnalysis(updated);
      if (updated && setPapers) {
        setPapers((prev) =>
          prev.map((p) =>
            p.id === activePaper.id
              ? { ...p, analyzed: true, backendId: activePaper.backendId || p.backendId }
              : p
          )
        );
      }
      addToast({
        type: 'success',
        title: 'Analysis Regenerated',
        message: 'Analysis successfully updated in PostgreSQL database.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Regeneration Error',
        message: err?.message || 'Failed to regenerate analysis.',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExport = () => {
    if (!analysis) return;
    const payload = {
      paper_title: activePaper?.title,
      paper_authors: activePaper?.authors,
      source: activePaper?.source,
      source_type: analysis.sourceType,
      analyzed_at: analysis.analyzedAt,
      structured_analysis: {
        research_problem: analysis.researchProblem,
        research_objective: analysis.researchObjective,
        research_questions: analysis.researchQuestions,
        approach: analysis.approach,
        dataset: analysis.datasetText || analysis.methodology.dataset,
        algorithms_and_models: analysis.algorithmsAndModels,
        experimental_setup: analysis.experimentalSetup,
        key_results: analysis.keyResults,
        key_findings: analysis.keyFindings,
        contributions: analysis.contributions,
        limitations: analysis.limitations,
        future_work: analysis.futureWork,
        keywords: analysis.keywords,
      },
      full_analysis: analysis,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const safeTitle = (activePaper?.title || 'paper_analysis').slice(0, 30).replace(/[^a-z0-9]/gi, '_');
    downloadAnchor.setAttribute('download', `${safeTitle}_analysis.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({
      type: 'success',
      title: 'Export Generated',
      message: 'Structured academic analysis exported as JSON.',
    });
  };

  const handleCopySection = () => {
    if (!analysis) return;
    let contentToCopy = '';
    if (activeTab === 'overview') {
      contentToCopy = `${analysis.overview}\n\nProblem: ${analysis.researchProblem || 'N/A'}\nObjective: ${analysis.researchObjective || 'N/A'}\nApproach: ${analysis.approach || 'N/A'}`;
    } else if (activeTab === 'abstract') {
      contentToCopy = analysis.abstract;
    } else if (activeTab === 'summary') {
      contentToCopy = JSON.stringify(
        {
          contributions: analysis.contributions || analysis.summary.keyContributions,
          findings: analysis.keyFindings || analysis.summary.findings,
          future_work: analysis.futureWork || analysis.summary.implications,
        },
        null,
        2
      );
    } else if (activeTab === 'gaps') {
      contentToCopy = (analysis.limitations || analysis.researchGaps).join('\n');
    } else if (activeTab === 'literature') {
      contentToCopy = JSON.stringify(analysis.literatureReview, null, 2);
    } else if (activeTab === 'methodology') {
      contentToCopy = JSON.stringify(
        {
          dataset: analysis.datasetText || analysis.methodology.dataset,
          setup: analysis.experimentalSetup || analysis.methodology.preprocessing,
          models: analysis.algorithmsAndModels || [analysis.methodology.modelArchitecture],
          results: analysis.keyResults || [analysis.methodology.results],
          limitations: analysis.limitations || analysis.methodology.limitations,
        },
        null,
        2
      );
    }

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
    });
  };

  const filteredPaperList = validPapers.filter((p) =>
    p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.authors.some((a) => a.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'abstract', label: 'Abstract', icon: FileText },
    { key: 'summary', label: 'Summary & Impact', icon: CheckCircle2 },
    { key: 'gaps', label: 'Research Gaps', icon: AlertCircle },
    { key: 'literature', label: 'Literature Review', icon: Layers },
    { key: 'methodology', label: 'Methodology', icon: Cpu },
  ];

  if (validPapers.length === 0 || !activePaper) {

    return (
      <div className="space-y-6 animate-fade-in py-6">
        <div className="pb-3 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Paper Analysis Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Structured decomposition across contributions, research gaps, and methodologies
          </p>
        </div>
        <EmptyState
          icon={BookOpen}
          title="No Papers to Analyze"
          description="There are no papers ingested in this research workspace yet. Search and discover papers to begin deep academic synthesis."
          actionText="Discover Papers"
          onAction={() => navigate(currentProject ? `/research/${currentProject.id}/papers` : '/research/new')}
          secondaryActionText="Start New Research"
          onSecondaryAction={() => navigate('/research/new')}
        />
      </div>
    );
  }

  return (

    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading flex items-center gap-3">
              Paper Analysis Workspace
            </h1>
            <Badge variant="indigo" size="md" className="font-mono font-semibold shadow-glow-xs">
              AI Deep Synthesis
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Structured decomposition across contributions, research gaps, and methodologies
          </p>
        </div>
      </div>

      {/* Two-Column Responsive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Paper Selection Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="card-premium p-4 rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground font-heading">
                  Papers Ingested ({validPapers.length})
                </span>

                <span className="text-[11px] text-muted-foreground font-mono">
                  Select to inspect
                </span>
              </div>
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter paper list..."
                icon={<Search className="w-3.5 h-3.5" />}
                className="text-xs h-9 bg-background/50 border-border/70 rounded-xl"
              />
            </div>
          </div>

          {/* Scrollable Paper Cards List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredPaperList.map((paper) => {
              const isSelected = paper.id === selectedPaperId;
              return (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaperId(paper.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 relative group ${
                    isSelected
                      ? 'card-premium border-indigo-500/70 bg-gradient-to-br from-indigo-50/70 to-purple-50/30 dark:from-indigo-950/50 dark:to-purple-950/20 shadow-glow-xs translate-x-0.5'
                      : 'border-border/60 bg-card/70 hover:bg-secondary/60 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  {/* Left accent bar on active */}
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                  )}

                  <div className="flex items-center justify-between gap-1 mb-1.5 pl-1">
                    <Badge variant={paper.relevanceScore > 90 ? 'success' : 'indigo'} size="sm" className="font-semibold font-mono shadow-2xs">
                      {paper.relevanceScore}% Match
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                      <span>{paper.year}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground/80">{paper.source}</span>
                    </div>
                  </div>

                  <h4 className={`font-semibold line-clamp-2 leading-snug pl-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>
                    {paper.title}
                  </h4>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/40 pl-1 text-[11px] text-muted-foreground">
                    <p className="truncate flex-1">
                      {paper.authors.map((a) => a.name).join(', ')}
                    </p>
                    {paper.citationsCount !== undefined && paper.citationsCount > 0 && (
                      <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.2 rounded bg-secondary text-foreground">
                        {paper.citationsCount} cites
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Paper Analysis Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activePaper && (
            <div className="card-premium rounded-2xl overflow-hidden border border-border/80 shadow-sm">
              {/* Paper Header */}
              <div className="p-5 sm:p-6 border-b border-border/70 bg-gradient-to-r from-secondary/40 via-card to-secondary/30 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <Badge variant="indigo" size="sm" className="font-mono">{activePaper.source}</Badge>
                  <Badge variant="outline" size="sm" className="font-mono">{activePaper.year}</Badge>
                  {analysis?.sourceType && (
                    <Badge
                      variant={
                        analysis.sourceType === 'full_paper'
                          ? 'success'
                          : analysis.sourceType === 'abstract'
                          ? 'indigo'
                          : 'warning'
                      }
                      size="sm"
                      className="capitalize font-mono shadow-2xs"
                    >
                      {analysis.sourceType === 'full_paper'
                        ? 'Source: Full Paper PDF'
                        : analysis.sourceType === 'abstract'
                        ? 'Source: Peer-Reviewed Abstract'
                        : 'Source: Publication Metadata'}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-serif italic truncate max-w-xs">
                    {activePaper.journalOrConference}
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight leading-snug font-heading">
                  {activePaper.title}
                </h2>

                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {activePaper.authors.map((a) => a.name).join(', ')}
                </p>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="text-xs gap-1.5 h-8.5 rounded-xl border-border/80 hover:border-indigo-400 font-medium"
                    >
                      {isRegenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                      <span>{isRegenerating ? 'Analyzing...' : 'Regenerate'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySection}
                      className="text-xs gap-1.5 h-8.5 rounded-xl border-border/80 hover:border-indigo-400 font-medium"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="text-xs gap-1.5 h-8.5 rounded-xl border-border/80 hover:border-indigo-400 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </Button>
                  </div>

                  <a
                    href={activePaper.pdfUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline px-3 py-1.5 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <span>Original Manuscript</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Modern Segmented Navigation Tabs */}
              <div className="px-4 sm:px-6 pt-3.5 pb-1">
                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-secondary/50 rounded-xl border border-border/60 no-scrollbar">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold whitespace-nowrap rounded-lg transition-all ${
                          isActive
                            ? 'bg-card text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold border border-border/60 scale-[1.01]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="p-5 sm:p-6 min-h-[380px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
                      <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground font-heading">Analyzing research paper...</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {loadingStage || `Synthesizing structured findings for ${activePaper.title}...`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 font-mono bg-secondary/40 px-3 py-1.5 rounded-full border border-border/50">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <span>Non-hallucinatory AI Synthesis in progress</span>
                    </div>
                  </div>
                ) : !analysis ? (
                  <div className="text-xs text-muted-foreground">No analysis available.</div>
                ) : (
                  <div className="space-y-4 text-xs leading-relaxed">
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-card to-purple-50/30 dark:from-indigo-950/40 dark:via-card dark:to-purple-950/20 border border-indigo-500/20 shadow-xs relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.06] rounded-full blur-2xl pointer-events-none" />
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2 font-heading">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <span>Executive AI Takeaway</span>
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                              SYNTHESIZED
                            </span>
                          </div>
                          <div className="prose-academic">
                            <ReactMarkdown>{analysis.overview}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Research Problem & Objective */}
                        {(analysis.researchProblem || analysis.researchObjective) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="p-4 rounded-2xl border border-border/80 bg-card/90 shadow-2xs space-y-1.5">
                              <span className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                                Research Problem
                              </span>
                              <p className="text-foreground leading-relaxed text-xs">
                                {analysis.researchProblem || 'Not available in the provided paper content.'}
                              </p>
                            </div>
                            <div className="p-4 rounded-2xl border border-border/80 bg-card/90 shadow-2xs space-y-1.5">
                              <span className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                                Research Objective
                              </span>
                              <p className="text-foreground leading-relaxed text-xs">
                                {analysis.researchObjective || 'Not available in the provided paper content.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Proposed Approach */}
                        {analysis.approach && (
                          <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Proposed Approach
                            </span>
                            <p className="text-foreground leading-relaxed">
                              {analysis.approach}
                            </p>
                          </div>
                        )}

                        {/* Primary Methodology & Cohort */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3.5 rounded-lg border border-border bg-card">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Primary Methodology
                            </span>
                            <span className="font-bold text-foreground">
                              {analysis.algorithmsAndModels && analysis.algorithmsAndModels.length > 0
                                ? analysis.algorithmsAndModels.join(', ')
                                : analysis.methodology.modelArchitecture}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-lg border border-border bg-card">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Validation Cohort / Dataset
                            </span>
                            <span className="font-bold text-foreground">
                              {analysis.datasetText || analysis.methodology.dataset}
                            </span>
                          </div>
                        </div>

                        {/* Key Results Quantitative Metrics */}
                        {analysis.keyResults && analysis.keyResults.length > 0 && (
                          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                              Key Quantitative Benchmark Results
                            </span>
                            <ul className="space-y-1.5">
                              {analysis.keyResults.map((res, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2 text-foreground font-mono text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                  <span>{res}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Keywords */}
                        {analysis.keywords && analysis.keywords.length > 0 && (
                          <div className="pt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground font-semibold mr-1">Keywords:</span>
                            {analysis.keywords.map((kw, kIdx) => (
                              <Badge key={kIdx} variant="outline" size="sm">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: ABSTRACT */}
                    {activeTab === 'abstract' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">Extraction Source:</span>
                            <Badge
                              variant={
                                analysis.sourceType === 'full_paper'
                                  ? 'success'
                                  : analysis.sourceType === 'abstract'
                                  ? 'indigo'
                                  : 'warning'
                              }
                              size="sm"
                              className="capitalize font-mono"
                            >
                              {analysis.sourceType === 'full_paper'
                                ? 'Full Paper PDF'
                                : analysis.sourceType === 'abstract'
                                ? 'Peer-Reviewed Abstract'
                                : 'Publication Metadata'}
                            </Badge>
                          </div>
                          {analysis.analyzedAt && (
                            <span className="text-muted-foreground font-mono">
                              Analyzed: {new Date(analysis.analyzedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/40 border border-border/60">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                            Structured Abstract
                          </h4>
                          <p className="text-foreground text-xs leading-relaxed font-serif">
                            {analysis.abstract}
                          </p>
                        </div>

                        {activePaper.doi && (
                          <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Digital Object Identifier (DOI):</span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                              {activePaper.doi}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: SUMMARY & CONTRIBUTIONS */}
                    {activeTab === 'summary' && (
                      <div className="space-y-5">
                        {/* Key Contributions */}
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5">
                            Key Scientific Contributions
                          </h4>
                          <ul className="space-y-2">
                            {(analysis.contributions && analysis.contributions.length > 0
                              ? analysis.contributions
                              : analysis.summary.keyContributions
                            ).map((c, i) => (
                              <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-secondary/30 border border-border/40">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-foreground">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Empirical Findings */}
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-2.5">
                            Empirical Findings
                          </h4>
                          <ul className="space-y-2">
                            {(analysis.keyFindings && analysis.keyFindings.length > 0
                              ? analysis.keyFindings
                              : analysis.summary.findings
                            ).map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Future Work & Translation */}
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-2.5">
                            Future Work & Translational Frontiers
                          </h4>
                          <ul className="space-y-2">
                            {(analysis.futureWork && analysis.futureWork.length > 0
                              ? analysis.futureWork
                              : analysis.summary.implications
                            ).map((imp, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* TAB: RESEARCH GAPS */}
                    {activeTab === 'gaps' && (
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
                          Identified technical limitations and unaddressed research frontiers extracted from this paper.
                        </div>

                        {/* Explicit Research Questions */}
                        {analysis.researchQuestions && analysis.researchQuestions.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Explicit Research Questions
                            </h4>
                            <ul className="space-y-1.5">
                              {analysis.researchQuestions.map((q, qIdx) => (
                                <li key={qIdx} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border text-foreground">
                                  <span className="font-bold text-indigo-600 font-mono text-xs shrink-0">RQ{qIdx + 1}:</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="space-y-2.5">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                            Reported Limitations
                          </h4>
                          {(analysis.limitations && analysis.limitations.length > 0
                            ? analysis.limitations
                            : analysis.researchGaps
                          ).map((gap, gIdx) => (
                            <div key={gIdx} className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span className="font-bold text-foreground">Limitation #{gIdx + 1}</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed pl-6">
                                {gap}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: LITERATURE REVIEW */}
                    {activeTab === 'literature' && (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                          <span className="font-bold text-foreground block">Theoretical Framework / Approach</span>
                          <p className="text-muted-foreground leading-relaxed">
                            {analysis.approach || analysis.literatureReview.theoreticalFramework}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                          <span className="font-bold text-foreground block">Research Problem & Prior Foundation</span>
                          <p className="text-muted-foreground leading-relaxed">
                            {analysis.researchProblem || analysis.literatureReview.relationToPriorWork}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <span className="font-bold text-foreground block">Research Questions & Academic Debates</span>
                          <ul className="space-y-1.5">
                            {(analysis.researchQuestions && analysis.researchQuestions.length > 0
                              ? analysis.researchQuestions
                              : analysis.literatureReview.keyDebates
                            ).map((debate, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-2 text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                <span>{debate}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* TAB: METHODOLOGY */}
                    {activeTab === 'methodology' && (
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Dataset / Data Source</span>
                            <p className="font-medium text-foreground">
                              {analysis.datasetText || analysis.methodology.dataset}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Experimental Setup & Preprocessing</span>
                            <p className="font-medium text-foreground">
                              {analysis.experimentalSetup || analysis.methodology.preprocessing}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Algorithms & Models</span>
                          <p className="font-medium text-foreground">
                            {analysis.algorithmsAndModels && analysis.algorithmsAndModels.length > 0
                              ? analysis.algorithmsAndModels.join(', ')
                              : analysis.methodology.modelArchitecture}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Problem Formulation & Objective</span>
                          <p className="text-xs text-foreground bg-secondary/40 p-2.5 rounded-lg leading-relaxed">
                            {analysis.researchObjective || analysis.researchProblem || analysis.methodology.problemFormulation}
                          </p>
                        </div>

                        {analysis.methodology.trainingStrategy && (
                          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                              Methodological Architecture & Algorithmic Strategy
                            </span>
                            <div className="prose-academic text-xs leading-relaxed">
                              <ReactMarkdown>{analysis.methodology.trainingStrategy}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Benchmark Metrics & Results</span>
                          <div className="space-y-1 mt-1">
                            {analysis.keyResults && analysis.keyResults.length > 0 ? (
                              analysis.keyResults.map((r, rIdx) => (
                                <p key={rIdx} className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                  {r}
                                </p>
                              ))
                            ) : (
                              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                                {analysis.methodology.results}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-border bg-card space-y-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Methodological Limitations</span>
                          <ul className="space-y-1 mt-1">
                            {(analysis.limitations && analysis.limitations.length > 0
                              ? analysis.limitations
                              : analysis.methodology.limitations
                            ).map((lim, lIdx) => (
                              <li key={lIdx} className="text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span>{lim}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
