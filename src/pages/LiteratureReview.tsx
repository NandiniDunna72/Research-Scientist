import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { authService } from '../services/authService';
import { literatureReviewService } from '../services/literatureReviewService';
import { AnalyzedPaperSummary } from '../services/researchGapService';
import {
  LiteratureReviewGenerationResult,
  LiteratureThemeItem,
  LiteraturePaperSummaryItem,
} from '../types';
import {
  BookMarked,
  Search,
  Download,
  ArrowUpDown,
  Calendar,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  Check,
  Sparkles,
  RefreshCw,
  Cpu,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Info,
  Maximize2,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { Modal } from '../components/ui/Modal';

export const LiteratureReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, papers, addToast } = useResearch();

  const projectId = id || currentProject?.id || '1';

  // State
  const [data, setData] = useState<LiteratureReviewGenerationResult | null>(null);
  const [analyzedPapers, setAnalyzedPapers] = useState<AnalyzedPaperSummary[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
  const [isPaperSelectorOpen, setIsPaperSelectorOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'themes' | 'methodology' | 'comparative' | 'matrix'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Table filtering and sorting
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'year' | 'title'>('year');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedModalPaper, setSelectedModalPaper] = useState<LiteraturePaperSummaryItem | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Load existing literature review & analyzed papers on mount or project switch
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const isAuth = authService.isAuthenticated();

        if (isAuth) {
          // 1. Fetch available analyzed papers from backend
          let papersList = await literatureReviewService.getAnalyzedPapers(projectId);

          // Fallback to context papers if backend returned empty list
          if (papersList.length === 0 && papers.length > 0) {
            papersList = papers.map((p, idx) => ({
              id: p.backendId || idx + 1,
              title: p.title,
              authors: p.authors,
              publication_year: p.year,
              venue: p.journalOrConference,
              source: p.source,
              abstract: p.abstract,
              has_analysis: true,
            }));
          }

          setAnalyzedPapers(papersList);
          setSelectedPaperIds(papersList.map((p) => p.id));

          // 2. Fetch existing saved literature review
          const savedReview = await literatureReviewService.getLiteratureReview(projectId);
          if (savedReview) {
            setData(savedReview);
          } else {
            setData(null);
          }
        } else {
          // Unauthenticated / offline preview mode
          if (papers.length > 0) {
            const mockList = papers.map((p, idx) => ({
              id: p.backendId || idx + 1,
              title: p.title,
              authors: p.authors,
              publication_year: p.year,
              venue: p.journalOrConference,
              source: p.source,
              abstract: p.abstract,
              has_analysis: true,
            }));
            setAnalyzedPapers(mockList);
            setSelectedPaperIds(mockList.map((p) => p.id));
          }
          setData(null);
        }
      } catch (err) {
        console.warn('Error loading literature review data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [projectId, papers.length]);

  // Handle Generate Literature Review
  const handleGenerate = async () => {
    if (!authService.isAuthenticated()) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to generate a structured literature review.',
      });
      return;
    }

    if (analyzedPapers.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Analyzed Papers',
        message: 'Analyze research papers before generating a literature review.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const subsetIds = selectedPaperIds.length < analyzedPapers.length ? selectedPaperIds : undefined;
      const result = await literatureReviewService.generateLiteratureReview(projectId, subsetIds);
      setData(result);
      addToast({
        type: 'success',
        title: 'Literature Review Generated',
        message: 'Literature review generated successfully.',
      });
    } catch (err: any) {
      console.error('Literature review generation failed:', err);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: err.message || 'Literature review generation failed. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Regenerate Literature Review
  const handleRegenerate = async () => {
    if (!authService.isAuthenticated()) return;

    setIsRegenerating(true);
    try {
      const result = await literatureReviewService.regenerateLiteratureReview(projectId);
      setData(result);
      addToast({
        type: 'success',
        title: 'Literature Review Regenerated',
        message: 'Literature review regenerated successfully with the latest analysis.',
      });
    } catch (err: any) {
      console.error('Literature review regeneration failed:', err);
      addToast({
        type: 'error',
        title: 'Regeneration Failed',
        message: err.message || 'Failed to regenerate literature review.',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Filtered & Sorted Paper Summaries Matrix
  const filteredMatrix = useMemo(() => {
    if (!data || !data.paper_summaries) return [];
    return data.paper_summaries
      .filter((item) => {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMethod = item.methodology.toLowerCase().includes(query);
        const matchesDataset = item.dataset.toLowerCase().includes(query);
        const matchesFindings = typeof item.key_findings === 'string'
          ? item.key_findings.toLowerCase().includes(query)
          : Array.isArray(item.key_findings) && item.key_findings.some((f) => f.toLowerCase().includes(query));
        const matchesModels = Array.isArray(item.algorithms_models)
          ? item.algorithms_models.some((m) => m.toLowerCase().includes(query))
          : typeof item.algorithms_models === 'string' && item.algorithms_models.toLowerCase().includes(query);

        return matchesTitle || matchesMethod || matchesDataset || matchesFindings || matchesModels;
      })
      .sort((a, b) => {
        if (sortField === 'year') {
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          return sortAsc ? yearA - yearB : yearB - yearA;
        } else {
          return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
      });
  }, [data, search, sortField, sortAsc]);

  // Export Matrix to CSV
  const handleExportCSV = () => {
    if (!data || !data.paper_summaries) return;
    const headers = ['Paper', 'Year', 'Methodology', 'Dataset', 'Algorithms / Models', 'Key Findings', 'Limitations', 'Contribution', 'Relevance'];
    const rows = filteredMatrix.map((item) => {
      const modelsStr = Array.isArray(item.algorithms_models) ? item.algorithms_models.join('; ') : item.algorithms_models;
      const findingsStr = Array.isArray(item.key_findings) ? item.key_findings.join('; ') : item.key_findings;
      const limitationsStr = Array.isArray(item.limitations) ? item.limitations.join('; ') : item.limitations;

      return [
        `"${item.title.replace(/"/g, '""')}"`,
        item.year ?? '',
        `"${item.methodology.replace(/"/g, '""')}"`,
        `"${item.dataset.replace(/"/g, '""')}"`,
        `"${modelsStr.replace(/"/g, '""')}"`,
        `"${findingsStr.replace(/"/g, '""')}"`,
        `"${limitationsStr.replace(/"/g, '""')}"`,
        `"${item.contribution.replace(/"/g, '""')}"`,
        `"${item.relevance_to_topic.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `literature_review_matrix_${projectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Literature Matrix Exported',
      message: 'Downloaded CSV file successfully.',
    });
  };

  // Export Complete Academic Brief as Markdown
  const handleExportMarkdown = () => {
    if (!data) return;

    let md = `# Academic Literature Review: ${data.topic}\n\n`;
    md += `**Corpus Statistics:** ${data.papers_with_analysis} of ${data.papers_considered} analyzed papers (${data.research_landscape.research_period})\n\n`;
    md += `## 1. Introduction\n${data.introduction}\n\n`;
    md += `## 2. Research Landscape\n${data.research_landscape.overview}\n\n`;
    md += `**Dominant Approaches:** ${data.research_landscape.dominant_approaches.join(', ')}\n\n`;
    md += `## 3. Thematic Analysis\n`;
    data.themes.forEach((t, i) => {
      md += `### Theme ${i + 1}: ${t.title}\n`;
      md += `${t.description}\n\n`;
      md += `- **Common Approaches:** ${t.common_methods.join(', ')}\n`;
      md += `- **Key Findings:** ${t.key_findings.join(', ')}\n`;
      md += `- **Differences:** ${t.differences.join(', ')}\n\n`;
    });
    md += `## 4. Methodological Analysis\n${data.methodological_analysis.synthesis}\n\n`;
    md += `- **Common Methods:** ${data.methodological_analysis.common_methods.join(', ')}\n`;
    md += `- **Algorithms / Models:** ${data.methodological_analysis.algorithms_models.join(', ')}\n`;
    md += `- **Datasets:** ${data.methodological_analysis.datasets.join(', ')}\n`;
    md += `- **Evaluation Methods:** ${data.methodological_analysis.evaluation_methods.join(', ')}\n\n`;
    md += `## 5. Comparative Synthesis\n`;
    md += `### Similarities\n` + data.comparative_synthesis.similarities.map((s) => `- ${typeof s === 'string' ? s : s.claim}`).join('\n') + `\n\n`;
    md += `### Differences\n` + data.comparative_synthesis.differences.map((d) => `- ${typeof d === 'string' ? d : d.claim}`).join('\n') + `\n\n`;
    md += `### Strengths\n` + data.comparative_synthesis.strengths.map((st) => `- ${typeof st === 'string' ? st : st.claim}`).join('\n') + `\n\n`;
    md += `### Limitations\n` + data.comparative_synthesis.limitations.map((l) => `- ${typeof l === 'string' ? l : l.claim}`).join('\n') + `\n\n`;
    md += `## 6. Research Trends\n` + data.research_trends.map((tr) => `- ${typeof tr === 'string' ? tr : tr.claim}`).join('\n') + `\n\n`;
    md += `## 7. Recurring Limitations in Literature\n` + data.limitations_in_literature.map((lim) => `- ${typeof lim === 'string' ? lim : lim.claim}`).join('\n') + `\n\n`;
    md += `## 8. Integrated Research Gaps\n`;
    if (Array.isArray(data.research_gaps) && data.research_gaps.length > 0) {
      data.research_gaps.forEach((g: any) => {
        md += `- ${typeof g === 'string' ? g : g.gap_title || g.title || 'Research Gap'}\n`;
      });
    } else {
      md += `Research gap analysis has not been completed.\n`;
    }
    md += `\n## 9. Connection to Formulated Research Questions\n${data.research_question_connection}\n\n`;
    md += `## 10. Conclusion\n${data.conclusion}\n\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `literature_review_${projectId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Literature Review Exported',
      message: 'Downloaded complete literature review brief (Markdown).',
    });
  };

  const handleCopySection = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Section text copied to clipboard.',
    });
  };

  // ----------------------------------------------------
  // RENDER: Loading State
  // ----------------------------------------------------
  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingState
          title="Loading Literature Review Workspace"
          subtitle="Retrieving analyzed papers, thematic models, and synthesized matrices..."
          steps={[
            'Verifying project permissions & ownership...',
            'Querying analyzed manuscripts and multi-modal models...',
            'Fetching cross-paper research gaps and question anchors...',
            'Compiling structured literature review workspace...',
          ]}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Empty States
  // ----------------------------------------------------

  // Case 1: No project selected
  if (!currentProject && !id) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertCircle}
          title="Please select a research project"
          description="A research project is required to access or generate an academic literature review."
          actionText="Go to My Research"
          onAction={() => navigate('/research')}
        />
      </div>
    );
  }

  // Case 2: No analyzed papers available
  if (analyzedPapers.length === 0 && !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="pb-3 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-indigo-600" />
            Literature Review
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Transform analyzed research papers into a structured, doctoral-grade literature review.
          </p>
        </div>

        <EmptyState
          icon={AlertTriangle}
          title="Analyze research papers before generating a literature review"
          description="Literature review synthesis requires structured paper analyses (problem formulation, methodology, datasets, models, findings, and limitations). No analyzed papers were found in this project."
          actionText="Go to Paper Analysis"
          onAction={() => navigate(`/research/${projectId}/analysis`)}
          secondaryActionText="Discover Papers"
          onSecondaryAction={() => navigate(`/research/${projectId}/papers`)}
        />
      </div>
    );
  }

  // Case 3: Analyzed papers exist, but literature review not yet generated
  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-indigo-600" />
                Literature Review
              </h1>
              <Badge variant="indigo" size="md">
                {analyzedPapers.length} Papers Analyzed
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              <strong className="text-foreground">Topic: </strong>
              {currentProject?.topic || currentProject?.title || 'Advanced Academic Research'}
            </p>
          </div>
        </div>

        {/* Pre-generation Banner Card */}
        <Card className="border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-card to-card dark:from-indigo-950/20 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4.5 h-4.5" />
              <span>Ready for Cross-Paper Literature Synthesis</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Our academic engine will transform your {analyzedPapers.length} analyzed papers into a cohesive, doctoral-grade literature review covering research landscape, thematic grouping, methodological taxonomy, comparative synthesis, and connections to gaps & questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* Paper Selection Accordion */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsPaperSelectorOpen(!isPaperSelectorOpen)}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Papers Selected for Review ({selectedPaperIds.length} of {analyzedPapers.length})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{isPaperSelectorOpen ? 'Hide paper list' : 'Customize paper selection'}</span>
                  {isPaperSelectorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {isPaperSelectorOpen && (
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1">
                    <span>Select which analyzed papers to synthesize:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPaperIds.length === analyzedPapers.length) {
                          setSelectedPaperIds([]);
                        } else {
                          setSelectedPaperIds(analyzedPapers.map((p) => p.id));
                        }
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {selectedPaperIds.length === analyzedPapers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {analyzedPapers.map((paper) => {
                      const isSelected = selectedPaperIds.includes(paper.id);
                      return (
                        <label
                          key={paper.id}
                          className="flex items-start gap-2.5 p-2 rounded-lg border border-border/60 hover:bg-secondary/40 cursor-pointer transition-colors text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPaperIds([...selectedPaperIds, paper.id]);
                              } else {
                                setSelectedPaperIds(selectedPaperIds.filter((id) => id !== paper.id));
                              }
                            }}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground truncate block">
                              {paper.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {paper.publication_year ? `${paper.publication_year} • ` : ''}
                              {paper.venue || paper.source || 'Peer-Reviewed'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  Synthesis strictly grounds all claims in the selected papers without inventing citations.
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                isLoading={isGenerating}
                disabled={isGenerating || selectedPaperIds.length === 0}
                onClick={handleGenerate}
                className="gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Literature Review</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Full Generated Literature Review
  // ----------------------------------------------------
  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b2245]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <BookMarked className="w-5 h-5 animate-neon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              Literature Review
            </h1>
            <Badge variant="indigo" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              Module 6
            </Badge>
            <Badge variant="secondary" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              {data.papers_with_analysis} of {data.papers_considered} Papers Analyzed
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            <strong className="text-cyan-300 font-mono">Topic: </strong>
            <span className="text-slate-300">{data.topic}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            title="Download structured paper summary matrix as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMarkdown}
            className="text-xs gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            title="Download full academic literature review brief"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Brief</span>
          </Button>

          <button
            disabled={isRegenerating}
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
            title="Re-synthesize literature review with latest paper analysis and gaps"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate Review'}</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0a0d24]/90 rounded-2xl border border-[#1a2044] overflow-x-auto no-scrollbar w-fit shadow-lg backdrop-blur-xl">
        {[
          { key: 'all', label: 'All Review Sections', icon: FileText },
          { key: 'themes', label: 'Thematic Clusters', icon: Layers, count: data.themes.length },
          { key: 'methodology', label: 'Methodology & Comparison', icon: Cpu },
          { key: 'comparative', label: 'Gaps & Question Connection', icon: HelpCircle },
          { key: 'matrix', label: 'Paper Summary Matrix', icon: FileSpreadsheet, count: data.paper_summaries.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveViewTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/40 via-purple-600/40 to-cyan-500/30 border border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-[#141b3d] text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION A & B: INTRODUCTION & RESEARCH LANDSCAPE */}
      {(activeViewTab === 'all' || activeViewTab === 'themes') && (
        <div className="space-y-6">
          {/* Section A: Introduction */}
          <Card className="bg-gradient-to-r from-indigo-50/50 via-card to-card dark:from-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <BookMarked className="w-4 h-4" />
                  <span>Section A: Introduction & Theoretical Foundation</span>
                </div>
                <button
                  onClick={() => handleCopySection(data.introduction)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded"
                  title="Copy Introduction"
                >
                  {copiedText ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-foreground">
              <p className="whitespace-pre-line leading-relaxed font-serif text-[13px] sm:text-sm text-foreground/90">
                {data.introduction}
              </p>
            </CardContent>
          </Card>

          {/* Section B: Research Landscape */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Section B: Research Landscape & Temporal Evolution</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" size="sm">
                    {data.research_landscape.research_period}
                  </Badge>
                  <Badge variant="indigo" size="sm">
                    {data.papers_with_analysis} Manuscripts Analyzed
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <p className="text-foreground leading-relaxed">
                {data.research_landscape.overview}
              </p>

              {/* Dominant Approaches & Major Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-border/60">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1.5">
                  <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block text-indigo-600 dark:text-indigo-400">
                    Dominant Paradigms Across Corpus
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.research_landscape.dominant_approaches.map((app, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-medium text-foreground"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1.5">
                  <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block text-indigo-600 dark:text-indigo-400">
                    Identified Thematic Trajectories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.research_landscape.major_themes.map((themeName, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium"
                      >
                        {themeName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION C: THEMATIC ANALYSIS */}
      {(activeViewTab === 'all' || activeViewTab === 'themes') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-indigo-600" />
              <span>Section C: Thematic Analysis & Paper Groupings</span>
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {data.themes.length} Formulated Themes
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.themes.map((theme: LiteratureThemeItem, idx: number) => (
              <Card key={theme.theme_id || idx} className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {theme.theme_id || `Theme ${idx + 1}`}
                    </span>
                    <Badge variant="outline" size="sm">
                      {theme.paper_ids.length} Papers
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground mt-1.5 leading-snug">
                    {theme.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {theme.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs border-t border-border/60">
                  {/* Common methods */}
                  {theme.common_methods.length > 0 && (
                    <div>
                      <span className="font-semibold text-foreground text-[11px] block mb-1">
                        Common Methodologies:
                      </span>
                      <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
                        {theme.common_methods.map((cm, cIdx) => (
                          <li key={cIdx} className="leading-snug">{cm}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key findings */}
                  {theme.key_findings.length > 0 && (
                    <div>
                      <span className="font-semibold text-foreground text-[11px] block mb-1">
                        Key Synthesis Findings:
                      </span>
                      <ul className="space-y-0.5 text-foreground font-medium list-disc list-inside">
                        {theme.key_findings.map((kf, kIdx) => (
                          <li key={kIdx} className="leading-snug text-emerald-800 dark:text-emerald-400">{kf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Differences */}
                  {theme.differences.length > 0 && (
                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground block mb-0.5">
                        Divergent Approaches:
                      </span>
                      <p className="italic leading-relaxed">{theme.differences.join(' • ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION D: METHODOLOGICAL ANALYSIS */}
      {(activeViewTab === 'all' || activeViewTab === 'methodology') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <Cpu className="w-4.5 h-4.5 text-indigo-600" />
                <span>Section D: Methodological Analysis & Algorithmic Taxonomy</span>
              </div>
              <button
                onClick={() => handleCopySection(data.methodological_analysis.synthesis)}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
                title="Copy Methodology Synthesis"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Cross-cutting synthesis of algorithmic architectures, evaluation metrics, and experimental datasets.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border text-foreground leading-relaxed">
              <p className="font-serif text-[13px] leading-relaxed">
                {data.methodological_analysis.synthesis}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Common Methods */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Common Methods
                </span>
                <ul className="space-y-1 text-muted-foreground">
                  {data.methodological_analysis.common_methods.map((m, idx) => (
                    <li key={idx} className="line-clamp-2">• {m}</li>
                  ))}
                </ul>
              </div>

              {/* Algorithms & Models */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Algorithms & Models
                </span>
                <ul className="space-y-1 text-muted-foreground">
                  {data.methodological_analysis.algorithms_models.map((am, idx) => (
                    <li key={idx} className="line-clamp-2">• {am}</li>
                  ))}
                </ul>
              </div>

              {/* Datasets */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Benchmark Datasets
                </span>
                <ul className="space-y-1 text-muted-foreground">
                  {data.methodological_analysis.datasets.map((d, idx) => (
                    <li key={idx} className="line-clamp-2">• {d}</li>
                  ))}
                </ul>
              </div>

              {/* Evaluation Metrics */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-1.5">
                <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Evaluation Protocols
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.methodological_analysis.evaluation_methods.map((em, idx) => (
                    <Badge key={idx} variant="secondary" size="sm">
                      {em}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION E: COMPARATIVE SYNTHESIS */}
      {(activeViewTab === 'all' || activeViewTab === 'methodology') && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-indigo-600" />
            <span>Section E: High-Level Comparative Synthesis</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Similarities */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cross-Corpus Similarities</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {data.comparative_synthesis.similarities.map((item, idx) => (
                  <li key={idx} className="leading-snug">
                    • {typeof item === 'string' ? item : item.claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Differences */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                <ArrowUpDown className="w-4 h-4" />
                <span>Methodological Differences</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {data.comparative_synthesis.differences.map((item, idx) => (
                  <li key={idx} className="leading-snug">
                    • {typeof item === 'string' ? item : item.claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Literature Strengths</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {data.comparative_synthesis.strengths.map((item, idx) => (
                  <li key={idx} className="leading-snug">
                    • {typeof item === 'string' ? item : item.claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Corpus Bottlenecks</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {data.comparative_synthesis.limitations.map((item, idx) => (
                  <li key={idx} className="leading-snug">
                    • {typeof item === 'string' ? item : item.claim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION F & G: RESEARCH TRENDS & LIMITATIONS */}
      {(activeViewTab === 'all' || activeViewTab === 'comparative') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section F: Research Trends */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Section F: Research Findings & Evolutionary Trends</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {data.research_trends.map((tr, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-secondary/30 border border-border/60 flex items-start gap-2">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">#{idx + 1}</span>
                  <span className="text-foreground leading-snug">{typeof tr === 'string' ? tr : tr.claim}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section G: Recurring Limitations */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Section G: Synthesized Limitations in Literature</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {data.limitations_in_literature.map((lim, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2">
                  <span className="font-mono text-amber-700 dark:text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                  <span className="text-foreground leading-snug">{typeof lim === 'string' ? lim : lim.claim}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION H & I: RESEARCH GAPS & RESEARCH QUESTIONS CONNECTION */}
      {(activeViewTab === 'all' || activeViewTab === 'comparative') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section H: Research Gaps Integration */}
          <Card className="border-indigo-100 dark:border-indigo-900/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <span>Section H: Connection to Research Gaps</span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Grounded integration with identified project research gaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {Array.isArray(data.research_gaps) && data.research_gaps.length > 0 ? (
                data.research_gaps.map((g: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                    <span className="font-semibold text-foreground block">
                      {typeof g === 'string' ? g : g.gap_title || g.title || `Research Gap #${idx + 1}`}
                    </span>
                    {typeof g !== 'string' && g.why_it_matters && (
                      <p className="text-[11px] text-muted-foreground leading-snug">{g.why_it_matters}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-secondary/30 text-center text-muted-foreground italic text-xs">
                  Research gap analysis has not been completed.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section I: Connection to Research Questions */}
          <Card className="border-indigo-100 dark:border-indigo-900/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Section I: Connection to Research Questions</span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                How literature findings and gaps motivate the formulated research questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-foreground">
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border">
                <p className="leading-relaxed whitespace-pre-line font-serif text-[13px]">
                  {data.research_question_connection}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION J: CONCLUSION */}
      {(activeViewTab === 'all' || activeViewTab === 'comparative') && (
        <Card className="bg-gradient-to-r from-card via-card to-indigo-50/40 dark:to-indigo-950/20 border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Section J: Academic Synthesis Conclusion</span>
              </div>
              <button
                onClick={() => handleCopySection(data.conclusion)}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
                title="Copy Conclusion"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-foreground">
            <p className="whitespace-pre-line leading-relaxed font-serif text-[13px] sm:text-sm text-foreground/90">
              {data.conclusion}
            </p>
          </CardContent>
        </Card>
      )}

      {/* SECTION 5 & 15: PAPER SUMMARY MATRIX TABLE */}
      {(activeViewTab === 'all' || activeViewTab === 'matrix') && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
                <span>Section 5: Paper-Level Synthesis Matrix</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Structured academic matrix summarizing methodology, datasets, models, findings, and limitations for each analyzed paper.
              </p>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-2.5">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search matrix (models, methods, datasets)..."
                icon={<Search className="w-3.5 h-3.5" />}
                className="text-xs h-8.5 w-56 sm:w-64"
              />
            </div>
          </div>

          {/* Responsive Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold">
                    <th
                      onClick={() => {
                        if (sortField === 'title') setSortAsc(!sortAsc);
                        else { setSortField('title'); setSortAsc(true); }
                      }}
                      className="p-3 cursor-pointer hover:text-foreground whitespace-nowrap min-w-[220px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Paper & Authors</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => {
                        if (sortField === 'year') setSortAsc(!sortAsc);
                        else { setSortField('year'); setSortAsc(false); }
                      }}
                      className="p-3 cursor-pointer hover:text-foreground whitespace-nowrap w-20 text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Year</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3 whitespace-nowrap min-w-[170px]">Methodology</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Dataset</th>
                    <th className="p-3 whitespace-nowrap min-w-[160px]">Models / Algorithms</th>
                    <th className="p-3 min-w-[220px]">Key Findings</th>
                    <th className="p-3 min-w-[200px]">Limitations</th>
                    <th className="p-3 text-center whitespace-nowrap w-16">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMatrix.map((item: LiteraturePaperSummaryItem, idx: number) => {
                    const authorsStr = Array.isArray(item.authors) ? item.authors.join(', ') : item.authors;
                    const modelsStr = Array.isArray(item.algorithms_models) ? item.algorithms_models.join(', ') : item.algorithms_models;
                    const findingsStr = Array.isArray(item.key_findings) ? item.key_findings.join('. ') : item.key_findings;
                    const limitationsStr = Array.isArray(item.limitations) ? item.limitations.join('. ') : item.limitations;

                    return (
                      <tr key={item.paper_id || idx} className="hover:bg-secondary/30 transition-colors">
                        {/* Paper & Authors */}
                        <td className="p-3">
                          <div className="font-semibold text-foreground leading-snug line-clamp-2">
                            {item.title}
                          </div>
                          {authorsStr && (
                            <div className="text-[11px] text-muted-foreground mt-0.5 italic truncate max-w-[200px]">
                              {authorsStr}
                            </div>
                          )}
                        </td>

                        {/* Year */}
                        <td className="p-3 font-mono text-center font-semibold text-muted-foreground">
                          {item.year || '—'}
                        </td>

                        {/* Methodology */}
                        <td className="p-3">
                          <span className="line-clamp-2 text-foreground font-medium">
                            {item.methodology}
                          </span>
                        </td>

                        {/* Dataset */}
                        <td className="p-3 text-muted-foreground">
                          <span className="line-clamp-2">{item.dataset}</span>
                        </td>

                        {/* Models */}
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium line-clamp-2">
                            {modelsStr}
                          </span>
                        </td>

                        {/* Key Findings */}
                        <td className="p-3 text-foreground leading-relaxed">
                          <span className="line-clamp-2">{findingsStr}</span>
                        </td>

                        {/* Limitations */}
                        <td className="p-3 text-muted-foreground leading-relaxed">
                          <span className="line-clamp-2">{limitationsStr}</span>
                        </td>

                        {/* Details Modal Trigger */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedModalPaper(item)}
                            className="p-1.5 rounded-lg hover:bg-secondary text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                            title="View complete paper synthesis"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAPER DETAILS MODAL (Section 15 Expand/Details) */}
      <Modal
        isOpen={!!selectedModalPaper}
        onClose={() => setSelectedModalPaper(null)}
        title={selectedModalPaper?.title || 'Paper Synthesis Details'}
        description={`Publication Year: ${selectedModalPaper?.year || 'N/A'} • Authors: ${Array.isArray(selectedModalPaper?.authors) ? selectedModalPaper?.authors.join(', ') : selectedModalPaper?.authors || 'Research Team'}`}
        maxWidth="2xl"
      >
        {selectedModalPaper && (
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Methodology
                </span>
                <p className="text-foreground leading-relaxed">{selectedModalPaper.methodology}</p>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Datasets Analyzed
                </span>
                <p className="text-foreground leading-relaxed">{selectedModalPaper.dataset}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
              <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Algorithms & Models
              </span>
              <p className="text-foreground leading-relaxed">
                {Array.isArray(selectedModalPaper.algorithms_models) ? selectedModalPaper.algorithms_models.join(', ') : selectedModalPaper.algorithms_models}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase tracking-wider">
                Key Empirical Findings
              </span>
              <p className="text-foreground leading-relaxed">
                {Array.isArray(selectedModalPaper.key_findings) ? selectedModalPaper.key_findings.join('. ') : selectedModalPaper.key_findings}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="font-semibold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider">
                Reported Limitations
              </span>
              <p className="text-foreground leading-relaxed">
                {Array.isArray(selectedModalPaper.limitations) ? selectedModalPaper.limitations.join('. ') : selectedModalPaper.limitations}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <span className="font-semibold text-foreground block text-[11px]">Primary Scientific Contribution</span>
                <p className="text-muted-foreground leading-relaxed">{selectedModalPaper.contribution}</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                <span className="font-semibold text-foreground block text-[11px]">Relevance to Project Topic</span>
                <p className="text-muted-foreground leading-relaxed">{selectedModalPaper.relevance_to_topic}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedModalPaper(null)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
