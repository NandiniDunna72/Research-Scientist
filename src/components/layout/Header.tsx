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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-card/85 backdrop-blur-md border-b border-border transition-colors">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span 
            onClick={() => navigate('/research')} 
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer font-medium"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Projects
          </span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold">Workspace</span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div 
          onClick={() => navigate('/research')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/40 text-muted-foreground text-xs hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Search papers, topics...</span>
          <kbd className="text-[10px] bg-card px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
        </div>

        {/* Start New Research */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/research/new')}
          className="hidden sm:inline-flex text-xs h-9 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>New Research</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Ask Research AI Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={toggleAIAssistant}
          className="h-9 px-3.5 rounded-lg text-xs gap-1.5 shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold">Ask Research AI</span>
        </Button>

        {/* Sign Out Action */}
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          title="Sign Out of Workspace"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
