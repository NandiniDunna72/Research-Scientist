import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  steps?: string[];
  activeStep?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  showProgress?: boolean;
}

const defaultAiSteps = [
  'Understanding research topic & domain ontologies...',
  'Querying cross-repository databases (arXiv, PubMed, IEEE)...',
  'Ranking papers by citation density & semantic relevance...',
  'Extracting key findings, methodologies, & limitations...',
  'Synthesizing cross-paper research gaps & opportunities...',
  'Preparing interactive research workspace...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  steps = defaultAiSteps,
  title = 'AI Research Engine in Progress',
  subtitle = 'Synthesizing academic literature and structured insights',
  className,
  showProgress = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  const percent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center", className)}>
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-lg shadow-indigo-500/10 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-md">{subtitle}</p>

      {showProgress && (
        <div className="w-full max-w-md mt-6 space-y-4">
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600 rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2.5 shadow-sm">
            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={cn(
                      isDone
                        ? 'text-muted-foreground line-through opacity-70'
                        : isCurrent
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground/50'
                    )}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/70 dark:bg-muted/40", className)}
    />
  );
};
