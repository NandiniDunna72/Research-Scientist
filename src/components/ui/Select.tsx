import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-9.5 w-full appearance-none rounded-xl border border-[#1e2548] bg-[#07091a]/95 px-3 py-1.5 pr-8 text-sm text-slate-200 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 focus-visible:shadow-[0_0_12px_rgba(6,182,212,0.2)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';
