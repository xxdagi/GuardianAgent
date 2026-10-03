import React from "react";
import { ArrowLeft } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface SettingsHeaderProps {
  language: Language;
  theme: Theme;
  onBackToHome: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  language,
  theme,
  onBackToHome,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`flex items-center justify-between border-b pb-4 mb-6 transition-colors ${
        isDark ? "border-[#9cadc0]/30" : "border-[#9cadc0]/25"
      }`}
    >
      <button
        onClick={onBackToHome}
        className="btn-mini-tactile px-3.5 py-1.5 text-xs text-[#1c2b39] dark:text-[#c0d4ed]"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        {getTranslation(language, "back")}
      </button>

      <h1 className="text-xl font-black tracking-tight text-[#1c2b39] dark:text-[#c0d4ed]">
        {getTranslation(language, "settings")}
      </h1>
      <div className="w-12" />
    </div>
  );
};
