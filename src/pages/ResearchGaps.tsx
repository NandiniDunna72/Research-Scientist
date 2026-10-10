import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { researchService } from '../services/researchService';
import { researchGapService, AnalyzedPaperSummary } from '../services/researchGapService';
import { researchQuestionService } from '../services/researchQuestionService';
import { authService } from '../services/authService';
import { ResearchGap, ResearchQuestion, ResearchGapAnalysisReport, ResearchQuestionGenerationResult } from '../types';
import { 
  AlertCircle, 
  Sparkles, 
  Bookmark, 
  Copy, 
  Check, 
  BarChart3, 
  PieChart as PieIcon,
  HelpCircle,
  Loader2,
  FileText,
  RefreshCw,
  Layers,
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Compass,
  Target
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const ResearchGaps: React.FC<{ defaultTab?: 'gaps' | 'questions' }> = ({ defaultTab }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast } = useResearch();

  const projectId = id || currentProject?.id || '1';

  // State
  const [gaps, setGaps] = useState<ResearchGap[]>([]);
  const [report, setReport] = useState<ResearchGapAnalysisReport | null>(null);
  const [analyzedPapers, setAnalyzedPapers] = useState<AnalyzedPaperSummary[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<'all' | 'subset'>('all');
  const [isPaperSelectorOpen, setIsPaperSelectorOpen] = useState(false);
  const [questions, setQuestions] = useState<ResearchQuestion[]>([]);
  const [questionsReport, setQuestionsReport] = useState<ResearchQuestionGenerationResult | null>(null);
  const [mainTab, setMainTab] = useState<'all' | 'gaps' | 'questions'>(
    defaultTab === 'questions' ? 'questions' : 'all'
  );
  const [activeQuestionTab, setActiveQuestionTab] = useState<'all' | 'primary' | 'secondary'>('all');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (defaultTab === 'questions') {
      setMainTab('questions');
    }
  }, [defaultTab]);

  // Load research gaps, analyzed papers, and questions on mount or project change
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const isAuth = authService.isAuthenticated();

        if (isAuth) {
          // 1. Fetch available analyzed papers from backend
          const papersList = await researchGapService.getAnalyzedPapers(projectId);
          setAnalyzedPapers(papersList);
          setSelectedPaperIds(papersList.map((p) => p.id));

          // 2. Fetch existing research gap analysis report
          const savedReport = await researchGapService.getLatestGaps(projectId);
          if (savedReport && savedReport.gaps && savedReport.gaps.length > 0) {
            setReport(savedReport);
            setGaps(savedReport.gaps);
          } else {
            // If no analysis exists yet in backend, load mock or fallback
            const fallbackGaps = await researchService.getResearchGaps(projectId);
            setGaps(fallbackGaps);
          }

          // 3. Fetch structured research questions from PostgreSQL backend
          const savedQuestionsReport = await researchQuestionService.getResearchQuestions(projectId);
          if (savedQuestionsReport && savedQuestionsReport.research_questions && savedQuestionsReport.research_questions.length > 0) {
            setQuestionsReport(savedQuestionsReport);
            setQuestions(savedQuestionsReport.research_questions);
          } else {
            const loadedQuestions = await researchService.getResearchQuestions(projectId);
            setQuestions(loadedQuestions);
          }
        } else {
          // Unauthenticated fallback
          const loadedGaps = await researchService.getResearchGaps(projectId);
          setGaps(loadedGaps);
          const loadedQuestions = await researchService.getResearchQuestions(projectId);
          setQuestions(loadedQuestions);
        }
      } catch (err: any) {
        console.warn('Error loading research gap / question data:', err);
        const fallback = await researchService.getResearchGaps(projectId);
        setGaps(fallback);
        const fallbackQ = await researchService.getResearchQuestions(projectId);
        setQuestions(fallbackQ);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Smoothly scroll to questions section if requested via route or hash
  useEffect(() => {
    if (defaultTab === 'questions' || window.location.hash === '#research-questions') {
      const el = document.getElementById('research-questions');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  }, [defaultTab]);

  // Execute Cross-Paper Research Gap Synthesis

  const handleRunAnalysis = async (forceRegenerate: boolean = false) => {
    if (!authService.isAuthenticated()) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to perform AI cross-paper research gap analysis.',
      });
      return;
    }

    // Determine target paper IDs if subset mode
    const targetPaperIds = selectionMode === 'subset' ? selectedPaperIds : undefined;

    if (selectionMode === 'subset' && (!targetPaperIds || targetPaperIds.length === 0)) {
      addToast({
        type: 'warning',
        title: 'No Papers Selected',
        message: 'Please select at least 1 analyzed paper for research gap analysis.',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let resultReport: ResearchGapAnalysisReport;
      if (forceRegenerate && report) {
        resultReport = await researchGapService.regenerateGaps(projectId, targetPaperIds);
      } else {
        resultReport = await researchGapService.analyzeGaps(projectId, targetPaperIds);
      }

      setReport(resultReport);
      setGaps(resultReport.gaps);

      addToast({
        type: 'success',
        title: forceRegenerate ? 'Gaps Regenerated' : 'Research Gaps Identified',
        message: `Successfully synthesized ${resultReport.gaps.length} grounded research gaps across ${resultReport.papers_analyzed} papers.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: err.message || 'Could not complete research gap analysis. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSelectPaper = (paperId: number) => {
    setSelectedPaperIds((prev) =>
      prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId]
    );
  };

  const handleSelectAllAnalyzed = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedPaperIds(analyzedPapers.map((p) => p.id));
    } else {
      setSelectedPaperIds([]);
    }
  };

  const handleGenerateQuestions = async (forceRegenerate: boolean = false) => {
    if (!projectId) {
      addToast({
        type: 'warning',
        title: 'Project Required',
        message: 'Please select a research project.',
      });
      return;
    }

    if (!authService.isAuthenticated()) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to generate research questions.',
      });
      return;
    }

    if (analyzedPapers.length === 0) {
      addToast({
        type: 'warning',
        title: 'Analyzed Papers Required',
        message: 'Analyze research papers before generating research questions.',
      });
      return;
    }

    if (!report && gaps.length === 0) {
      addToast({
        type: 'warning',
        title: 'Research Gaps Required',
        message: 'Identify research gaps before generating research questions.',
      });
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      let resultQ: ResearchQuestionGenerationResult;
      if (forceRegenerate && (questionsReport || questions.length > 0)) {
        resultQ = await researchQuestionService.regenerateResearchQuestions(projectId);
      } else {
        resultQ = await researchQuestionService.generateResearchQuestions(projectId);
      }

      setQuestionsReport(resultQ);
      setQuestions(resultQ.research_questions);

      addToast({
        type: 'success',
        title: forceRegenerate ? 'Questions Regenerated' : 'Research Questions Generated',
        message: 'Research questions generated successfully.',
      });
    } catch (err: any) {
      const msg = err?.message || 'Research question generation failed. Please try again.';
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: msg,
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleToggleSave = async (questionId: string) => {
    const updated = await researchService.toggleSaveQuestion(questionId, questions);
    setQuestions(updated);
    addToast({
      type: 'info',
      title: 'Question Updated',
      message: 'Saved to your research question portfolio.',
    });
  };


  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
    });
  };

  // Recharts Data Prep
  const gapFrequencyData = useMemo(() => {
    return gaps.map((g) => ({
      name: `Gap #${g.priority || g.gapNumber}`,
      frequency: g.frequencyScore,
      papers: (g.affected_papers || g.sourcePaperIds || []).length,
    }));
  }, [gaps]);

  const importanceData = useMemo(() => {
    const highCount = gaps.filter((g) => (g.confidence || g.importance) === 'High').length;
    const medCount = gaps.filter((g) => (g.confidence || g.importance) === 'Medium').length;
    const lowCount = gaps.filter((g) => (g.confidence || g.importance) === 'Low').length;

    return [
      { name: 'High Confidence', value: highCount, color: '#6366f1' },
      { name: 'Medium Confidence', value: medCount, color: '#f59e0b' },
      { name: 'Low Confidence', value: lowCount, color: '#10b981' },
    ].filter((d) => d.value > 0);
  }, [gaps]);

  // Analyzed count evaluation
  const activeAnalyzedCount = report?.papers_analyzed || analyzedPapers.length;
  const showFewPapersWarning = activeAnalyzedCount > 0 && activeAnalyzedCount < 3;
  const isZeroPapersEmptyState = analyzedPapers.length === 0 && gaps.length === 0 && !isLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {mainTab === 'questions' ? 'Research Question Generation' : mainTab === 'gaps' ? 'Research Gaps Analysis' : 'Research Gaps & Questions'}
            </h1>
            {mainTab !== 'questions' && (
              <Badge variant="warning" size="md">
                {gaps.length} Unsolved Frontiers
              </Badge>
            )}
            {mainTab !== 'gaps' && questions.length > 0 && (
              <Badge variant="indigo" size="md">
                {questions.length} Formulated Questions
              </Badge>
            )}
            {report && (
              <Badge variant="indigo" size="sm" className="hidden sm:inline-flex gap-1 items-center">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                Verified Synthesis
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            {mainTab === 'questions'
              ? 'Meaningful, research-oriented questions and hypotheses rigorously derived from identified research gaps and literature evidence'
              : 'Critical limitations and domain discrepancies extracted from analyzed papers, mapped to grounded research questions'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {mainTab !== 'questions' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunAnalysis(!!report)}
              disabled={isAnalyzing}
              className="text-xs gap-1.5 shadow-sm border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : report ? (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : report ? 'Regenerate Gaps' : 'Analyze Research Gaps'}</span>
            </Button>
          )}

          {mainTab === 'questions' && questions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateQuestions(true)}
              disabled={isGeneratingQuestions || isAnalyzing}
              className="text-xs gap-1.5 shadow-sm border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              {isGeneratingQuestions ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{isGeneratingQuestions ? 'Regenerating…' : 'Regenerate Questions'}</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleGenerateQuestions(false)}
            disabled={isGeneratingQuestions || isAnalyzing}
            className="text-xs gap-1.5 shadow-sm"
          >
            {isGeneratingQuestions ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lightbulb className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingQuestions ? 'Generating research questions…' : 'Generate Research Questions'}</span>
          </Button>
        </div>
      </div>

      {/* Top View Selector Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2.5">
        <button
          type="button"
          onClick={() => setMainTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mainTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          All Overview
        </button>
        <button
          type="button"
          onClick={() => setMainTab('gaps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            mainTab === 'gaps'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Research Gaps ({gaps.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab('questions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            mainTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Research Questions ({questions.length})</span>
        </button>
      </div>

      {/* Research Gaps Section */}
      {mainTab !== 'questions' && (
        <>
          {/* Paper Selection & Filter Toolbar */}
      {analyzedPapers.length > 0 && (
        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Paper Scope:
            </span>

            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setSelectionMode('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectionMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Analyzed Papers ({analyzedPapers.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode('subset');
                  setIsPaperSelectorOpen(true);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectionMode === 'subset'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Selected Subset ({selectedPaperIds.length})
              </button>
            </div>

            {selectionMode === 'subset' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaperSelectorOpen(!isPaperSelectorOpen)}
                className="text-xs h-7 px-2 text-indigo-600 dark:text-indigo-400"
              >
                {isPaperSelectorOpen ? 'Hide Paper List' : 'Choose Papers'}
              </Button>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground">
            {selectionMode === 'all'
              ? `Analyzing all ${analyzedPapers.length} analyzed papers in project.`
              : `${selectedPaperIds.length} of ${analyzedPapers.length} papers selected for gap synthesis.`}
          </div>
        </div>
      )}

      {/* Collapsible Paper Selection List */}
      {isPaperSelectorOpen && selectionMode === 'subset' && analyzedPapers.length > 0 && (
        <div className="p-4 rounded-xl bg-background border border-border shadow-xs space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-semibold text-foreground">Select Papers for Cross-Paper Analysis:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAllAnalyzed(true)}
                className="h-6 text-[11px] px-2"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAllAnalyzed(false)}
                className="h-6 text-[11px] px-2 text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {analyzedPapers.map((p) => {
              const isChecked = selectedPaperIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleSelectPaper(p.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-indigo-400/80 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-border/70 hover:bg-secondary/40'
                  }`}
                >
                  <div className="mt-0.5 text-indigo-600">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.venue || p.source || 'Academic Publication'} {p.publication_year ? `(${p.publication_year})` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Banner State (Requirement 21) */}
      {isAnalyzing && (
        <Card className="border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 animate-pulse">
          <CardContent className="p-4 flex items-center gap-3 text-xs text-indigo-950 dark:text-indigo-200">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
            <div>
              <p className="font-semibold">Analyzing research patterns across selected papers...</p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                Comparing methodologies, datasets, quantitative benchmarks, limitations, and future frontiers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Alert Banner (< 3 Papers Recommended - Requirement 4) */}
      {(showFewPapersWarning || report?.warning) && !isAnalyzing && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block">Recommended Minimum Cohort Notice</strong>
            <span>
              {report?.warning || 'At least 3 analyzed papers are recommended for reliable cross-paper research gap identification.'}
            </span>
          </div>
        </div>
      )}

      {/* Empty State (< 1 paper analyzed - Requirement 22) */}
      {isZeroPapersEmptyState && (
        <Card className="border-dashed border-2 border-border py-10">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-base text-foreground">No Analyzed Papers Available</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Research gap analysis requires analyzed papers. Analyze additional papers before generating research gaps.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/research/${projectId}/analysis`)}
              className="text-xs gap-1.5 mt-2"
            >
              <span>Go to Paper Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Synthesis Overview Card (Requirement 12) */}
      {report && (
        <Card className="border-border bg-gradient-to-br from-card via-card to-secondary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Cross-Paper Research Gap Synthesis Report
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">
                {report.papers_analyzed} Papers Analyzed • {report.gaps_identified} Grounded Gaps
              </span>
            </div>
            {report.most_important_gap && (
              <CardDescription className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                Most Important Frontier: {report.most_important_gap}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-1">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {report.overall_summary}
            </p>

            {report.major_categories && report.major_categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-foreground mr-1">Major Gap Categories:</span>
                {report.major_categories.map((cat, idx) => (
                  <Badge key={idx} variant="outline" size="sm" className="bg-secondary/50 font-normal">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual Analytics Row: Gap Frequency & Importance Distribution */}
      {gaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gap Frequency Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Gap Prevalence & Evidence Weight</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Frequency score vs. source paper citations</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gapFrequencyData}>
                    <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} stroke="#888888" tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '0.5rem', 
                        fontSize: '11px' 
                      }} 
                    />
                    <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} name="Prevalence Score" />
                    <Bar dataKey="papers" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="Source Papers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gap Importance Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Confidence & Criticality Breakdown</span>
                <PieIcon className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Prioritization matrix for thesis / grant formulation</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="h-48 w-48 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={importanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {importanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '0.5rem', 
                        fontSize: '11px' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 text-xs w-full sm:w-auto">
                {importanceData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-secondary/40 border border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="font-medium text-foreground">{d.name}</span>
                    </div>
                    <strong className="font-mono text-foreground">{d.value} gaps</strong>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Identified Research Gaps List (Requirements 5, 7, 8, 9, 13, 20, 24) */}
      {gaps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Identified Research Gaps ({gaps.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Prioritized by evidence weight & research opportunity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap) => {
              const priorityNum = gap.priority || gap.gapNumber;
              const confidenceVal = gap.confidence || gap.importance || 'High';
              const categoryVal = gap.category || gap.domain || 'Methodological Gap';
              const affectedPapersList = gap.affected_papers || gap.sourcePaperIds || [];
              const evidenceItems = Array.isArray(gap.evidence)
                ? gap.evidence
                : [gap.evidence];

              return (
                <Card key={gap.id} className="border-border hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3.5 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-[11px]">
                            Gap #{priorityNum}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-semibold font-mono text-[11px]">
                            Priority {priorityNum}
                          </span>
                          <Badge variant="outline" size="sm" className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40">
                            {categoryVal}
                          </Badge>
                          <Badge
                            variant={confidenceVal === 'High' ? 'default' : confidenceVal === 'Medium' ? 'warning' : 'secondary'}
                            size="sm"
                          >
                            {confidenceVal} Confidence
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          Score: {gap.frequencyScore}/10
                        </span>
                      </div>

                      {/* Gap Title */}
                      <h3 className="font-bold text-sm text-foreground leading-snug">
                        {gap.title || gap.gap_title}
                      </h3>

                      {/* Gap Description */}
                      <p className="text-muted-foreground leading-relaxed">
                        {gap.description}
                      </p>

                      {/* Why It Matters */}
                      {gap.why_it_matters && (
                        <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 space-y-1">
                          <span className="text-[10px] font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
                            Why It Matters
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {gap.why_it_matters}
                          </p>
                        </div>
                      )}

                      {/* Evidence snippet */}
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 space-y-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Empirical Evidence from Literature
                        </span>
                        {evidenceItems.map((ev, evIdx) => (
                          <p key={evIdx} className="text-foreground leading-relaxed italic">
                            • "{ev}"
                          </p>
                        ))}
                      </div>

                      {/* Potential Research Direction */}
                      <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                          Potential Research Direction
                        </span>
                        <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                          {gap.potential_direction || gap.potentialResearchOpportunity}
                        </p>
                      </div>
                    </div>

                    {/* Footer with Traceable Affected Papers (Requirement 24) */}
                    <div className="pt-3 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground mt-2">
                      <div className="flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">Affected / Cited Papers:</span>{' '}
                          <span>{affectedPapersList.join(' • ')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {/* Research Question Generation Module (Module 4) */}
      {mainTab !== 'gaps' && (
        <div id="research-questions" className={`space-y-5 ${mainTab === 'all' ? 'pt-6 border-t border-border' : ''}`}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Research Question Generation
              </h2>
              {questions.length > 0 && (
                <Badge variant="indigo" size="md">
                  {questions.length} Formulated Questions
                </Badge>
              )}
              {questionsReport && (
                <Badge variant="success" size="sm" className="hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Grounded Synthesis
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Meaningful, research-oriented questions and hypotheses rigorously derived from identified research gaps and literature evidence
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {questions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateQuestions(true)}
                disabled={isGeneratingQuestions || isAnalyzing}
                className="text-xs gap-1.5 shadow-sm border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                {isGeneratingQuestions ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{isGeneratingQuestions ? 'Regenerating…' : 'Regenerate Questions'}</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateQuestions(false)}
              disabled={isGeneratingQuestions || isAnalyzing}
              className="text-xs gap-1.5 shadow-sm"
            >
              {isGeneratingQuestions ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingQuestions ? 'Generating research questions…' : 'Generate Research Questions'}</span>
            </Button>
          </div>
        </div>

        {/* Loading Banner State (Requirement 15) */}
        {isGeneratingQuestions && (
          <Card className="border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 animate-pulse">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3.5 text-xs text-indigo-950 dark:text-indigo-200">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Generating research questions…</p>
                <p className="text-[11px] text-indigo-700/90 dark:text-indigo-300/90">
                  Synthesizing primary problem formulation and secondary experimental hypotheses grounded in empirical research gaps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State: Case 2 (No Analyzed Papers) */}
        {analyzedPapers.length === 0 && !isGeneratingQuestions && !isLoading && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Analyze research papers before generating research questions.</strong>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  Research questions require empirical paper analysis to establish supporting evidence and experimental methodology.
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/research/${projectId}/analysis`)}
              className="text-xs shrink-0 gap-1.5"
            >
              <span>Go to Paper Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Empty State: Case 3 (No Research Gaps) */}
        {analyzedPapers.length > 0 && gaps.length === 0 && !isGeneratingQuestions && !isLoading && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Identify research gaps before generating research questions.</strong>
                <span className="text-[11px] text-indigo-800 dark:text-indigo-300">
                  Research questions must directly resolve verified research gaps identified in your paper cohort.
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleRunAnalysis(false)}
              disabled={isAnalyzing}
              className="text-xs shrink-0 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Research Gaps</span>
            </Button>
          </div>
        )}

        {/* Empty State: Ready to Generate */}
        {questions.length === 0 && gaps.length > 0 && !isGeneratingQuestions && !isLoading && (
          <Card className="border-dashed border-2 border-border py-8">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground">No Research Questions Generated Yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Formulate grounded, actionable research questions directly addressing your {gaps.length} identified research gaps across {activeAnalyzedCount} analyzed papers.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleGenerateQuestions(false)}
                disabled={isGeneratingQuestions || isAnalyzing}
                className="text-xs gap-1.5 mt-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Research Questions</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Questions Display Area */}
        {questions.length > 0 && (
          <div className="space-y-5 animate-fade-in">
            {/* Overall Direction & Recommended Next Step (Section 10) */}
            {questionsReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Card className="border-border bg-gradient-to-br from-indigo-50/30 to-card dark:from-indigo-950/10">
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                      <Compass className="w-4 h-4" />
                      <span className="uppercase tracking-wider text-[11px]">Overall Research Direction</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {questionsReport.overall_research_direction}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-gradient-to-br from-emerald-50/30 to-card dark:from-emerald-950/10">
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Target className="w-4 h-4" />
                      <span className="uppercase tracking-wider text-[11px]">Recommended Next Step</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {questionsReport.recommended_next_step}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Primary Research Question Spotlight Card (Section 6) */}
            {(() => {
              const primaryQ = questionsReport?.primary_research_question ||
                questions.find((q) => (q.type || q.question_type) === 'Primary Research Question') ||
                questions[0];

              if (!primaryQ) return null;
              const isSaved = !!primaryQ.saved;
              const relatedTitle = primaryQ.related_gap_title || `Gap #${primaryQ.related_gap_id || 1}`;

              return (
                <Card className="border-2 border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-50/40 via-card to-background dark:from-indigo-950/20 shadow-xs">
                  <CardContent className="p-5 sm:p-6 space-y-4 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[11px] shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            PRIMARY RESEARCH QUESTION
                          </span>
                          <Badge variant="indigo" size="sm">
                            Feasibility: {primaryQ.feasibility || 'High'}
                          </Badge>
                          <Badge variant="warning" size="sm">
                            Priority: {primaryQ.priority || 'High'}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Targeting: <strong>{relatedTitle}</strong>
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-snug pt-1">
                          "{primaryQ.question}"
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyQuestion(primaryQ.id, primaryQ.question)}
                          className="h-8 text-xs gap-1"
                          title="Copy Question"
                        >
                          {copiedId === primaryQ.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </Button>

                        <Button
                          variant={isSaved ? 'subtle' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleSave(primaryQ.id)}
                          className="h-8 text-xs gap-1"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Three-column details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-background/80 border border-border space-y-1">
                        <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                          Motivation & Theoretical Value
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {primaryQ.motivation || primaryQ.rationale || primaryQ.hypothesis}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-background/80 border border-border space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Supporting Literature Evidence
                        </span>
                        <p className="text-foreground leading-relaxed italic">
                          {Array.isArray(primaryQ.supporting_evidence) ? primaryQ.supporting_evidence.join(' • ') : primaryQ.supporting_evidence}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-background/80 border border-border space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                          Expected Experimental Investigation
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {primaryQ.expected_investigation || primaryQ.suggestedMethodology}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Filter Tabs & Toolbar (Requirement 14) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-foreground mr-1">Filter:</span>
                <button
                  type="button"
                  onClick={() => setActiveQuestionTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeQuestionTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuestionTab('primary')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeQuestionTab === 'primary'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Primary (1)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuestionTab('secondary')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeQuestionTab === 'secondary'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Secondary ({Math.max(0, questions.length - 1)})
                </button>
              </div>

              {/* Category pill filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground text-[11px]">Type:</span>
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value)}
                  className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Question Types</option>
                  <option value="Primary Research Question">Primary Research Question</option>
                  <option value="Secondary Research Question">Secondary Research Question</option>
                  <option value="Methodological Question">Methodological Question</option>
                  <option value="Comparative Question">Comparative Question</option>
                  <option value="Dataset/Evaluation Question">Dataset/Evaluation Question</option>
                  <option value="Application/Practical Question">Application/Practical Question</option>
                  <option value="Optimization Question">Optimization Question</option>
                  <option value="Integration Question">Integration Question</option>
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {questions
                .filter((q) => {
                  const isPrimary = (q.type || q.question_type) === 'Primary Research Question';
                  if (activeQuestionTab === 'primary' && !isPrimary) return false;
                  if (activeQuestionTab === 'secondary' && isPrimary) return false;
                  if (selectedQuestionType !== 'all') {
                    const currentType = q.type || q.question_type || '';
                    if (currentType !== selectedQuestionType) return false;
                  }
                  return true;
                })
                .map((q) => {
                  const isSaved = !!q.saved;
                  const qType = q.type || q.question_type || 'Secondary Research Question';
                  const gapTitle = q.related_gap_title || `Gap #${q.related_gap_id || 1}`;

                  return (
                    <Card key={q.id} className="border-border hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
                      <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={
                                  qType.includes('Primary')
                                    ? 'indigo'
                                    : qType.includes('Method')
                                    ? 'purple'
                                    : qType.includes('Dataset') || qType.includes('Eval')
                                    ? 'warning'
                                    : qType.includes('Compar')
                                    ? 'default'
                                    : 'secondary'
                                }
                                size="sm"
                                className="font-semibold"
                              >
                                {qType}
                              </Badge>

                              <Badge
                                variant={q.feasibility === 'High' ? 'success' : q.feasibility === 'Medium' ? 'warning' : 'secondary'}
                                size="sm"
                              >
                                Feasibility: {q.feasibility || 'High'}
                              </Badge>

                              <Badge variant="outline" size="sm">
                                Priority: {q.priority || 'High'}
                              </Badge>

                              <span className="text-[11px] text-muted-foreground font-mono">
                                Gap: <strong className="text-foreground">{gapTitle}</strong>
                              </span>
                            </div>

                            <h3 className="font-bold text-sm text-foreground leading-snug pt-1">
                              "{q.question}"
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyQuestion(q.id, q.question)}
                              className="h-8 text-xs gap-1"
                              title="Copy Question"
                            >
                              {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>Copy</span>
                            </Button>

                            <Button
                              variant={isSaved ? 'subtle' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleSave(q.id)}
                              className="h-8 text-xs gap-1"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </Button>
                          </div>
                        </div>

                        {/* Motivation, Evidence & Expected Investigation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Motivation
                            </span>
                            <p className="text-foreground leading-relaxed">
                              {q.motivation || q.rationale || q.hypothesis}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Supporting Evidence
                            </span>
                            <p className="text-foreground leading-relaxed italic">
                              {Array.isArray(q.supporting_evidence) ? q.supporting_evidence.join(' • ') : q.supporting_evidence || 'Literature evidence'}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                              Expected Investigation
                            </span>
                            <p className="text-foreground leading-relaxed">
                              {q.expected_investigation || q.suggestedMethodology}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

