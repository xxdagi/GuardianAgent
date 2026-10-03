import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { ConversationScenario, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface CustomConversationSectionProps {
  language: Language;
  theme: Theme;
  customScenarios: ConversationScenario[];
  selectedScenario: ConversationScenario;
  onSelectScenario: (scenario: ConversationScenario) => void;
  onNavigateToAddConversation: () => void;
}

export const CustomConversationSection: React.FC<CustomConversationSectionProps> = ({
  language,
  theme,
  customScenarios,
  selectedScenario,
  onSelectScenario,
  onNavigateToAddConversation,
}) => {
  const isDark = theme === "dark";
  const [expandedCustomId, setExpandedCustomId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCustomId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Action Button: Navigate to Dedicated Add Conversation Page */}
      <button
        onClick={onNavigateToAddConversation}
        className="w-full py-3.5 px-4 bg-[#9cadc0] hover:bg-[#788a9e] active:translate-y-0.5 text-white font-black text-xs rounded-2xl shadow-[0_3px_0_0_#788a9e] flex items-center justify-center space-x-2 transition-all uppercase tracking-wider"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{getTranslation(language, "addNewScenarioBtn")}</span>
      </button>

      {customScenarios.length === 0 ? (
        <div
          className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
            isDark ? "bg-[#18222e]/60 border-[#9cadc0]/40" : "bg-[#f0f5fc]/60 border-[#9cadc0]/40"
          }`}
        >
          <Sparkles className="w-8 h-8 text-[#9cadc0] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#9cadc0] dark:text-[#c0d4ed]">
            {getTranslation(language, "noCustomScenarios")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {customScenarios.map((scenario) => {
            const isSelected = scenario.id === selectedScenario.id;
            const isExpanded = expandedCustomId === scenario.id;

            return (
              <div
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#f0f5fc] dark:bg-[#18222e] border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                    : isDark
                    ? "bg-[#0f1720] border-[#9cadc0]/30 hover:border-[#9cadc0]/60"
                    : "bg-white border-[#9cadc0]/30 hover:border-[#9cadc0]/60 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 pr-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 border-2 ${
                        isSelected
                          ? "bg-[#9cadc0] text-white border-[#9cadc0]"
                          : "bg-[#c0d4ed]/50 text-[#1c2b39] dark:text-[#c0d4ed] border-[#9cadc0]/40"
                      }`}
                    >
                      {scenario.avatarText}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
                        {scenario.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5 text-[11px]">
                        <span className="text-[#9cadc0] dark:text-[#c0d4ed] font-bold">{scenario.role}</span>
                        <span className="text-[#9cadc0]/40">•</span>
                        <span className="text-[10px] text-[#1c2b39]/80 dark:text-[#c0d4ed]/80 font-medium">
                          {getTranslation(language, "displayAs")}: <strong>{scenario.callerName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                    {isSelected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#9cadc0] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {getTranslation(language, "activeBadge")}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => toggleExpand(scenario.id, e)}
                      className="p-1 rounded-lg border-2 border-[#9cadc0]/30 text-[#9cadc0] hover:border-[#9cadc0] transition-colors"
                      title={isExpanded ? getTranslation(language, "hideDetails") : getTranslation(language, "showDetails")}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Custom Scenario Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-2 pt-2 border-t border-[#9cadc0]/25 text-[11px]"
                    >
                      <span className="font-bold text-[#9cadc0] block mb-0.5">
                        {getTranslation(language, "topicsLabel")}:
                      </span>
                      <p className="leading-relaxed text-[#1c2b39]/80 dark:text-[#c0d4ed]/80">{scenario.topics}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
