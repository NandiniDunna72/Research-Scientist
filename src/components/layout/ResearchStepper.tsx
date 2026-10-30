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
    <div className="bg-[#0a0d24]/90 dark:bg-[#07091c]/95 backdrop-blur-2xl border-b border-[#1a2044] px-4 sm:px-6 py-3 transition-colors shadow-lg sticky top-16 z-20">
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* Project Header Info & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#101436] border border-cyan-500/40 text-cyan-300 text-[11px] font-bold shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project</span>
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md font-heading tracking-tight">
              {currentProject.title}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
            <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1.5">
              <span>Stage:</span>
              <strong className="text-cyan-300 font-semibold px-2 py-0.5 rounded-md bg-[#11173d] border border-cyan-500/30 text-[11px] font-mono shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                {currentStep.name}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              Stage <strong className="text-cyan-300 font-bold">{activeIndex + 1}</strong> of <strong className="text-white">{steps.length}</strong>
            </span>
            <div className="w-24 sm:w-36 bg-[#0f1430] h-2 rounded-full overflow-hidden border border-cyan-500/20 relative shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]">
              <div 
                className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#22d3ee] relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full animate-pulse shadow-[0_0_4px_#ffffff]" />
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-300 font-mono min-w-[32px]">
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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 select-none group cursor-pointer",
                    isCurrent
                      ? "bg-gradient-to-r from-[#6d28d9] via-[#9333ea] to-[#06b6d4] text-white shadow-[0_0_16px_rgba(6,182,212,0.45)] border border-cyan-400/50 font-bold scale-[1.02]"
                      : isCompleted
                      ? "bg-[#0d1334]/80 text-cyan-200 hover:text-white hover:bg-[#131c4a] border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                      : "text-slate-400 hover:text-white hover:bg-[#121638] border border-transparent"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[9.5px] font-mono font-bold shrink-0 transition-colors",
                    isCurrent 
                      ? "bg-white/20 text-white" 
                      : isCompleted 
                      ? "bg-cyan-500/20 text-cyan-300" 
                      : "bg-[#11173d] text-slate-400 group-hover:bg-[#161f52]"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span>{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-2 h-px bg-[#1a2044] shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
