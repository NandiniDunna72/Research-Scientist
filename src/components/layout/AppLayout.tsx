import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ResearchStepper } from './ResearchStepper';
import { AIAssistantPanel } from '../assistant/AIAssistantPanel';
import { ToastContainer } from '../ui/ToastContainer';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Show stepper if we are inside a project pipeline
  const isResearchRoute = location.pathname.startsWith('/research/') && 
    location.pathname !== '/research/new' &&
    !location.pathname.endsWith('/edit');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
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
