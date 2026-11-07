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
    <div
      className="relative flex min-h-screen text-[#F4F6F8] font-sans antialiased selection:bg-[#00D2BC] selection:text-[#0A2E68] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 35%, #027A8F 70%, #00D2BC 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Blue-to-Turquoise Ambient Lighting Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top-left deep royal blue aura */}
        <div className="absolute -top-40 -left-24 h-[42rem] w-[42rem] rounded-full bg-[#0A3997]/25 blur-[120px]" />
        {/* Bottom-right radiant turquoise aura */}
        <div className="absolute -bottom-36 -right-20 h-[44rem] w-[44rem] rounded-full bg-[#00D2BC]/30 blur-[130px]" />
        {/* Center azure transition aura */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-[#0284A6]/20 blur-[140px]" />
        {/* Subtle geometric dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#00D2BC 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px',
          }}
        />
      </div>

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        {/* Top bar (Black panel with subtle border) */}
        <div className="flex items-center bg-black/95 backdrop-blur-md border-b border-white/10 shadow-sm">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-3 text-zinc-400 hover:text-white lg:hidden border-b border-white/10 bg-black transition cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Header
              onOpenAI={() => setAiModalOpen(true)}
            />
          </div>
        </div>

        {/* Dynamic page content on Blue-to-Turquoise gradient */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar ocean-gradient-theme text-[#F4F6F8]">
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


