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
    <div className="bg-card border-b border-border/80 px-4 sm:px-6 py-3 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* Project Header Info & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
              <FolderOpen className="w-3.5 h-3.5" />
              Project:
            </span>
            <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-xs sm:max-w-md">
              {currentProject.title}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 hidden sm:block" />
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Stage: <strong className="text-foreground font-medium">{currentStep.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground font-mono">
              Stage <strong>{activeIndex + 1}</strong> of <strong>{steps.length}</strong>
            </span>
            <div className="w-24 sm:w-32 bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono min-w-[32px]">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Horizontal Steps Bar (Scrollable on tablet/mobile) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => navigate(step.path)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 select-none",
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-xs font-semibold"
                      : isCompleted
                      ? "bg-secondary text-foreground hover:bg-secondary/80 hover:text-indigo-600 dark:hover:text-indigo-400"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isCurrent ? "text-white" : "text-muted-foreground")} />
                  )}
                  <span>{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-2 h-px bg-border shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
