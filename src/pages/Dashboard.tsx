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
import { Progress } from '../components/ui/Progress';
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
  const totalPapers = projects.reduce((acc, p) => acc + (p.papersCount || 20), 0);
  const totalAnalyzed = projects.reduce((acc, p) => acc + (p.analyzedCount || 12), 0);
  const totalGaps = projects.reduce((acc, p) => acc + (p.gapsIdentifiedCount || 6), 0);

  const handleContinueProject = (project: (typeof projects)[0]) => {
    setCurrentProjectId(project.id);
    navigate(`/research/${project.id}/${project.currentStage}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 dark:from-indigo-950/40 dark:via-card dark:to-card p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Autonomous AI Research Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              AI Research Scientist
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Transform research ideas into structured research-ready insights. Automated paper discovery, deep literature synthesis, gap detection, and presentation authoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/research/new')}
              className="gap-2 shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              + Start New Research
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/research')}
              className="gap-2"
            >
              <FolderKanban className="w-4 h-4 text-muted-foreground" />
              View My Research
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Research Projects</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalProjects}</h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>+2 this month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
              <FolderKanban className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Papers Collected */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Papers Collected</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalPapers}</h3>
              <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                <BookOpen className="w-3 h-3" />
                <span>Across 5 databases</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <Files className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Papers Analyzed */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Papers Analyzed</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalAnalyzed}</h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>{Math.round((totalAnalyzed / totalPapers) * 100)}% analyzed</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60">
              <FileSearch className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Research Gaps Identified */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Research Gaps Identified</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalGaps}</h3>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span>6 high criticality</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Research Projects & Activity Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Research Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Research Projects</h2>
              <p className="text-xs text-muted-foreground">Active investigations in your academic workspace</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/research')}
              className="text-xs gap-1 text-indigo-600 dark:text-indigo-400"
            >
              <span>View all ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3.5">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group"
                onClick={() => handleContinueProject(project)}
              >
                <CardContent className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {project.title}
                        </h3>
                        <Badge variant="indigo" size="sm">
                          {project.domain}
                        </Badge>
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
                      className="shrink-0 text-xs gap-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Progress & Stage Details */}
                  <div className="space-y-1.5 pt-1 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Stage: <strong className="text-foreground capitalize">{project.currentStage}</strong>
                      </span>
                      <span className="font-mono text-muted-foreground font-medium">
                        {project.progress}% Complete
                      </span>
                    </div>
                    <Progress value={project.progress} color="primary" />
                  </div>

                  {/* Meta footer */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Files className="w-3.5 h-3.5 text-muted-foreground" />
                        <strong>{project.papersCount}</strong> papers
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <strong>{project.gapsIdentifiedCount}</strong> gaps
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Updated {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Research Velocity & Quick AI Suggestions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Research Velocity</span>
                <Badge variant="secondary" size="sm">Past 7 Days</Badge>
              </CardTitle>
              <CardDescription>Paper discovery and citation throughput</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '0.5rem', 
                        fontSize: '12px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="papers" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorPapers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-secondary/40 border border-border/50 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI Synthesis Tip
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Your oncology diagnosis project has 4 unanalyzed papers with high relevance scores (&gt;90%). Analyzing them will boost literature matrix density.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Academic Tools Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Research Workflow Stages</CardTitle>
              <CardDescription>Direct navigation to scientific synthesis tools</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {[
                { name: 'Literature Review Matrix', path: `/research/${projects[0]?.id || 'proj-healthcare-ai'}/literature`, icon: BookOpen },
                { name: 'Methodology Analysis Flow', path: `/research/${projects[0]?.id || 'proj-healthcare-ai'}/methodology`, icon: Files },
                { name: 'Comparative Benchmarking', path: `/research/${projects[0]?.id || 'proj-healthcare-ai'}/comparison`, icon: TrendingUp },
                { name: 'Proposed Architecture Diagram', path: `/research/${projects[0]?.id || 'proj-healthcare-ai'}/architecture`, icon: Sparkles },
                { name: 'Automated PPT Generator', path: `/research/${projects[0]?.id || 'proj-healthcare-ai'}/presentation`, icon: ExternalLink },
              ].map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(tool.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-secondary/70 border border-border/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <tool.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{tool.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
