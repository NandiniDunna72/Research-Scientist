import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResearch } from '../../context/ResearchContext';
import { 
  Lightbulb, 
  Files, 
  FileSearch, 
  AlertCircle, 
  HelpCircle,
  BookMarked, 
  Workflow, 
  GitCompare, 
  Network, 
  FileText, 
  Presentation,
  CheckCircle2,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ResearchStepper: React.FC = () => {
  const { currentProject } = useResearch();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentProject) return null;

  const projectId = currentProject.id;

  const steps = [
    { id: 'topic', name: 'Topic', path: `/research/${projectId}`, icon: Lightbulb },
    { id: 'papers', name: 'Papers', path: `/research/${projectId}/papers`, icon: Files },
    { id: 'analysis', name: 'Analysis', path: `/research/${projectId}/analysis`, icon: FileSearch },
    { id: 'gaps', name: 'Gaps', path: `/research/${projectId}/gaps`, icon: AlertCircle },
    { id: 'questions', name: 'Questions', path: `/research/${projectId}/questions`, icon: HelpCircle },
    { id: 'literature', name: 'Literature', path: `/research/${projectId}/literature`, icon: BookMarked },
    { id: 'methodology', name: 'Methodology', path: `/research/${projectId}/methodology`, icon: Workflow },
    { id: 'comparison', name: 'Comparison', path: `/research/${projectId}/comparison`, icon: GitCompare },
    { id: 'architecture', name: 'Architecture', path: `/research/${projectId}/architecture`, icon: Network },
    { id: 'documentation', name: 'Documentation', path: `/research/${projectId}/documentation`, icon: FileText },
    { id: 'presentation', name: 'PPT', path: `/research/${projectId}/presentation`, icon: Presentation },
  ];

  // Determine current active step index based on location pathname
  const currentStepIndex = steps.findIndex((step) => {
    if (step.id === 'topic') {
      return location.pathname === `/research/${projectId}` || location.pathname === `/research/${projectId}/`;
    }
    return location.pathname.includes(step.id);
  });

  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 1;
  const currentStep = steps[activeIndex] || steps[0];

  // Calculate progress percentage
  const progressPercent = Math.round(((activeIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-card/75 dark:bg-card/70 backdrop-blur-xl border-b border-border/80 px-4 sm:px-6 py-3 transition-colors shadow-2xs sticky top-16 z-20">
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* Project Header Info & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Project</span>
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-foreground truncate max-w-xs sm:max-w-md font-heading tracking-tight">
              {currentProject.title}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 hidden sm:block" />
            <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
              <span>Stage:</span>
              <strong className="text-foreground font-semibold px-2 py-0.5 rounded-md bg-secondary/60 text-[11px] font-mono">{currentStep.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-muted-foreground font-mono">
              Stage <strong className="text-foreground">{activeIndex + 1}</strong> of <strong className="text-foreground">{steps.length}</strong>
            </span>
            <div className="w-24 sm:w-32 bg-secondary/80 h-2 rounded-full overflow-hidden border border-border/60 relative">
              <div 
                className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-glow-xs relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/70 rounded-full animate-pulse" />
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono min-w-[32px]">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Horizontal Steps Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => navigate(step.path)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 select-none group",
                    isCurrent
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-glow-sm font-bold scale-[1.02]"
                      : isCompleted
                      ? "bg-secondary/60 text-foreground hover:bg-secondary hover:text-indigo-600 dark:hover:text-indigo-400 border border-border/50"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/40 cursor-pointer border border-transparent"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[9.5px] font-mono font-bold shrink-0 transition-colors",
                    isCurrent 
                      ? "bg-white/20 text-white" 
                      : isCompleted 
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                      : "bg-muted text-muted-foreground group-hover:bg-secondary"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span>{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-2 h-px bg-border/60 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
