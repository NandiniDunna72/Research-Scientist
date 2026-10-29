import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../../context/ResearchContext';
import { 
  Menu, 
  Sparkles, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  FolderKanban,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { toggleAIAssistant, theme, setTheme } = useResearch();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-card/75 dark:bg-card/70 backdrop-blur-xl border-b border-border/80 transition-colors shadow-xs">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span 
            onClick={() => navigate('/research')} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 cursor-pointer font-medium transition-all"
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
            <span>Projects</span>
          </span>
          <span className="text-muted-foreground/30 font-mono">/</span>
          <span className="text-foreground font-semibold px-2 py-1">Workspace</span>

          {/* Live AI Engine Badge */}
          <div className="hidden lg:inline-flex items-center gap-2 ml-2 px-3 py-1 rounded-full bg-indigo-500/[0.08] dark:bg-indigo-500/[0.14] border border-indigo-500/25 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10.5px] font-semibold tracking-wider uppercase">Gemini 3.5 Flash Active</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div 
          onClick={() => navigate('/research')}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-border/80 bg-secondary/40 text-muted-foreground text-xs hover:border-indigo-400/80 dark:hover:border-indigo-500/60 hover:bg-card hover:shadow-xs cursor-pointer transition-all duration-200 group"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
          <span className="group-hover:text-foreground transition-colors">Search papers, topics...</span>
          <kbd className="text-[10px] bg-card dark:bg-secondary/90 px-1.5 py-0.5 rounded-md border border-border font-mono text-muted-foreground shadow-2xs">⌘K</kbd>
        </div>

        {/* Start New Research */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/research/new')}
          className="hidden sm:inline-flex text-xs h-9 gap-1.5 rounded-xl border-border/80 hover:border-indigo-400/60 hover:bg-secondary/80 font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>New Research</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all border border-transparent hover:border-border/60"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Ask Research AI Button */}
        <button
          onClick={toggleAIAssistant}
          className="btn-ai-glow text-white h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>Ask Research AI</span>
        </button>

        {/* Sign Out Action */}
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
          title="Sign Out of Workspace"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
