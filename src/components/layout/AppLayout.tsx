import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 text-zinc-400 hover:text-white lg:hidden border-b border-zinc-800 bg-zinc-950"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Header
              onOpenAI={() => setAiModalOpen(true)}
              onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
              rightPanelOpen={rightPanelOpen}
            />
          </div>
        </div>

        {/* Dynamic page content & Right Side Panel */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>

          {/* Right side panel with F5F5F5 theme */}
          {rightPanelOpen && (
            <RightPanel
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              onNavigateTab={setActiveTab}
              onOpenAI={() => setAiModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Global AI Copilot Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
};
