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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0a0d24]/85 dark:bg-[#07091c]/90 backdrop-blur-xl border-b border-[#1a2044] transition-colors shadow-sm">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-[#131738] rounded-xl transition-all"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span 
            onClick={() => navigate('/research')} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#131738] cursor-pointer font-medium transition-all"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
            <span>Projects</span>
          </span>
          <span className="text-slate-600 font-mono">/</span>
          <span className="text-white font-semibold px-2 py-1">Workspace</span>

          {/* Live AI Engine Badge - Gemini 3.5 Flash Active */}
          <div className="hidden lg:inline-flex items-center gap-2 ml-2 px-3 py-1 rounded-full bg-[#101432] border border-cyan-500/40 text-[10.5px] font-medium text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">GEMINI 3.5 FLASH ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div 
          onClick={() => navigate('/research')}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#1e2548] bg-[#0c102a] text-slate-300 text-xs hover:border-cyan-500/60 hover:bg-[#0f1435] hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-200 group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="group-hover:text-white transition-colors">Search papers, topics...</span>
          <kbd className="text-[10px] bg-[#141a3e] px-1.5 py-0.5 rounded-md border border-[#222c5e] font-mono text-cyan-300/80 shadow-2xs">⌘K</kbd>
        </div>

        {/* Start New Research - Pill with glowing purple outline */}
        <button
          onClick={() => navigate('/research/new')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs h-9 px-3.5 rounded-xl border border-purple-500/70 bg-[#121026] text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-purple-400" />
          <span>New Research</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-[#131738] rounded-xl transition-all border border-transparent hover:border-[#1e2548]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Ask Research AI Button - Radiant Glowing Pill */}
        <button
          onClick={toggleAIAssistant}
          className="btn-ai-glow-cyan-magenta text-white h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
          <span>Ask Research AI</span>
        </button>

        {/* Sign Out Action */}
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
          title="Sign Out of Workspace"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
