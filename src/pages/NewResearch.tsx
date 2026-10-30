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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative pb-12">
      {/* Background Telemetry Ghost Lines */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-25 hidden xl:block select-none font-mono text-[9px] text-cyan-400 space-y-0.5 leading-tight text-right">
        <div>AGENTIC PIPELINE: READY</div>
        <div>EMBEDDING MODEL: TEXT-EMBEDDING-004</div>
        <div>VECTOR STORE: PGVECTOR (HNSW INDEX)</div>
        <div>INGESTION STATUS: STANDBY</div>
      </div>

      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101436] border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider">Autonomous Paper Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
          Start a New Research Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Specify your research topic or scientific hypothesis. Our autonomous engine will index peer-reviewed literature across academic repositories, score semantic relevance, and initialize the structured research pipeline.
        </p>
      </div>

      <form onSubmit={handleStartSearch} className="space-y-6">
        {/* Main Topic Input Card */}
        <Card className="neon-card-project border-cyan-500/35 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Research Title or Topic</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Be as specific as possible to maximize semantic retrieval accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your research topic, e.g. AI based ambulance route optimization"
              required
              className="text-sm sm:text-base h-12 px-4 font-medium bg-[#07091a]/95 border-cyan-500/30 text-white placeholder-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400"
              icon={<Search className="w-4 h-4 text-cyan-400" />}
            />

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Suggested Research Hypotheses:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[#0d1230] text-slate-300 border border-[#1e2548] hover:border-cyan-500/50 hover:text-white hover:bg-[#121844] shadow-xs transition-all text-left cursor-pointer"
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
          <Card className="neon-card-project">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>Domain & Keywords</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Research Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-[#1e2548] bg-[#07091a]/95 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                >
                  {domainsList.map((d) => (
                    <option key={d} value={d} className="bg-[#090d24] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Keywords (Comma Separated)
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. Route Optimization, Reinforcement Learning, Emergency AI"
                  className="text-xs h-9 bg-[#07091a]/95 border-[#1e2548] text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Paper Count & Publication Year Range */}
          <Card className="neon-card-project">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Discovery Scope & Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Number of Papers to Ingest
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPaperCount(count)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        paperCount === count
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                          : 'bg-[#0a0f28] text-slate-400 border-[#1a2044] hover:bg-[#121840] hover:text-white'
                      }`}
                    >
                      {count}
                      {count === 20 && ' (Default)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
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
                    className="text-xs h-9 bg-[#07091a]/95 border-[#1e2548] text-white font-mono"
                  />
                  <Input
                    type="number"
                    min="1990"
                    max="2026"
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    placeholder="To Year"
                    className="text-xs h-9 bg-[#07091a]/95 border-[#1e2548] text-white font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferred Academic Sources */}
        <Card className="neon-card-project">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Preferred Literature Repositories</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select academic indexing sources and preprint servers to ingest papers from
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
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                        : 'border-[#1a2044] bg-[#090d24] text-slate-400 hover:bg-[#121638] hover:text-white'
                    }`}
                  >
                    <span>{source}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!topic.trim()}
            className="btn-ai-glow-cyan-magenta text-white px-8 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Find Related Papers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
