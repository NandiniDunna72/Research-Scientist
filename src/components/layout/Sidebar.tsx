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
    { id: 'presentation', label: 'PPT Generator', path: pipelinePrefix ? `${pipelinePrefix}/presentation` : undefined, isPipeline: true, icon: Presentation },
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
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-card/85 dark:bg-card/80 backdrop-blur-2xl border-r border-border/80 transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-4.5 border-b border-border/70">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-glow-sm group-hover:scale-105 group-hover:shadow-glow-md transition-all duration-300">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="text-[13.5px] font-extrabold tracking-tight font-heading text-foreground flex items-center gap-1.5 leading-none mb-1">
                AI Research Scientist
              </div>
              <div className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Autonomous Studio</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Project Selector */}
        {currentProject && (
          <div className="px-3.5 py-2.5 border-b border-border/60 bg-secondary/20">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                Active Project
              </label>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                ACTIVE
              </span>
            </div>
            <div className="relative group">
              <select
                value={currentProject.id}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-border/80 bg-card/90 py-2 pl-3 pr-8 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer truncate shadow-2xs group-hover:border-indigo-400/60 transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={item.id}
                  className="px-3 pt-3.5 pb-1 text-[9.5px] font-bold text-muted-foreground/80 tracking-widest uppercase flex items-center gap-2"
                >
                  <span>{item.label}</span>
                  <div className="h-px bg-border/40 flex-1" />
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
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground/60 hover:text-foreground hover:bg-secondary/40 transition-colors select-none text-left group cursor-pointer"
                  title="Create or select a project to access this pipeline stage"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/40 font-mono tracking-wider shrink-0 uppercase px-1.5 py-0.5 rounded bg-secondary/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 transition-colors">
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
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 select-none group",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-purple-500/5 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30 shadow-2xs translate-x-1"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:translate-x-0.5",
                    item.highlight && !isActive && "text-indigo-600 dark:text-indigo-400 font-semibold"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: User Profile & Quick Actions */}
        <div className="p-3 border-t border-border/70 bg-secondary/20 space-y-2">
          {/* Theme Quick Selector */}
          <div className="flex items-center justify-between p-1 bg-card/90 rounded-xl border border-border/70 shadow-2xs">
            <span className="text-[11px] text-muted-foreground font-semibold px-2">Theme</span>
            <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg">
              <button
                onClick={() => setTheme('light')}
                title="Light Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'light' ? "bg-card text-indigo-600 shadow-2xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'dark' ? "bg-card text-indigo-400 shadow-2xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                title="System Mode"
                className={cn(
                  "p-1.5 rounded-md text-xs transition-all",
                  theme === 'system' ? "bg-card text-indigo-500 shadow-2xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-card/80 border border-border/70 shadow-2xs hover:border-indigo-400/40 transition-colors">
            <div 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : settings?.profile?.name ? settings.profile.name.charAt(0) : 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">
                  {user?.full_name || settings?.profile?.name || 'Researcher'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">
                  {user?.email || settings?.profile?.role || 'Principal AI Scientist'}
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
              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
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
