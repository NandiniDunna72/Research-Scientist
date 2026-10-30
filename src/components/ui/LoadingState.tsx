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
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center relative", className)}>
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none translate-y-8" />

      {/* Cybernetic Holographic Spinner Reticle */}
      <div className="relative mb-6">
        {/* Outer orbital ring */}
        <div className="absolute -inset-3 rounded-full border border-dashed border-cyan-400/40 animate-[spin_8s_linear_infinite]" />
        {/* Counter-rotating inner ring */}
        <div className="absolute -inset-1 rounded-full border border-fuchsia-500/40 animate-[spin_5s_linear_infinite_reverse]" />
        
        <div className="w-16 h-16 rounded-2xl bg-[#0a0d26] flex items-center justify-center text-cyan-300 border border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)] relative z-10">
          <Sparkles className="w-8 h-8 animate-neon-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)] z-20">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-foreground tracking-tight font-heading gradient-heading">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-md font-mono">{subtitle}</p>

      {showProgress && (
        <div className="w-full max-w-md mt-6 space-y-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SYNTHESIS PIPELINE
            </span>
            <span className="font-bold text-cyan-300">{percent}%</span>
          </div>

          <div className="w-full bg-[#0d1230] border border-[#1e2752] h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              initial={{ width: '10%' }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="neon-card-project rounded-xl p-4 text-left space-y-2.5 shadow-lg relative cyber-scanline">
            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span
                    className={cn(
                      isDone
                        ? 'text-slate-400 line-through opacity-70 font-mono text-[11px]'
                        : isCurrent
                        ? 'font-medium text-cyan-200 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] font-mono text-[11px]'
                        : 'text-slate-500 font-mono text-[11px]'
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
