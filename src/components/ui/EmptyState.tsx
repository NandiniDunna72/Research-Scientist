import React from 'react';
import { LucideIcon, FileSearch, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileSearch,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl neon-card-project relative overflow-hidden",
        className
      )}
    >
      {/* Background ambient glow */}
      <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none translate-y-6" />

      {/* Cyber Reticle Icon Holder */}
      <div className="relative mb-5">
        <div className="absolute -inset-2 rounded-2xl border border-cyan-400/30 animate-pulse pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] relative z-10">
          <Icon className="w-8 h-8 animate-neon-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground tracking-tight font-heading gradient-heading">{title}</h3>
      <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 relative z-10">
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              {secondaryActionText}
            </Button>
          )}
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
