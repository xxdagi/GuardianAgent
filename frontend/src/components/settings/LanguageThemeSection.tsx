import React from "react";
import { Globe, Sun, Moon } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface LanguageThemeSectionProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export const LanguageThemeSection: React.FC<LanguageThemeSectionProps> = ({
  language,
  onSelectLanguage,
  theme,
  onSelectTheme,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* 1. Language */}
      <div
        className={`border-2 rounded-2xl p-4 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
          isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
        }`}
      >
        <div className="flex items-center space-x-2 text-xs font-black mb-3 text-[#1c2b39] dark:text-[#c0d4ed]">
          <Globe className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
          <span>{getTranslation(language, "languageTitle")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectLanguage("pl")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black text-center border-2 transition-all ${
              language === "pl"
                ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                : isDark
                ? "bg-[#0f1720] text-[#c0d4ed] border-[#9cadc0]/40 hover:border-[#9cadc0]"
                : "bg-white text-[#1c2b39] border-[#9cadc0]/40 hover:border-[#9cadc0]"
            }`}
          >
            Polski
          </button>

          <button
            onClick={() => onSelectLanguage("en")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black text-center border-2 transition-all ${
              language === "en"
                ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                : isDark
                ? "bg-[#0f1720] text-[#c0d4ed] border-[#9cadc0]/40 hover:border-[#9cadc0]"
                : "bg-white text-[#1c2b39] border-[#9cadc0]/40 hover:border-[#9cadc0]"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 2. Theme Light / Dark */}
      <div
        className={`border-2 rounded-2xl p-4 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
          isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
        }`}
      >
        <div className="flex items-center space-x-2 text-xs font-black mb-3 text-[#1c2b39] dark:text-[#c0d4ed]">
          {isDark ? <Moon className="w-4 h-4 text-[#c0d4ed]" /> : <Sun className="w-4 h-4 text-[#9cadc0]" />}
          <span>{getTranslation(language, "themeTitle")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectTheme("dark")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border-2 transition-all ${
              isDark
                ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                : "bg-white text-[#1c2b39] border-[#9cadc0]/40 hover:border-[#9cadc0]"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{getTranslation(language, "themeDark")}</span>
          </button>

          <button
            onClick={() => onSelectTheme("light")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border-2 transition-all ${
              !isDark
                ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                : "bg-[#0f1720] text-[#c0d4ed] border-[#9cadc0]/40 hover:border-[#9cadc0]"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{getTranslation(language, "themeLight")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
