import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import { Menu } from 'lucide-react';
import { PoweredByFooter } from '../common/PoweredByFooter';

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
    <div className="flex min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased selection:bg-[#00D2BC] selection:text-[#0A2E68]">
      {/* Sidebar navigation (Left pan in blue-to-turquoise gradient) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#FAFAFA]">
        {/* Top bar (Top pan in blue-to-turquoise gradient) */}
        <div
          className="flex items-center border-b border-white/15 shadow-sm"
          style={{
            background: 'linear-gradient(90deg, #0A2E68 0%, #064E78 35%, #027A8F 70%, #00D2BC 100%)',
          }}
        >
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-3 text-white/80 hover:text-white lg:hidden border-r border-white/15 bg-transparent transition cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Header
              onOpenAI={() => setAiModalOpen(true)}
            />
          </div>
        </div>

        {/* Dynamic page content (Remaining all in Milky White colour) */}
        <div className="flex flex-1 overflow-hidden bg-[#FAFAFA]">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar milky-theme bg-[#FAFAFA] text-slate-800">
            <div className="mx-auto max-w-7xl flex flex-col min-h-full justify-between">
              <div className="flex-1">{children}</div>
              {/* Powered By and Logo added at the end of every page */}
              <PoweredByFooter />
            </div>
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


