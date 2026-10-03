import React from "react";
import { ChevronRight } from "lucide-react";
import type { ConversationScenario, Language } from "../../types";
import { getTranslation } from "../../i18n";

interface ActiveConversationCardProps {
  language: Language;
  selectedScenario: ConversationScenario;
  onNavigateToConversations: () => void;
}

export const ActiveConversationCard: React.FC<ActiveConversationCardProps> = ({
  language,
  selectedScenario,
  onNavigateToConversations,
}) => {
  return (
    <div
      onClick={onNavigateToConversations}
      className="card-tactile cursor-pointer p-4 mt-auto shrink-0 mb-1 active:scale-98 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-2">
          <div className="w-12 h-12 rounded-2xl bg-[#c0d4ed] text-[#1c2b39] border-2 border-[#9cadc0] font-black text-base shrink-0 shadow-inner flex items-center justify-center">
            {selectedScenario.avatarText || "📞"}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider block text-[#9cadc0] dark:text-[#c0d4ed]">
              {getTranslation(language, "activeConversationTitle")}
            </span>
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-base font-black truncate text-[#1c2b39] dark:text-[#c0d4ed]">
                {selectedScenario.callerName}
              </span>
              {selectedScenario.role && selectedScenario.role !== selectedScenario.callerName && (
                <span className="text-xs font-semibold shrink-0 text-[#9cadc0] dark:text-[#c0d4ed]/70">
                  ({selectedScenario.role})
                </span>
              )}
            </div>
            <p className="text-xs truncate mt-0.5 font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/75">
              {selectedScenario.title || selectedScenario.topics}
            </p>
          </div>
        </div>

        <div className="btn-mini-tactile px-3 py-1.5 text-xs text-[#1c2b39] dark:text-[#c0d4ed] shrink-0 space-x-1">
          <span>{getTranslation(language, "changeBtn")}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
