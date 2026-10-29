import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { ResearchPaper } from '../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  FileSearch, 
  CheckSquare, 
  Square, 
  Calendar, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  FileText,
  Check,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/LoadingState';

export const PaperCollection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    papers, 
    currentProject, 
    loadProjectPapers,
    togglePaperSelect, 
    selectAllPapers, 
    addToast,
    discoverPapers,
    savePaper,
    isDiscovering
  } = useResearch();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(currentProject?.topic || '');
  const [lastSearchedTopic, setLastSearchedTopic] = useState<string>(currentProject?.topic || '');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'year' | 'citations'>('relevance');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Paper Details Modal
  const [activeModalPaper, setActiveModalPaper] = useState<ResearchPaper | null>(null);

  // Load existing saved papers when project is mounted
  useEffect(() => {
    const targetId = id || currentProject?.id;
    if (targetId) {
      loadProjectPapers(targetId);
    }
  }, [id, currentProject?.id]);

  useEffect(() => {
    const topicToSearch = currentProject?.topic || currentProject?.title;
    if (topicToSearch) {
      setSearchQuery(topicToSearch);
    }
  }, [currentProject?.id, currentProject?.topic]);

  const handleDiscoverSearch = async () => {
    const topicFallback = currentProject?.topic || currentProject?.title || 'AI Research';
    const trimmed = (searchQuery.trim() || topicFallback).trim();
    if (!trimmed) {
      addToast({
        type: 'warning',
        title: 'Empty Search Query',
        message: 'Search query cannot be empty. Please enter a research topic or keywords.',
      });
      return;
    }
    setLastSearchedTopic(trimmed);
    await discoverPapers(trimmed, 20);
  };

  const handleSavePaper = async (paper: ResearchPaper) => {
    if (paper.saved) {
      addToast({
        type: 'info',
        title: 'Already Saved',
        message: `"${paper.title.slice(0, 45)}..." is already saved in PostgreSQL.`,
      });
      return;
    }
    setSavingId(paper.id);
    await savePaper(paper);
    setSavingId(null);
  };

  // Filtered & Sorted Papers
  const filteredPapers = useMemo(() => {
    return papers
      .filter((paper) => {
        const matchesSource = selectedSource === 'all' || paper.source === selectedSource;
        const matchesYear = selectedYear === 'all' || paper.year.toString() === selectedYear;

        // If searchQuery is empty or matches the discovered topic or project topic, all papers match!
        const cleanQuery = searchQuery.trim().toLowerCase();
        const cleanTopic = (lastSearchedTopic || currentProject?.topic || '').trim().toLowerCase();

        let matchesSearch = true;
        // Only apply in-page text filter if user typed a specific filter keyword that differs from the topic
        if (cleanQuery && cleanQuery !== cleanTopic) {
          const terms = cleanQuery.split(/\s+/).filter((w) => w.length > 1);
          matchesSearch = terms.some((term) =>
            paper.title.toLowerCase().includes(term) ||
            paper.authors.some((a) => a.name.toLowerCase().includes(term)) ||
            paper.abstract.toLowerCase().includes(term) ||
            paper.tags.some((t) => t.toLowerCase().includes(term))
          );
        }

        return matchesSearch && matchesSource && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'citations') return b.citationsCount - a.citationsCount;
        return 0;
      });
  }, [papers, searchQuery, lastSearchedTopic, currentProject?.topic, selectedSource, selectedYear, sortBy]);

  const selectedCount = papers.filter((p) => p.selected).length;
  const allSelected = papers.length > 0 && selectedCount === papers.length;

  const handleAnalyzeSelected = () => {
    if (selectedCount === 0) {
      addToast({
        type: 'warning',
        title: 'No Papers Selected',
        message: 'Please select at least one paper to analyze.',
      });
      return;
    }
    const targetProjId = id || currentProject?.id;
    navigate(targetProjId ? `/research/${targetProjId}/analysis` : '/research/new');
  };

  const handleAnalyzeAll = async () => {
    await selectAllPapers(true);
    const targetProjId = id || currentProject?.id;
    navigate(targetProjId ? `/research/${targetProjId}/analysis` : '/research/new');
  };


  const availableSources = Array.from(new Set(papers.map((p) => p.source)));
  const availableYears = Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              Related Research Papers
            </h1>
            <Badge variant="indigo" size="md" className="font-semibold px-2.5 py-0.5 shadow-glow-xs">
              {papers.length} Discovered
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            <strong className="text-foreground/90 font-medium">Research Corpus: </strong>
            {currentProject?.topic || 'Multimodal Deep Learning for Oncology Diagnosis'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAllPapers(!allSelected)}
            className="text-xs gap-1.5 font-medium border-border/80 hover:bg-secondary/80"
          >
            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> : <Square className="w-3.5 h-3.5" />}
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeAll}
            className="text-xs gap-1.5 font-medium border-border/80 hover:bg-secondary/80"
          >
            <span>Analyze All</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={selectedCount === 0}
            onClick={handleAnalyzeSelected}
            className="text-xs gap-2 shadow-glow-sm hover:shadow-glow-md font-semibold px-4 py-2"
          >
            <FileSearch className="w-4 h-4" />
            <span>Analyze Selected ({selectedCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 card-premium p-4 rounded-2xl">
        {/* Search */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleDiscoverSearch();
              }
            }}
            placeholder="Search papers, topic, or keywords..."
            icon={<Search className="w-4 h-4" />}
            className="text-xs h-9 flex-1 bg-background/50 border-border/70 focus:border-indigo-500 rounded-xl"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDiscoverSearch}
            disabled={isDiscovering}
            className="h-9 px-4 text-xs shrink-0 gap-2 shadow-glow-xs hover:shadow-glow-sm font-semibold rounded-xl"
            title="Search Semantic Scholar, arXiv, and Crossref"
          >
            {isDiscovering ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Discover</span>
          </Button>
        </div>

        {/* Filter by Source */}
        <div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full text-xs h-9 rounded-xl border border-border/70 bg-background/50 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium transition-all"
          >
            <option value="all">All Repositories</option>
            {availableSources.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        {/* Filter by Year */}
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full text-xs h-9 rounded-xl border border-border/70 bg-background/50 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium transition-all"
          >
            <option value="all">All Publication Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs h-9 rounded-xl border border-border/70 bg-background/50 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium transition-all"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="year">Sort by Newest Year</option>
            <option value="citations">Sort by Citations</option>
          </select>
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {filteredPapers.map((paper) => {
          const isSelected = !!paper.selected;
          return (
            <div
              key={paper.id}
              className={`card-premium card-glow-indigo rounded-2xl p-5 transition-all duration-300 ${
                isSelected
                  ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/25 ring-1 ring-indigo-500/30'
                  : 'hover:-translate-y-0.5'
              }`}
            >
                <div className="flex items-start gap-3.5">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => togglePaperSelect(paper.id)}
                    className="mt-1 text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                    aria-label={`Select ${paper.title}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground/60 hover:text-muted-foreground" />
                    )}
                  </button>

                  {/* Main Paper Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Relevance Score Badge */}
                      <Badge
                        variant={paper.relevanceScore >= 90 ? 'success' : 'indigo'}
                        size="sm"
                        className="font-mono font-semibold"
                      >
                        {paper.relevanceScore}% Match
                      </Badge>
                      
                      <Badge variant="outline" size="sm">
                        {paper.source}
                      </Badge>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {paper.year}
                      </span>

                      <span className="text-xs text-muted-foreground truncate max-w-xs font-serif italic">
                        {paper.journalOrConference}
                      </span>
                    </div>

                    {/* Paper Title */}
                    <h3 
                      onClick={() => setActiveModalPaper(paper)}
                      className="text-sm sm:text-base font-bold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
                    >
                      {paper.title}
                    </h3>

                    {/* Authors List */}
                    <p className="text-xs text-muted-foreground">
                      {paper.authors.map((a) => a.name).join(', ')}
                    </p>

                    {/* Short Abstract Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                      {paper.abstract}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {paper.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons Column */}
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModalPaper(paper)}
                      className="h-8 text-xs gap-1"
                    >
                      <span>View</span>
                    </Button>

                    <Button
                      variant={paper.saved ? "subtle" : "outline"}
                      size="sm"
                      onClick={() => handleSavePaper(paper)}
                      disabled={savingId === paper.id}
                      className={`h-8 text-xs gap-1 transition-colors ${
                        paper.saved ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-emerald-300 dark:border-emerald-800' : ''
                      }`}
                      title={paper.saved ? "Saved in PostgreSQL" : "Save Paper to PostgreSQL"}
                    >
                      {paper.saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{paper.saved ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        togglePaperSelect(paper.id);
                        const targetProjId = id || currentProject?.id;
                        navigate(targetProjId ? `/research/${targetProjId}/analysis` : '/research/new');
                      }}
                      className="h-8 text-xs gap-1"
                    >
                      <FileSearch className="w-3 h-3" />
                      <span>Analyze</span>
                    </Button>

                    <a
                      href={paper.pdfUrl || paper.paperUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      title="Open Original Source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
            </div>
          );
        })}

        {/* Loading State during academic discovery */}
        {isDiscovering && (
          <div className="p-8 text-center bg-card rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3 animate-pulse">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Searching academic sources...
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Querying Semantic Scholar, arXiv, and Crossref concurrently. Deduplicating and ranking by relevance.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isDiscovering && filteredPapers.length === 0 && (
          <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-muted-foreground text-xs space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-foreground text-sm">
              {papers.length > 0
                ? "No papers match your current filters."
                : "No relevant research papers loaded yet."}
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              {papers.length > 0
                ? "Try clearing your keyword filter or adjusting repository and year selections."
                : "Ready to fetch and synthesize academic papers from arXiv, Semantic Scholar, and Crossref for your research topic."}
            </p>
            <div className="pt-2">
              {papers.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(currentProject?.topic || lastSearchedTopic || '');
                    setSelectedSource('all');
                    setSelectedYear('all');
                  }}
                  className="gap-2 mx-auto shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filter Criteria</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDiscoverSearch}
                  className="gap-2 mx-auto shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Papers for "{currentProject?.topic || searchQuery || 'Research Topic'}"</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Paper Detailed Modal */}
      {activeModalPaper && (
        <Modal
          isOpen={!!activeModalPaper}
          onClose={() => setActiveModalPaper(null)}
          title={activeModalPaper.title}
          description={`${activeModalPaper.journalOrConference} (${activeModalPaper.year}) • ${activeModalPaper.source}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success" size="sm">
                Relevance: {activeModalPaper.relevanceScore}%
              </Badge>
              <Badge variant="outline" size="sm">
                Citations: {activeModalPaper.citationsCount}
              </Badge>
              <Badge variant="secondary" size="sm">
                DOI: {activeModalPaper.doi}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Authors & Affiliations</h4>
              <ul className="space-y-1 text-muted-foreground">
                {activeModalPaper.authors.map((author, aIdx) => (
                  <li key={aIdx}>
                    <strong>{author.name}</strong> — {author.affiliation}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-1">Full Abstract</h4>
              <p className="text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-lg border border-border/40">
                {activeModalPaper.abstract}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant={activeModalPaper.saved ? "outline" : "subtle"}
                size="sm"
                onClick={() => handleSavePaper(activeModalPaper)}
                disabled={savingId === activeModalPaper.id}
                className={`gap-1.5 ${
                  activeModalPaper.saved ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
                }`}
              >
                {activeModalPaper.saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{activeModalPaper.saved ? 'Saved in Database' : 'Save Paper'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalPaper(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  togglePaperSelect(activeModalPaper.id);
                  setActiveModalPaper(null);
                  const targetProjId = id || currentProject?.id;
                  navigate(targetProjId ? `/research/${targetProjId}/analysis` : '/research/new');
                }}
                className="gap-1.5"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Open in Paper Analysis</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
