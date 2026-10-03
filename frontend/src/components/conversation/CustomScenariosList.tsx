import React from "react";
import { Trash2 } from "lucide-react";
import type { ConversationScenario, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface CustomScenariosListProps {
  language: Language;
  theme: Theme;
  customScenarios: ConversationScenario[];
  onDeleteCustomScenario: (id: string) => void;
}

export const CustomScenariosList: React.FC<CustomScenariosListProps> = ({
  language,
  theme,
  customScenarios,
  onDeleteCustomScenario,
}) => {
  const isDark = theme === "dark";

  if (customScenarios.length === 0) {
    return null;
  }

  return (
    <div className="card-tactile">
      <h3 className="text-xs font-black uppercase tracking-wider mb-3 text-[#1c2b39] dark:text-[#c0d4ed]">
        {getTranslation(language, "savedConversationsTitle", { count: customScenarios.length })}
      </h3>

      <div className="space-y-2">
        {customScenarios.map((cs) => (
          <div
            key={cs.id}
            className={`flex items-center justify-between p-3 rounded-xl border-2 text-xs transition-all ${
              isDark ? "bg-[#0f1720] border-[#9cadc0]/40" : "bg-white border-[#9cadc0]/40 shadow-sm"
            }`}
          >
            <div>
              <span className="font-bold text-[#1c2b39] dark:text-[#c0d4ed]">{cs.title}</span>
              <span className="text-[#9cadc0] dark:text-[#c0d4ed] font-semibold ml-2">
                ({cs.role} • {cs.callerName})
              </span>
              <p className="text-[10px] mt-0.5 line-clamp-1 font-medium text-[#1c2b39]/70 dark:text-[#c0d4ed]/70">
                {cs.topics}
              </p>
            </div>
            <button
              onClick={() => onDeleteCustomScenario(cs.id)}
              className="p-1.5 text-[#1c2b39]/50 dark:text-[#c0d4ed]/50 hover:text-red-500 transition-colors rounded-lg"
              aria-label={getTranslation(language, "deleteConversationAria")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
