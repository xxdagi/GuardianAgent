import React from "react";
import { User } from "lucide-react";
import type { DefaultCallerOption, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface DefaultCallersGridProps {
  language: Language;
  theme: Theme;
  defaultCallers: DefaultCallerOption[];
  selectedCaller: DefaultCallerOption;
  isScenarioCustom: boolean;
  onSelectCaller: (caller: DefaultCallerOption) => void;
}

export const DefaultCallersGrid: React.FC<DefaultCallersGridProps> = ({
  language,
  theme,
  defaultCallers,
  selectedCaller,
  isScenarioCustom,
  onSelectCaller,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="card-tactile">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
          <User className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
          <span>{getTranslation(language, "chooseCaller")}</span>
        </div>
        <span className="text-[11px] font-black text-[#9cadc0] dark:text-[#c0d4ed]">
          {selectedCaller.callerName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {defaultCallers.map((caller) => {
          const isSelected = caller.id === selectedCaller.id && !isScenarioCustom;
          return (
            <button
              key={caller.id}
              onClick={() => onSelectCaller(caller)}
              className={`p-2.5 rounded-xl border-2 text-left flex items-center space-x-2.5 transition-all ${
                isSelected
                  ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                  : isDark
                  ? "bg-[#0f1720] border-[#9cadc0]/40 text-[#c0d4ed] hover:border-[#9cadc0]"
                  : "bg-white border-[#9cadc0]/40 text-[#1c2b39] hover:border-[#9cadc0]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 border-2 transition-colors ${
                  isSelected
                    ? "bg-white text-[#9cadc0] border-white"
                    : "bg-[#c0d4ed]/50 text-[#1c2b39] dark:text-[#c0d4ed] border-[#9cadc0]/40"
                }`}
              >
                {caller.avatarText}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-black truncate">{caller.role}</div>
                <div
                  className={`text-[10px] truncate font-semibold ${
                    isSelected ? "text-white/90" : "text-[#9cadc0] dark:text-[#c0d4ed]/80"
                  }`}
                >
                  {caller.callerName}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
