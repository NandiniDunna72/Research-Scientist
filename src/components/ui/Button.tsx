import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer";

    const variants = {
      primary: "bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_22px_rgba(6,182,212,0.55)] border border-cyan-400/40",
      secondary: "bg-[#101436] text-slate-200 border border-[#1e2548] hover:bg-[#151c4a] hover:border-cyan-500/40 hover:text-white shadow-xs",
      outline: "border border-[#1e2548] bg-[#0c102a]/80 text-slate-300 hover:border-cyan-500/50 hover:text-white hover:bg-[#121638]",
      ghost: "text-slate-300 hover:text-white hover:bg-[#121638]",
      destructive: "bg-rose-600/90 text-white hover:bg-rose-600 shadow-[0_0_14px_rgba(225,29,72,0.4)] border border-rose-500/40",
      subtle: "bg-[#12173d] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#182052] shadow-[0_0_8px_rgba(6,182,212,0.15)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-xs sm:text-sm gap-2",
      lg: "h-11 px-5 text-sm sm:text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
