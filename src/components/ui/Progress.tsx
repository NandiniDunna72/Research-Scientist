import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: 'primary' | 'emerald' | 'amber';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  color = 'primary',
  showLabel = false,
  ...props
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const colors = {
    primary: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={cn("w-full flex items-center gap-2", className)} {...props}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-muted-foreground min-w-[32px] text-right font-mono">
          {clamped}%
        </span>
      )}
    </div>
  );
};
