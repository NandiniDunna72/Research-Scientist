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
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {secondaryActionText && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {actionText && onAction && (
            <Button variant="primary" size="sm" onClick={onAction} className="gap-1.5">
              {actionText}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
