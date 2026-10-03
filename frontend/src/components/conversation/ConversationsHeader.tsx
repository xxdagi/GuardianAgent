import React from "react";
import { ArrowLeft } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface ConversationsHeaderProps {
  language: Language;
  theme: Theme;
  onBackToHome: () => void;
}

export const ConversationsHeader: React.FC<ConversationsHeaderProps> = ({
  language,
  theme,
  onBackToHome,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`border-b pb-4 mb-5 transition-colors ${
        isDark ? "border-[#9cadc0]/30" : "border-[#9cadc0]/25"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBackToHome}
          className="btn-mini-tactile px-3.5 py-1.5 text-xs text-[#1c2b39] dark:text-[#c0d4ed]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {getTranslation(language, "back")}
        </button>
      </div>

      <h1 className="text-xl font-black tracking-tight text-[#1c2b39] dark:text-[#c0d4ed]">
        {getTranslation(language, "conversationsPageTitle")}
      </h1>
      <p className="text-xs mt-1 font-medium text-[#9cadc0] dark:text-[#c0d4ed]/70">
        {getTranslation(language, "conversationsPageSub")}
      </p>
    </div>
  );
};
