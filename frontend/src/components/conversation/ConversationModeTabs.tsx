import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface ConversationModeTabsProps {
  language: Language;
  activeTab: "default" | "custom";
  onTabChange: (tab: "default" | "custom") => void;
  customScenariosCount: number;
}

export const ConversationModeTabs: React.FC<ConversationModeTabsProps> = ({
  language,
  activeTab,
  onTabChange,
  customScenariosCount,
}) => {
  return (
    <div className="mb-5">
      <div className="grid grid-cols-2 p-1.5 rounded-2xl border-2 border-[#9cadc0]/50 bg-[#f0f5fc]/80 dark:bg-[#18222e] shadow-[0_2px_0_0_#c0d4ed]">
        <button
          onClick={() => onTabChange("default")}
          className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "default"
              ? "bg-[#9cadc0] text-white shadow-sm"
              : "text-[#1c2b39] dark:text-[#c0d4ed]/80 hover:bg-[#e6effa] dark:hover:bg-[#202c3b]"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          <span>{getTranslation(language, "defaultModeTab")}</span>
        </button>

        <button
          onClick={() => onTabChange("custom")}
          className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "custom"
              ? "bg-[#9cadc0] text-white shadow-sm"
              : "text-[#1c2b39] dark:text-[#c0d4ed]/80 hover:bg-[#e6effa] dark:hover:bg-[#202c3b]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>
            {getTranslation(language, "customModeTab")}
            {customScenariosCount > 0 && ` (${customScenariosCount})`}
          </span>
        </button>
      </div>
    </div>
  );
};
