import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const { currentProject, projects, setCurrentProjectId, settings, theme, setTheme } = useResearch();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const projectId = currentProject?.id || 'proj-healthcare-ai';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Research', path: '/research/new', icon: PlusCircle, highlight: true },
    { label: 'My Research', path: '/research', icon: FolderKanban },
    { type: 'divider', label: 'RESEARCH PIPELINE' },
    { label: 'Paper Collection', path: `/research/${projectId}/papers`, icon: Files },
    { label: 'Paper Analysis', path: `/research/${projectId}/analysis`, icon: FileSearch },
    { label: 'Research Gaps', path: `/research/${projectId}/gaps`, icon: AlertCircle },
    { label: 'Research Questions', path: `/research/${projectId}/questions`, icon: HelpCircle },
    { label: 'Literature Review', path: `/research/${projectId}/literature`, icon: BookMarked },
    { label: 'Methodology', path: `/research/${projectId}/methodology`, icon: Workflow },
    { label: 'Comparison', path: `/research/${projectId}/comparison`, icon: GitCompare },
    { label: 'Architecture', path: `/research/${projectId}/architecture`, icon: Network },
    { label: 'Documentation', path: `/research/${projectId}/documentation`, icon: FileText },
    { label: 'PPT Generator', path: `/research/${projectId}/presentation`, icon: Presentation },
    { type: 'divider', label: 'SYSTEM' },
    { label: 'Settings', path: '/settings', icon: Settings },
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
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border/80">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                AI Research Scientist
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">Academic Workspace</div>
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
          <div className="px-3.5 py-3 border-b border-border/60 bg-secondary/30">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Active Project
            </label>
            <div className="relative">
              <select
                value={currentProject.id}
                onChange={(e) => setCurrentProjectId(e.target.value)}
                className="w-full text-xs font-medium rounded-lg border border-border/80 bg-card py-1.5 pl-2.5 pr-7 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600 appearance-none cursor-pointer truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 no-scrollbar">
          {navItems.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={idx}
                  className="px-3 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase"
                >
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon!;
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === '/dashboard' || item.path === '/research'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none",
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70",
                    item.highlight && !isActive && "text-indigo-600 dark:text-indigo-400 font-semibold"
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: User Profile & Quick Actions */}
        <div className="p-3 border-t border-border/80 bg-secondary/20 space-y-2">
          {/* Theme Quick Selector */}
          <div className="flex items-center justify-between px-2 py-1 bg-card rounded-lg border border-border/60">
            <span className="text-[11px] text-muted-foreground font-medium">Theme</span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setTheme('light')}
                title="Light Mode"
                className={cn(
                  "p-1 rounded-md text-xs transition-colors",
                  theme === 'light' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                className={cn(
                  "p-1 rounded-md text-xs transition-colors",
                  theme === 'dark' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                title="System Mode"
                className={cn(
                  "p-1 rounded-md text-xs transition-colors",
                  theme === 'system' ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-card/60 border border-border/60">
            <div 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : settings?.profile?.name ? settings.profile.name.charAt(0) : 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">
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
