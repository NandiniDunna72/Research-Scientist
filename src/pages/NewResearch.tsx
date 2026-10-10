import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Calendar, 
  Database, 
  Tag, 
  ArrowRight,
  Lightbulb,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { PaperSource } from '../types';

export const NewResearch: React.FC = () => {
  const { createProject, discoverPapers } = useResearch();
  const navigate = useNavigate();

  // Form State
  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState('Healthcare & Biomedical AI');
  const [keywords, setKeywords] = useState('Multimodal AI, Oncology, Vision-Language Models, Clinical Decision Support');
  const [paperCount, setPaperCount] = useState<number>(20);
  const [startYear, setStartYear] = useState<number>(2021);
  const [endYear, setEndYear] = useState<number>(2025);
  const [selectedSources, setSelectedSources] = useState<PaperSource[]>([
    'PubMed',
    'Nature',
    'IEEE Xplore',
    'ScienceDirect',
    'arXiv',
  ]);

  // Loading animation state
  const [isProcessing, setIsProcessing] = useState(false);

  const availableSources: PaperSource[] = [
    'arXiv',
    'PubMed',
    'IEEE Xplore',
    'Nature',
    'ScienceDirect',
    'ACM Digital Library',
    'Springer',
    'NeurIPS / ICML',
  ];

  const domainsList = [
    'Healthcare & Biomedical AI',
    'Natural Language Processing & LLMs',
    'Computer Vision & Multimodal Learning',
    'Intelligent Transportation & Robotics',
    'Software Engineering & Program Synthesis',
    'Climate Science & Energy Optimization',
    'Cybersecurity & Trustworthy AI',
  ];

  const suggestedTopics = [
    'AI-Based Healthcare Diagnosis with Multimodal Foundation Models',
    'Large Language Models in Education: Adaptive Scaffolding & Hallucination Control',
    'Graph Neural Networks & Multi-Agent Reinforcement Learning for Urban Traffic Flow',
    'Generative AI for Automated Program Synthesis and Vulnerability Repair',
  ];

  const toggleSource = (source: PaperSource) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleStartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsProcessing(true);

    try {
      // Create project with form data
      const keywordArr = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      const newProj = await createProject({
        title: topic.length > 50 ? topic.substring(0, 48) + '...' : topic,
        topic: topic,
        domain: domain,
        keywords: keywordArr,
        paperCount: paperCount,
        yearRange: [startYear, endYear],
        preferredSources: selectedSources,
        currentStage: 'papers',
        progress: 20,
      });

      // Discover papers concurrently across academic sources
      await discoverPapers(topic.trim(), paperCount);
      setIsProcessing(false);
      navigate(`/research/${newProj.id}/papers`);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <LoadingState
          title="Autonomous Research Engine Executing"
          subtitle={`Discovering and synthesizing ${paperCount} top-tier papers for "${topic}"`}
          steps={[
            '1. Understanding research topic & extracting domain keywords...',
            '2. Finding related papers across PubMed, arXiv, IEEE, & Nature...',
            '3. Ranking papers by semantic relevance & citation impact...',
            '4. Preparing research workspace & extracting literature matrix...',
          ]}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Paper Discovery
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Start a New Research Project
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Specify your research topic or scientific question. Our agent will index peer-reviewed literature, score semantic relevance, and initialize the structured research pipeline.
        </p>
      </div>

      <form onSubmit={handleStartSearch} className="space-y-6">
        {/* Main Topic Input Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Research Title or Topic
            </CardTitle>
            <CardDescription>
              Be as specific as possible to maximize discovery accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your research topic, e.g. AI-powered healthcare diagnosis with multimodal foundation models"
              required
              className="text-base h-12 px-4 font-medium"
              icon={<Search className="w-4 h-4" />}
            />

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Suggested Research Ideas:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTopics.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-foreground border border-border/70 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Research Domain & Keywords */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Domain & Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Research Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-600"
                >
                  {domainsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Keywords (Comma Separated)
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. Multimodal AI, Oncology, Transformers"
                  className="text-xs h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Paper Count & Publication Year Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Discovery Scope & Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Number of Papers to Ingest
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPaperCount(count)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        paperCount === count
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-card text-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      {count}
                      {count === 20 && ' (Default)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  Publication Year Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="1990"
                    max="2026"
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    placeholder="From Year"
                    className="text-xs h-9"
                  />
                  <Input
                    type="number"
                    min="1990"
                    max="2026"
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    placeholder="To Year"
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferred Academic Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Preferred Literature Repositories
            </CardTitle>
            <CardDescription>
              Select repositories to search and index papers from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableSources.map((source) => {
                const isSelected = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span>{source}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!topic.trim()}
            className="gap-2 px-8 text-sm shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Related Papers</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
