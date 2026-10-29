import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { 
  Sparkles, 
  PlusCircle, 
  FolderKanban, 
  Files, 
  FileSearch, 
  AlertCircle,
  ArrowRight, 
  TrendingUp,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const activityData = [
  { day: 'Mon', papers: 4, citations: 28 },
  { day: 'Tue', papers: 7, citations: 45 },
  { day: 'Wed', papers: 12, citations: 82 },
  { day: 'Thu', papers: 16, citations: 110 },
  { day: 'Fri', papers: 20, citations: 145 },
  { day: 'Sat', papers: 22, citations: 160 },
  { day: 'Sun', papers: 25, citations: 190 },
];

export const Dashboard: React.FC = () => {
  const { projects, setCurrentProjectId } = useResearch();
  const navigate = useNavigate();

  // Aggregate stats across all projects
  const totalProjects = projects.length;
  const totalPapers = projects.reduce((acc, p) => acc + (p.papersCount || 0), 0);
  const totalAnalyzed = projects.reduce((acc, p) => acc + (p.analyzedCount || 0), 0);
  const totalGaps = projects.reduce((acc, p) => acc + (p.gapsIdentifiedCount || 0), 0);

  const handleContinueProject = (project: (typeof projects)[0]) => {
    setCurrentProjectId(project.id);
    navigate(`/research/${project.id}/${project.currentStage}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.12] via-card to-purple-500/[0.08] p-6 sm:p-10 shadow-premium dark:shadow-premium-dark backdrop-blur-2xl">
        {/* Decorative Top Glowing Border Accent */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            {/* Live Model Telemetry Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-semibold badge-shimmer shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Autonomous Academic Intelligence · Gemini 3.5 Flash Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight">
              <span className="gradient-heading">AI Research Scientist</span>
            </h1>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Transform research hypotheses into publication-ready insights. Automated multi-source paper discovery, non-hallucinatory synthesis, research gap detection, and dynamic architecture authoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/research/new')}
              className="btn-ai-glow text-white text-sm font-bold px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>+ Start New Research</span>
            </button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/research')}
              className="gap-2 rounded-2xl border-border/80 hover:border-indigo-400/80 hover:bg-secondary/70 hover:-translate-y-0.5 transition-all duration-200 font-semibold"
            >
              <FolderKanban className="w-4 h-4 text-indigo-500" />
              <span>View My Research</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Projects */}
        <div className="card-premium p-5 flex items-center justify-between hover:-translate-y-1 hover:shadow-glow-xs transition-all duration-300 group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Total Research</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">{totalProjects}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{totalProjects > 0 ? `${totalProjects} active workspaces` : '0 active'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/25 shadow-glow-xs group-hover:scale-110 transition-transform shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Papers Collected */}
        <div className="card-premium p-5 flex items-center justify-between hover:-translate-y-1 hover:shadow-glow-xs transition-all duration-300 group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Papers Collected</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">{totalPapers}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>Academic repositories</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/25 shadow-glow-xs group-hover:scale-110 transition-transform shrink-0">
            <Files className="w-5 h-5" />
          </div>
        </div>

        {/* Papers Analyzed */}
        <div className="card-premium p-5 flex items-center justify-between hover:-translate-y-1 hover:shadow-glow-xs transition-all duration-300 group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Papers Analyzed</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">{totalAnalyzed}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-semibold truncate">
              <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
              <span>{totalPapers > 0 ? Math.round((totalAnalyzed / totalPapers) * 100) : 0}% synthesized</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/25 shadow-glow-xs group-hover:scale-110 transition-transform shrink-0">
            <FileSearch className="w-5 h-5" />
          </div>
        </div>

        {/* Research Gaps Identified */}
        <div className="card-premium p-5 flex items-center justify-between hover:-translate-y-1 hover:shadow-glow-xs transition-all duration-300 group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Gaps Extracted</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">{totalGaps}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
              <span>{totalGaps > 0 ? `${totalGaps} frontiers` : 'Ready to analyze'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shadow-glow-xs group-hover:scale-110 transition-transform shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Research Projects & Activity Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Research Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">Recent Research Projects</h2>
              <p className="text-xs text-muted-foreground">Active investigations in your academic workspace</p>
            </div>
            {projects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/research')}
                className="text-xs gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg"
              >
                <span>View all ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="card-premium p-10 text-center border-dashed">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-glow-xs">
                    <FolderKanban className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading">No Research Projects Yet</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your workspace is completely fresh. Start your first autonomous research investigation to discover academic literature, extract research gaps, and produce conference-ready manuscripts.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/research/new')}
                    className="gap-2 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Start Your First Research
                  </Button>
                </div>
              </div>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id}
                  className="card-premium card-glow-indigo p-5 space-y-3.5 cursor-pointer group hover:-translate-y-1 hover:shadow-glow-sm hover:border-indigo-500/40 transition-all duration-300"
                  onClick={() => handleContinueProject(project)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-foreground font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {project.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {project.domain}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {project.topic}
                      </p>
                    </div>

                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueProject(project);
                      }}
                      className="shrink-0 text-xs gap-1.5 font-semibold group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:shadow-glow-xs transition-all duration-200"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>

                  {/* Meta footer */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/60 text-foreground font-medium text-[11px]">
                        <Files className="w-3.5 h-3.5 text-indigo-500" />
                        <span><strong>{project.papersCount}</strong> papers</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground/80 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Updated {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* Right 1 Col: Research Velocity & Quick AI Suggestions */}
        <div className="space-y-4">
          <div className="card-premium p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-foreground">Research Velocity</h3>
                <p className="text-[11px] text-muted-foreground">Paper discovery & citation throughput</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
                Past 7 Days
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="papers" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPapers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
              <div className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Research Synthesis Tip</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {projects[0] ? `Your project '${projects[0].title}' has analyzed papers ready for full methodology and system architecture formulation.` : 'Start paper analysis to generate automatic gap detection and literature matrices.'}
              </p>
            </div>
          </div>

          {/* Quick Academic Tools Card */}
          <div className="card-premium p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-foreground">Scientific Intelligence Stages</h3>
              <p className="text-[11px] text-muted-foreground">Jump directly to automated research engines</p>
            </div>

            <div className="space-y-1.5 pt-1">
              {[
                { name: 'Paper Collection & Discovery', path: projects[0] ? `/research/${projects[0].id}/papers` : '/research/new', icon: BookOpen },
                { name: 'Research Gaps & Frontiers', path: projects[0] ? `/research/${projects[0].id}/gaps` : '/research/new', icon: Files },
                { name: 'Literature Review Synthesis', path: projects[0] ? `/research/${projects[0].id}/literature` : '/research/new', icon: TrendingUp },
                { name: 'System Architecture Engine', path: projects[0] ? `/research/${projects[0].id}/architecture` : '/research/new', icon: Sparkles },
                { name: 'Manuscript & Slides Authoring', path: projects[0] ? `/research/${projects[0].id}/presentation` : '/research/new', icon: ExternalLink },
              ].map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(tool.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-indigo-500/10 border border-border/50 hover:border-indigo-500/30 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <tool.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">{tool.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
