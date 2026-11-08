import React from 'react';

interface PoweredByFooterProps {
  className?: string;
}

export const PoweredByFooter: React.FC<PoweredByFooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`mt-10 mb-3 pt-6 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${className}`}
    >
      {/* Left: System Status / Trust indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <span className="flex h-2 w-2 rounded-full bg-[#00D2BC] animate-pulse shadow-[0_0_8px_#00D2BC]" />
        <span className="font-semibold text-slate-800">School Management System</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500">Secure 256-bit Encryption</span>
      </div>

      {/* Center: Powered By + Logo Image Box styled with theme blue-to-turquoise gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A2E68 0%, #064E78 40%, #027A8F 75%, #00D2BC 100%)',
        }}
        className="flex items-center justify-center gap-2.5 rounded-xl px-4 py-1.5 shadow-sm border border-white/30 hover:opacity-95 transition"
      >
        <span className="text-xs font-semibold text-[#F4F6F8] tracking-wide">
          Powered By
        </span>
        <img
          src="/assets/aistudio/NEXORA_Technologies_Logo_290384d8.png"
          alt="NEXORA Technologies"
          style={{ filter: 'brightness(0) invert(0.96) drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
          className="h-6 sm:h-7 w-auto max-w-[170px] object-contain transition-transform hover:scale-105 duration-200"
        />
      </div>

      {/* Right: Operational Status */}
      <div className="text-[11px] text-slate-500 font-medium">
        All Systems Operational
      </div>
    </footer>
  );
};

