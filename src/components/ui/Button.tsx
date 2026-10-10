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
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-500",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
      ghost: "text-foreground hover:bg-accent/60 hover:text-accent-foreground",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20",
      subtle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
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
