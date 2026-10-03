import React from "react";
import type { Theme } from "../../types";

interface PhoneMockupFrameProps {
  theme: Theme;
  children: React.ReactNode;
}

export const PhoneMockupFrame: React.FC<PhoneMockupFrameProps> = ({ theme, children }) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-[100dvh] w-full flex items-center justify-center sm:p-6 sm:py-8 transition-colors duration-200 ${
        isDark ? "bg-[#0b0c0e]" : "bg-[#d7e0e3]"
      }`}
    >
      {/* Smartphone Hardware Frame (visible on desktop/tablet) */}
      <div
        className={`w-full max-w-[420px] min-h-[100dvh] sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] overflow-hidden flex flex-col relative transition-all duration-200 ${
          isDark
            ? "bg-palette-charcoal-bg sm:border-[#222428] sm:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9)]"
            : "bg-palette-mint sm:border-[#ffffff] sm:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.18)]"
        }`}
      >
        {/* Phone Dynamic Island / Speaker Notch (only on desktop mockup) */}
        <div className="hidden sm:flex justify-center pt-2 pb-0.5 shrink-0 z-30 select-none bg-inherit">
          <div className="w-24 h-4 rounded-full bg-black/90 flex items-center justify-between px-3 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#1e293b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] border border-neutral-700/60" />
          </div>
        </div>

        {/* Screen View Container */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
