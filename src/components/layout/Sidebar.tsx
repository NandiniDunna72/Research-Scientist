import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useResearch } from '../../context/ResearchContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Files,
  FileSearch,
  AlertCircle,
  BookMarked,
  Workflow,
  GitCompare,
  Network,
  FileText,
  Presentation,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Laptop,
  Sparkles,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentProject, projects, setCurrentProjectId, settings, theme, setTheme, addToast } = useResearch();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect project from current URL or active state
  const match = location.pathname.match(/^\/research\/([^/]+)/);
  const routeProjectId = match && match[1] !== 'new' ? match[1] : null;
  const activeProject =
    (routeProjectId ? projects.find((p) => p.id === routeProjectId) : null) ||
    currentProject ||
    (projects.length > 0 ? projects[0] : null);

  const pipelinePrefix = activeProject ? `/research/${activeProject.id}` : null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'new-research', label: 'New Research', path: '/research/new', icon: PlusCircle, highlight: true },
    { id: 'my-research', label: 'My Research', path: '/research', icon: FolderKanban },
    { id: 'divider-pipeline', type: 'divider' as const, label: 'RESEARCH PIPELINE' },
    { id: 'papers', label: 'Paper Collection', path: pipelinePrefix ? `${pipelinePrefix}/papers` : undefined, isPipeline: true, icon: Files },
    { id: 'analysis', label: 'Paper Analysis', path: pipelinePrefix ? `${pipelinePrefix}/analysis` : undefined, isPipeline: true, icon: FileSearch },
    { id: 'gaps', label: 'Research Gaps', path: pipelinePrefix ? `${pipelinePrefix}/gaps` : undefined, isPipeline: true, icon: AlertCircle },
    { id: 'questions', label: 'Research Questions', path: pipelinePrefix ? `${pipelinePrefix}/questions` : undefined, isPipeline: true, icon: HelpCircle },
    { id: 'literature', label: 'Literature Review', path: pipelinePrefix ? `${pipelinePrefix}/literature` : undefined, isPipeline: true, icon: BookMarked },
    { id: 'methodology', label: 'Methodology', path: pipelinePrefix ? `${pipelinePrefix}/methodology` : undefined, isPipeline: true, icon: Workflow },
    { id: 'comparison', label: 'Comparison', path: pipelinePrefix ? `${pipelinePrefix}/comparison` : undefined, isPipeline: true, icon: GitCompare },
    { id: 'architecture', label: 'Architecture', path: pipelinePrefix ? `${pipelinePrefix}/architecture` : undefined, isPipeline: true, icon: Network },
    { id: 'documentation', label: 'Documentation', path: pipelinePrefix ? `${pipelinePrefix}/documentation` : undefined, isPipeline: true, icon: FileText },
    { id: 'presentation', label: 'PPT Generation', path: pipelinePrefix ? `${pipelinePrefix}/presentation` : undefined, isPipeline: true, icon: Presentation },
    { id: 'divider-system', type: 'divider' as const, label: 'SYSTEM' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#0a0d24]/90 dark:bg-[#07091c]/95 backdrop-blur-2xl border-r border-[#1a2044] transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-4.5 border-b border-[#1a2044]">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#080b1e] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-[13.5px] font-extrabold tracking-tight font-heading text-white flex items-center gap-1.5 leading-none mb-1">
                AI Research Scientist
              </div>
              <div className="text-[9.5px] text-cyan-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse shadow-[0_0_6px_#22d3ee]" />
                <span>Autonomous Studio</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Project Selector */}
        {currentProject && (
          <div className="px-3.5 py-2.5 border-b border-[#1a2044] bg-[#0c102a]/50">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="text-[9.5px] font-bold text-cyan-400/90 uppercase tracking-widest flex items-center gap-1">
                Active Project
              </label>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                ACTIVE
              </span>
            </div>
            <div className="relative group">
              <select
                value={currentProject.id}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-cyan-500/40 bg-[#0d1230]/95 py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-1.5 focus:ring-cyan-400 focus:border-cyan-400 appearance-none cursor-pointer truncate shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover:border-cyan-400 transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#090d24] text-white">
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 no-scrollbar">
          {navItems.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className="px-3 pt-3.5 pb-1 text-[9.5px] font-bold text-slate-400/80 tracking-widest uppercase flex items-center gap-2 font-mono"
                >
                  <span>{item.label}</span>
                  <div className="h-px bg-[#1a2044] flex-1" />
                </div>
              );
            }

            const Icon = item.icon!;

            // If pipeline item has no active project yet, render as an informative button
            if (item.isPipeline && !item.path) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    addToast({
                      type: 'info',
                      title: 'Project Required',
                      message: `Start a new research project to access ${item.label}.`,
                    });
                    navigate('/research/new');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#121636] transition-colors select-none text-left group cursor-pointer"
                  title="Create or select a project to access this pipeline stage"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-mono tracking-wider shrink-0 uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    NEW
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.id}
                to={item.path!}
                end={item.path === '/dashboard' || item.path === '/research' || item.path === '/research/new'}
                onClick={onClose}
                className={({ isActive }) => {
                  if (isActive) {
                    if (item.id === 'my-research' || item.id === 'dashboard') {
                      return "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none neon-pill-active translate-x-1";
                    }
                    return "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none bg-gradient-to-r from-cyan-500/25 via-indigo-600/30 to-purple-600/20 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] translate-x-1";
                  }
                  return cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 select-none group",
                    "text-slate-300 hover:text-white hover:bg-[#131738] hover:translate-x-0.5",
                    item.highlight && "text-purple-300 font-semibold"
                  );
                }}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400")} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive ? (
                      item.id === 'my-research' ? (
                        <ChevronDown className="w-4 h-4 text-white shrink-0 ml-2" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] shrink-0 ml-2 animate-pulse" />
                      )
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: User Profile & Quick Actions */}
        <div className="p-3 border-t border-[#1a2044] bg-[#0c102a]/40 space-y-2">
          {/* Theme Quick Selector */}
          <div className="flex items-center justify-between p-1 bg-[#090d24] rounded-xl border border-[#1a2044]">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Theme</span>
            <div className="flex items-center gap-1 bg-[#101436] p-0.5 rounded-lg border border-[#1e2548]">
              <button
                onClick={() => setTheme('light')}
                title="Light Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'light' ? "bg-white text-indigo-600 shadow-sm font-bold" : "text-slate-400 hover:text-white"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'dark' ? "bg-cyan-500/20 text-cyan-300 shadow-sm font-bold border border-cyan-500/30" : "text-slate-400 hover:text-white"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                title="System Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'system' ? "bg-[#161c46] text-purple-300 shadow-sm font-bold" : "text-slate-400 hover:text-white"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Profile & Logout - Matching Screenshot */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#0d1230]/90 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.18)] hover:border-cyan-400 transition-colors">
            <div 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-[0_0_10px_rgba(147,51,234,0.4)]">
                D
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Dr. Alex Vance
                </div>
                <div className="text-[10px] text-cyan-300/80 truncate font-mono">
                  alex.vance@stanford.edu
                </div>
              </div>
            </div>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                await logout();
                navigate('/');
              }}
              title="Sign Out of Workspace"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
