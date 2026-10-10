import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { comparisonService } from '../services/comparisonService';
import { authService } from '../services/authService';
import {
  PaperComparisonResult,
  EligiblePaperItem,
  EligiblePapersResponse,
} from '../types';
import {
  GitCompare,
  Search,
  FileSpreadsheet,
  Download,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  Cpu,
  BarChart2,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  ExternalLink,
  Info,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';

export const ComparisonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast } = useResearch();

  const projectId = id || currentProject?.id || 'proj-healthcare-ai';

  // State
  const [comparison, setComparison] = useState<PaperComparisonResult | null>(null);
  const [eligibleData, setEligibleData] = useState<EligiblePapersResponse | null>(null);
  const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState<string>('');
  const [isSelectionPanelOpen, setIsSelectionPanelOpen] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Load eligible papers and existing saved comparison on mount or project change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const isAuth = authService.isAuthenticated();
        if (isAuth) {
          const [eligibleRes, savedComp] = await Promise.all([
            comparisonService.getEligiblePapers(projectId).catch((err) => {
              console.warn('Eligible papers load error:', err);
              return null;
            }),
            comparisonService.getLatestComparison(projectId).catch((err) => {
              console.warn('Latest comparison load error:', err);
              return null;
            }),
          ]);

          if (!isMounted) return;

          if (eligibleRes) {
            setEligibleData(eligibleRes);
            // Default select all eligible papers if none selected yet, up to 5
            if (eligibleRes.eligible_papers && eligibleRes.eligible_papers.length > 0) {
              const defaultIds = eligibleRes.eligible_papers.slice(0, 5).map((p) => p.id);
              setSelectedPaperIds(defaultIds);
            }
          }

          if (savedComp) {
            setComparison(savedComp);
            if (savedComp.paper_ids && savedComp.paper_ids.length > 0) {
              const intIds = savedComp.paper_ids.map((pid) => Number(pid)).filter((n) => !isNaN(n));
              setSelectedPaperIds(intIds);
            }
            setIsSelectionPanelOpen(false); // Collapse selection panel if comparison already loaded
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load comparison data:', err);
        setErrorMsg('Failed to load comparison data. Please refresh.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Toggle single paper selection
  const handleTogglePaper = (paperId: number) => {
    setSelectedPaperIds((prev) => {
      if (prev.includes(paperId)) {
        return prev.filter((id) => id !== paperId);
      } else {
        if (prev.length >= 10) {
          addToast({
            type: 'warning',
            title: 'Selection Limit Reached',
            message: 'Comparison supports a maximum of 10 papers at a time.',
          });
          return prev;
        }
        return [...prev, paperId];
      }
    });
  };

  // Select all eligible papers
  const handleSelectAll = (select: boolean) => {
    if (!eligibleData) return;
    if (select) {
      const allIds = eligibleData.eligible_papers.slice(0, 10).map((p) => p.id);
      setSelectedPaperIds(allIds);
    } else {
      setSelectedPaperIds([]);
    }
  };

  // Compare Action
  const handleCompare = async () => {
    if (selectedPaperIds.length < 2) {
      addToast({
        type: 'warning',
        title: 'Insufficient Selection',
        message: 'Select at least two analyzed papers to compare.',
      });
      return;
    }

    setIsComparing(true);
    setErrorMsg(null);

    try {
      const res = await comparisonService.generateComparison(projectId, selectedPaperIds);
      setComparison(res);
      setIsSelectionPanelOpen(false);
      addToast({
        type: 'success',
        title: 'Comparison Complete',
        message: 'Paper comparison generated successfully.',
      });
    } catch (err: any) {
      console.error('Comparison error:', err);
      const msg = err.message || 'Paper comparison failed. Please try again.';
      setErrorMsg(msg);
      addToast({
        type: 'error',
        title: 'Comparison Failed',
        message: msg,
      });
    } finally {
      setIsComparing(false);
    }
  };

  // Regenerate Action
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMsg(null);

    try {
      const res = await comparisonService.regenerateComparison(projectId, selectedPaperIds);
      setComparison(res);
      addToast({
        type: 'success',
        title: 'Comparison Updated',
        message: 'Paper comparison regenerated successfully.',
      });
    } catch (err: any) {
      console.error('Regeneration error:', err);
      const msg = err.message || 'Failed to regenerate paper comparison.';
      setErrorMsg(msg);
      addToast({
        type: 'error',
        title: 'Regeneration Error',
        message: msg,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!comparison || !comparison.comparison_table) return;
    const table = comparison.comparison_table;
    const columns = table.columns || [];
    const paperIds = table.paper_ids || [];

    const headers = columns.map((col) => `"${col.replace(/"/g, '""')}"`);
    const rows = (table.rows || []).map((row: any) => {
      const line = [row.dimension];
      for (const pid of paperIds) {
        const val = row.values?.[String(pid)] || 'Not reported in the analyzed paper';
        line.push(val);
      }
      return line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paper_comparison_project_${projectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Comparison Exported',
      message: 'Downloaded CSV file successfully.',
    });
  };

  // Filtered comparison table rows based on search
  const filteredRows = useMemo(() => {
    if (!comparison || !comparison.comparison_table?.rows) return [];
    if (!searchTable.trim()) return comparison.comparison_table.rows;

    const q = searchTable.toLowerCase();
    return comparison.comparison_table.rows.filter((row: any) => {
      if (row.dimension.toLowerCase().includes(q)) return true;
      const values = Object.values(row.values || {});
      return values.some((val: any) => String(val).toLowerCase().includes(q));
    });
  }, [comparison, searchTable]);

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingState
          title="Loading paper comparison workspace..."
          subtitle="Retrieving analyzed papers and project records..."
        />
      </div>
    );
  }

  const eligibleCount = eligibleData?.eligible_count || 0;
  const isEligibleDeficient = eligibleCount < 2;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Research Paper Comparison
            </h1>
            <Badge variant="indigo" size="md">
              Module 7
            </Badge>
            {comparison && (
              <Badge variant="secondary" size="md" className="font-mono">
                {comparison.papers_compared} Papers
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Multi-dimensional comparative matrix benchmarking problems, methodologies, datasets, algorithms, and evaluation metrics across surveyed literature.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {comparison && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating || selectedPaperIds.length < 2}
                className="text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-500' : ''}`} />
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </Button>
            </>
          )}

          <Button
            variant={isSelectionPanelOpen ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIsSelectionPanelOpen(!isSelectionPanelOpen)}
            className="text-xs gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isSelectionPanelOpen ? 'Hide Selection' : 'Select Papers'}</span>
            <Badge variant="indigo" size="sm" className="ml-1">
              {selectedPaperIds.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold">Comparison Notice</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Section 1: Paper Selection Panel */}
      {isSelectionPanelOpen && (
        <Card className="border-indigo-500/20 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  Select Analyzed Papers for Comparison
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Choose 2 to 10 analyzed papers from your active project workspace.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  disabled={isEligibleDeficient}
                  className="text-xs h-8"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  className="text-xs h-8"
                >
                  Clear Selection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCompare}
                  disabled={isComparing || selectedPaperIds.length < 2}
                  className="text-xs gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isComparing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Comparing research papers...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compare ({selectedPaperIds.length} Selected)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Warning if fewer than 2 papers are eligible */}
            {isEligibleDeficient ? (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold">At least two analyzed research papers are required for comparison.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your project currently has {eligibleCount} paper(s) with completed analysis. Please analyze additional papers in Module 2 before generating a comparative synthesis.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/research/${projectId}/analysis`)}
                    className="mt-2.5 text-xs gap-1.5 h-7"
                  >
                    <span>Go to Paper Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Showing <strong>{eligibleCount}</strong> eligible analyzed papers in this project.
                </span>
                <span className={selectedPaperIds.length < 2 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                  {selectedPaperIds.length < 2
                    ? 'Select at least two analyzed papers to compare.'
                    : `Ready to compare ${selectedPaperIds.length} papers.`}
                </span>
              </div>
            )}

            {/* Eligible Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(eligibleData?.eligible_papers || []).map((paper) => {
                const isSelected = selectedPaperIds.includes(paper.id);
                return (
                  <div
                    key={paper.id}
                    onClick={() => handleTogglePaper(paper.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                        : 'border-border/80 bg-card hover:border-indigo-500/40 hover:bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-border/80 bg-background'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
                            ID: {paper.id}
                          </Badge>
                          {paper.publication_year && (
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {paper.publication_year}
                            </span>
                          )}
                          {paper.venue && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {paper.venue}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                          {paper.title}
                        </h4>

                        {paper.methodology && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            <strong className="text-foreground font-medium">Method:</strong> {paper.methodology}
                          </p>
                        )}

                        {paper.dataset && (
                          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono truncate">
                            Dataset: {paper.dataset}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unusable papers notice if any */}
            {(eligibleData?.unusable_papers || []).length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <details className="text-xs text-muted-foreground cursor-pointer">
                  <summary className="hover:text-foreground font-medium">
                    {eligibleData?.unusable_papers.length} paper(s) in this project have no completed analysis (Click to inspect)
                  </summary>
                  <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-amber-500/40">
                    {eligibleData?.unusable_papers.map((up) => (
                      <div key={up.id} className="flex items-center justify-between py-0.5">
                        <span className="truncate max-w-md font-medium text-foreground">
                          • {up.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/research/${projectId}/analysis`);
                          }}
                          className="text-[11px] h-6 text-indigo-600 hover:text-indigo-700"
                        >
                          Analyze Paper →
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading state during comparison generation */}
      {isComparing && (
        <Card className="py-12 text-center border-indigo-500/20">
          <LoadingState
            title="Comparing research papers..."
            subtitle="Synthesizing multi-dimensional comparison table and findings..."
            steps={[
              'Retrieving analyzed paper metadata...',
              'Extracting problems, methodologies, and datasets...',
              'Preserving numerical metric contexts...',
              'Connecting research gaps and questions...',
              'Finalizing cross-paper synthesis matrix...',
            ]}
          />
        </Card>
      )}

      {/* Main Comparison View */}
      {comparison && !isComparing && (
        <div className="space-y-8 animate-fade-in">
          {/* Executive Overall Synthesis Card */}
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-background to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Cross-Paper Synthesis & Executive Findings
                </CardTitle>
                <Badge variant="indigo" size="sm">
                  {comparison.papers_compared} Papers Surveyed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                {comparison.overall_synthesis}
              </p>

              {/* Commonalities & Differences Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Commonalities Across Surveyed Approaches
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc marker:text-indigo-500">
                    {comparison.commonalities.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    Key Methodological & Experimental Differences
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc marker:text-amber-500">
                    {comparison.differences.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimension-by-Dimension Comparison Table */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Multi-Dimensional Comparison Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Direct contrast across problems, methodologies, algorithms, datasets, metrics, and limitations.
                  </CardDescription>
                </div>

                <div className="w-64">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter dimensions or text..."
                      value={searchTable}
                      onChange={(e) => setSearchTable(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/70 border-b border-border text-foreground font-semibold">
                      <th className="p-3.5 whitespace-nowrap min-w-[180px] sticky left-0 bg-secondary/90 backdrop-blur-xs z-10 border-r border-border">
                        Comparison Dimension
                      </th>
                      {(comparison.comparison_table?.columns || []).slice(1).map((colTitle: string, idx: number) => {
                        const pid = comparison.comparison_table.paper_ids?.[idx];
                        return (
                          <th key={idx} className="p-3.5 min-w-[260px] max-w-[340px] align-top">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                                Paper ID: {pid}
                              </span>
                              <div className="font-bold text-foreground line-clamp-2 leading-snug">
                                {colTitle}
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground/90 whitespace-nowrap sticky left-0 bg-card border-r border-border z-10">
                          {row.dimension}
                        </td>
                        {(comparison.comparison_table?.paper_ids || []).map((pid: any, pIdx: number) => {
                          const val = row.values?.[String(pid)] || 'Not reported in the analyzed paper';
                          const isNotReported = val.toLowerCase().includes('not reported');

                          return (
                            <td key={pIdx} className="p-3.5 align-top leading-relaxed text-muted-foreground">
                              {isNotReported ? (
                                <span className="inline-block italic text-muted-foreground/60 text-[11px]">
                                  {val}
                                </span>
                              ) : row.dimension === 'Algorithms & Models' ? (
                                <div className="flex flex-wrap gap-1">
                                  {val.split(',').map((algo: string, aIdx: number) => (
                                    <span
                                      key={aIdx}
                                      className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono text-[10px]"
                                    >
                                      {algo.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : row.dimension === 'Limitations' ? (
                                <div className="text-amber-800 dark:text-amber-300/90 text-xs font-normal">
                                  {val}
                                </div>
                              ) : (
                                <div className="text-xs text-foreground/80">
                                  {val}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section: Reported Numerical Metrics & Context Preservation */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    Reported Numerical Metrics & Evaluation Context
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Preserves original metric scores, datasets, and experimental split settings without false cross-dataset equivalences.
                  </CardDescription>
                </div>
                <Badge variant="secondary" size="sm" className="font-mono">
                  Context Preserved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold">
                      <th className="p-3 whitespace-nowrap">Paper</th>
                      <th className="p-3 whitespace-nowrap">Reported Metric</th>
                      <th className="p-3 whitespace-nowrap">Score / Value</th>
                      <th className="p-3 whitespace-nowrap">Dataset</th>
                      <th className="p-3 whitespace-nowrap">Evaluation Setting</th>
                      <th className="p-3 min-w-[200px]">Comparability Guidance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparison.reported_metric_comparisons.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary/20">
                        <td className="p-3 font-semibold text-foreground max-w-[180px] truncate">
                          {item.source_paper_title}
                        </td>
                        <td className="p-3 font-mono text-indigo-700 dark:text-indigo-300">
                          {item.metric_name}
                        </td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {item.reported_value}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {item.dataset}
                        </td>
                        <td className="p-3 text-muted-foreground text-[11px]">
                          {item.evaluation_setting}
                        </td>
                        <td className="p-3 text-[11px] text-muted-foreground italic">
                          {item.comparability_notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section: Methodological Strengths & Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-indigo-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Methodological Strengths (Supported by Papers)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {comparison.methodological_strengths.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">
                        {item.strength}
                      </span>
                      <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
                        Paper {item.supporting_papers?.join(', ')}
                      </Badge>
                    </div>
                    {item.evidence && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground font-medium">Evidence:</strong> {item.evidence}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Limitations */}
            <Card className="border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Recurring Limitations & Constraints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {comparison.methodological_limitations.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">
                        {item.limitation}
                      </span>
                      <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                        Paper {item.supporting_papers?.join(', ')}
                      </Badge>
                    </div>
                    {item.impact && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                        <strong className="font-medium">Impact:</strong> {item.impact}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section: Dataset & Evaluation Differences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Dataset Diversity & Comparability Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                How differing experimental partitions, sample scales, and benchmarks impact direct comparability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {comparison.dataset_and_evaluation_analysis.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground">
                    {item.aspect}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.analysis}
                  </p>
                  {item.comparability_implications && (
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-md">
                      ⚠️ Note: {item.comparability_implications}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section: Integration with Research Gaps and Research Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gaps Integration */}
            <Card className="border-indigo-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600" />
                    Related Research Gaps (Module 3)
                  </span>
                  <Badge variant="indigo" size="sm">
                    {comparison.research_gap_connections.length} Gaps
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {comparison.research_gap_connections.map((gap, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {gap.gap_title}
                      </span>
                      {gap.is_candidate_gap && (
                        <Badge variant="secondary" size="sm" className="text-[10px]">
                          Candidate Gap
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {gap.evidence_summary}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                      <span>Status: {gap.unresolved_status}</span>
                      <span>Supported: Papers [{gap.supported_papers?.join(', ')}]</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Questions Integration */}
            <Card className="border-indigo-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    Related Research Questions (Module 4)
                  </span>
                  <Badge variant="indigo" size="sm">
                    {comparison.research_question_connections.length} Questions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {comparison.research_question_connections.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/80 bg-secondary/30 space-y-1.5">
                    <h5 className="text-xs font-bold text-foreground">
                      {q.question_text}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground font-medium">Finding:</strong> {q.comparison_findings}
                    </p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      <strong className="font-medium">Informs Next Step:</strong> {q.informs_investigation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section: Research Trends & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Identified Research Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-muted-foreground space-y-2 pl-4 list-disc marker:text-indigo-500">
                  {comparison.research_trends.map((trend, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {trend}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  Emerging Research Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-muted-foreground space-y-2 pl-4 list-disc marker:text-emerald-500">
                  {comparison.research_opportunities.map((opp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {opp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State when no comparison generated yet */}
      {!comparison && !isComparing && !isEligibleDeficient && (
        <Card className="py-12 text-center border-dashed border-border/80">
          <CardContent className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/20 text-indigo-600 flex items-center justify-center mx-auto">
              <GitCompare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                No Paper Comparison Generated Yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Select 2 or more analyzed papers from the panel above and click "Compare Papers" to formulate a structured comparison table and cross-paper synthesis.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleCompare}
              disabled={selectedPaperIds.length < 2}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Compare Selected Papers ({selectedPaperIds.length})</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
