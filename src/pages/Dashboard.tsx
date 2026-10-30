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
  BookOpen
} from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in relative pb-10">
      {/* Ghost Telemetry in Background */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-20 hidden 2xl:block select-none font-mono text-[9px] text-cyan-400 space-y-0.5 leading-tight text-right">
        <div>SYSTEM STATUS: ONLINE</div>
        <div>GEMINI ENGINE: OPTIMAL (0.001ms)</div>
        <div>AUTONOMOUS INGESTION: 99.8%</div>
        <div>SECURITY ENCLAVE: ACTIVE</div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/35 bg-[#090d24]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_35px_rgba(6,182,212,0.12)]">
        {/* Decorative Top Glowing Border Accent */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 shadow-[0_0_12px_#22d3ee]" />
        
        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            {/* Live Model Telemetry Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101432] border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] font-bold tracking-wider">GEMINI 3.5 FLASH ACTIVE · AUTONOMOUS LAB</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight text-white">
              AI Research Scientist
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Transform research hypotheses into publication-ready scientific breakthroughs. Automated multi-source paper discovery, non-hallucinatory synthesis, research gap detection, and dynamic architecture authoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/research/new')}
              className="btn-ai-glow-cyan-magenta text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>+ Start New Research</span>
            </button>
            <button
              onClick={() => navigate('/research')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 bg-[#0d1230] border border-cyan-500/40 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-200 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span>View My Research</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Projects */}
        <div className="neon-card-project rounded-2xl p-5 flex items-center justify-between group cursor-pointer" onClick={() => navigate('/research')}>
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">Total Workspaces</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-white">{totalProjects}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee] shrink-0" />
              <span>{totalProjects > 0 ? `${totalProjects} active workspaces` : '0 active'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Papers Collected */}
        <div className="neon-card-project rounded-2xl p-5 flex items-center justify-between group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">Papers Ingested</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-white">{totalPapers}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium truncate">
              <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Cross-corpus indices</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform shrink-0">
            <Files className="w-5 h-5" />
          </div>
        </div>

        {/* Papers Analyzed */}
        <div className="neon-card-project rounded-2xl p-5 flex items-center justify-between group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">Papers Synthesized</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-white">{totalAnalyzed}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-fuchsia-300 font-semibold truncate">
              <Sparkles className="w-3 h-3 text-fuchsia-400 shrink-0" />
              <span>{totalPapers > 0 ? Math.round((totalAnalyzed / totalPapers) * 100) : 100}% synthesized</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.2)] group-hover:scale-110 transition-transform shrink-0">
            <FileSearch className="w-5 h-5" />
          </div>
        </div>

        {/* Research Gaps Extracted */}
        <div className="neon-card-project rounded-2xl p-5 flex items-center justify-between group">
          <div className="space-y-1.5 min-w-0 flex-1 mr-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">Gaps Extracted</p>
            <h3 className="text-3xl font-extrabold font-heading tracking-tight text-white">{totalGaps}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium truncate">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{totalGaps > 0 ? `${totalGaps} verified frontiers` : 'Autonomous extraction'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform shrink-0">
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
              <h2 className="text-xl font-bold tracking-tight text-white font-heading">Recent Research Workspaces</h2>
              <p className="text-xs text-slate-400">Active autonomous investigations and paper corpuses</p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => navigate('/research')}
                className="text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#121636] transition-colors"
              >
                <span>View all ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="neon-card-project rounded-2xl p-5 space-y-3.5 cursor-pointer group transition-all duration-300"
                onClick={() => handleContinueProject(project)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-white font-heading group-hover:text-cyan-300 transition-colors">
                        {project.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#121636] text-indigo-300 border border-indigo-500/30 shadow-xs">
                        {project.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {project.topic}
                    </p>
                  </div>

                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueProject(project);
                    }}
                    className="w-8 h-8 rounded-full btn-blue-circle text-white flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-110 ml-2"
                    title="Open Project"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Meta footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-[#1a2044]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#101436] text-purple-300 border border-purple-500/30 font-semibold text-[11px]">
                      <Files className="w-3.5 h-3.5 text-purple-400" />
                      <span>{project.papersCount || 5} papers</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Updated Oct 29, 2026</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Research Velocity & Quick Academic Engines */}
        <div className="space-y-4">
          <div className="neon-card-project rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-white">Research Velocity</h3>
                <p className="text-[11px] text-slate-400 font-mono">Paper discovery & citation flux</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101436] text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                PAST 7 DAYS
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorPapersCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0d24', 
                      borderColor: '#1e2548', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px',
                      color: '#ffffff',
                      boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' 
                    }} 
                  />
                  <Area type="monotone" dataKey="papers" stroke="#00f0ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPapersCyan)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f1435] border border-cyan-500/30 text-xs space-y-1 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Research Synthesis Tip</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {projects[0] ? `Your project '${projects[0].title}' has 5 ingested papers ready for automatic methodology and system architecture formulation.` : 'Start paper analysis to generate automatic gap detection and literature matrices.'}
              </p>
            </div>
          </div>

          {/* Quick Academic Engines Card */}
          <div className="neon-card-project rounded-2xl p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-white">Scientific Intelligence Stages</h3>
              <p className="text-[11px] text-slate-400">Direct pipeline stage accelerators</p>
            </div>

            <div className="space-y-2 pt-1">
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
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#0a0f28]/60 hover:bg-[#121840] border border-[#1a2044] hover:border-cyan-500/40 shadow-xs hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-200 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <tool.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors font-medium">{tool.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
