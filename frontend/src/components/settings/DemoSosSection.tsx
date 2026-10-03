import React from "react";
import { ShieldAlert } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface DemoSosSectionProps {
  language: Language;
  theme: Theme;
  onTestEmergencyTrigger: () => void;
}

export const DemoSosSection: React.FC<DemoSosSectionProps> = ({
  language,
  theme,
  onTestEmergencyTrigger,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
        isDark ? "bg-[#18222e] border-[#9cadc0]/50" : "bg-[#f0f5fc]/60 border-[#9cadc0]/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "demoSosTitle")}
          </h3>
          <p className="text-[11px] font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/70">
            {getTranslation(language, "demoSosDesc")}
          </p>
        </div>
        <button
          onClick={onTestEmergencyTrigger}
          className="px-3.5 py-2 bg-[#9cadc0] hover:bg-[#788a9e] rounded-xl text-xs font-black text-white flex items-center transition-all shadow-[0_2px_0_0_#788a9e] active:translate-y-0.5"
        >
          <ShieldAlert className="w-4 h-4 mr-1 text-white" /> {getTranslation(language, "simulateSosBtn")}
        </button>
      </div>
    </div>
  );
};
