import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MessageCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { DefaultCallerOption, DefaultTopicOption, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface DefaultConversationSectionProps {
  language: Language;
  theme: Theme;
  defaultCallers: DefaultCallerOption[];
  defaultTopics: DefaultTopicOption[];
  selectedCaller: DefaultCallerOption;
  selectedTopic: DefaultTopicOption;
  isScenarioCustom: boolean;
  onSelectCaller: (caller: DefaultCallerOption) => void;
  onSelectTopic: (topic: DefaultTopicOption) => void;
}

export const DefaultConversationSection: React.FC<DefaultConversationSectionProps> = ({
  language,
  theme,
  defaultCallers,
  defaultTopics,
  selectedCaller,
  selectedTopic,
  isScenarioCustom,
  onSelectCaller,
  onSelectTopic,
}) => {
  const isDark = theme === "dark";
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTopicId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5 mb-6">
      {/* 1. Caller Selector */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
          isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
        }`}
      >
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

      {/* 2. Topic Selector */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
          isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
            <MessageCircle className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
            <span>{getTranslation(language, "chooseTopic")}</span>
          </div>
          <span className="text-[11px] font-black truncate max-w-[150px] text-[#9cadc0] dark:text-[#c0d4ed]">
            {selectedTopic.title}
          </span>
        </div>

        <div className="space-y-2.5">
          {defaultTopics.map((topic) => {
            const isSelected = topic.id === selectedTopic.id && !isScenarioCustom;
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#f0f5fc] dark:bg-[#0f1720] border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
                    : isDark
                    ? "bg-[#0f1720] border-[#9cadc0]/30 hover:border-[#9cadc0]/60 text-[#c0d4ed]"
                    : "bg-white border-[#9cadc0]/30 hover:border-[#9cadc0]/60 text-[#1c2b39]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
                    {topic.title}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {isSelected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#9cadc0] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {getTranslation(language, "activeBadge")}
                      </span>
                    )}
                    <button
                      onClick={(e) => toggleExpand(topic.id, e)}
                      className="p-1 text-[#9cadc0] hover:opacity-80 rounded-md transition-opacity"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#1c2b39]/75 dark:text-[#c0d4ed]/75 mt-1 font-medium">
                  {topic.topics}
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-2.5 border-t border-[#9cadc0]/25 text-[11px] space-y-1.5"
                    >
                      <div>
                        <span className="font-bold text-[#9cadc0] dark:text-[#c0d4ed]">Powitanie: </span>
                        <span className="italic text-[#1c2b39]/85 dark:text-[#c0d4ed]/85">
                          "{language === "pl" ? topic.greetingPl : topic.greetingEn}"
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
