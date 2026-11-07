import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
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
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased selection:bg-[#063BA1] selection:text-white">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#FAFAFA]">
        {/* Top bar (Black top panel) */}
        <div className="flex items-center bg-black border-b border-zinc-800">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-3 text-zinc-400 hover:text-white lg:hidden border-b border-zinc-800 bg-black transition cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Header
              onOpenAI={() => setAiModalOpen(true)}
            />
          </div>
        </div>

        {/* Dynamic page content (Milky white workspace) */}
        <div className="flex flex-1 overflow-hidden bg-[#FAFAFA]">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar milky-theme bg-[#FAFAFA] text-slate-800">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
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

