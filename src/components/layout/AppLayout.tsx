import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useResearch } from '../../context/ResearchContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ResearchStepper } from './ResearchStepper';
import { AIAssistantPanel } from '../assistant/AIAssistantPanel';
import { ToastContainer } from '../ui/ToastContainer';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentProject, setCurrentProjectId } = useResearch();

  // Show stepper if we are inside a project pipeline
  const match = location.pathname.match(/^\/research\/([^/]+)/);
  const routeProjectId = match && match[1] !== 'new' ? match[1] : null;

  useEffect(() => {
    if (routeProjectId && currentProject?.id !== routeProjectId) {
      setCurrentProjectId(routeProjectId);
    }
  }, [routeProjectId, currentProject?.id]);

  const isResearchRoute = location.pathname.startsWith('/research/') && 
    location.pathname !== '/research/new' &&
    !location.pathname.endsWith('/edit');

  return (
    <div className="min-h-screen bg-background bg-tech-grid text-foreground flex flex-col antialiased relative selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
      {/* Ambient Lighting Orbs for Immersive Cyberpunk Visual Depth */}
      <div className="fixed top-[-10%] left-1/4 w-[750px] h-[750px] bg-gradient-to-br from-indigo-500/[0.08] to-purple-600/[0.08] dark:from-indigo-600/[0.18] dark:to-purple-600/[0.14] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-5 w-[650px] h-[650px] bg-gradient-to-tl from-cyan-500/[0.08] to-indigo-600/[0.1] dark:from-cyan-400/[0.15] dark:to-purple-600/[0.15] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-[-10%] w-[500px] h-[500px] bg-purple-500/[0.05] dark:bg-fuchsia-600/[0.1] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Workflow Stepper Indicator */}
        {isResearchRoute && <ResearchStepper />}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Persistent AI Research Assistant Drawer */}
      <AIAssistantPanel />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};
