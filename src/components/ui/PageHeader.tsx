import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
