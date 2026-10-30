import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'indigo' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
    secondary: 'bg-[#101436] text-slate-300 border-[#1e2548]',
    outline: 'border border-[#1e2548] text-slate-300 bg-transparent',
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    destructive: 'bg-rose-950/40 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    indigo: 'bg-[#121636] text-indigo-300 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]',
    purple: 'bg-[#1a1236] text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors select-none font-mono',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
