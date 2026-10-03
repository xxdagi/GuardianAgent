import React, { useState } from "react";
import { ArrowLeft, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import type {
  ConversationScenario,
  Language,
  Theme,
  DefaultCallerOption,
  DefaultTopicOption,
} from "../types";
import { getTranslation } from "../i18n";
import { DefaultConversationSection } from "./home/DefaultConversationSection";
import { CustomConversationSection } from "./home/CustomConversationSection";

interface ConversationsPageProps {
  language: Language;
  theme: Theme;
  onBackToHome: () => void;
  onNavigateToAddConversation: () => void;
  defaultCallers: DefaultCallerOption[];
  defaultTopics: DefaultTopicOption[];
  selectedCaller: DefaultCallerOption;
  selectedTopic: DefaultTopicOption;
  onSelectDefaultCaller: (caller: DefaultCallerOption) => void;
  onSelectDefaultTopic: (topic: DefaultTopicOption) => void;
  customScenarios: ConversationScenario[];
  selectedScenario: ConversationScenario;
  onSelectCustomScenario: (scenario: ConversationScenario) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  language,
  theme,
  onBackToHome,
  onNavigateToAddConversation,
  defaultCallers,
  defaultTopics,
  selectedCaller,
  selectedTopic,
  onSelectDefaultCaller,
  onSelectDefaultTopic,
  customScenarios,
  selectedScenario,
  onSelectCustomScenario,
}) => {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"default" | "custom">(
    selectedScenario.isCustom ? "custom" : "default"
  );

  return (
    <div
      className={`min-h-full w-full max-w-md mx-auto p-5 font-sans pb-6 transition-colors duration-200 ${
        isDark ? "bg-[#0f1720] text-[#c0d4ed]" : "bg-[#f5f9fd] text-[#1c2b39]"
      }`}
    >
      {/* 1. Header with tactile back button */}
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

      {/* 2. Mode Switch Tabs (Default vs Custom) */}
      <div className="mb-5">
        <div className="grid grid-cols-2 p-1.5 rounded-2xl border-2 border-[#9cadc0]/50 bg-[#f0f5fc]/80 dark:bg-[#18222e] shadow-[0_2px_0_0_#c0d4ed]">
          <button
            onClick={() => setActiveTab("default")}
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
            onClick={() => setActiveTab("custom")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === "custom"
                ? "bg-[#9cadc0] text-white shadow-sm"
                : "text-[#1c2b39] dark:text-[#c0d4ed]/80 hover:bg-[#e6effa] dark:hover:bg-[#202c3b]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>
              {getTranslation(language, "customModeTab")}
              {customScenarios.length > 0 && ` (${customScenarios.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Default Conversation Mode Section */}
      {activeTab === "default" && (
        <DefaultConversationSection
          language={language}
          theme={theme}
          defaultCallers={defaultCallers}
          defaultTopics={defaultTopics}
          selectedCaller={selectedCaller}
          selectedTopic={selectedTopic}
          isScenarioCustom={selectedScenario.isCustom}
          onSelectCaller={onSelectDefaultCaller}
          onSelectTopic={onSelectDefaultTopic}
        />
      )}

      {/* 4. Custom Conversation Mode Section */}
      {activeTab === "custom" && (
        <CustomConversationSection
          language={language}
          theme={theme}
          customScenarios={customScenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={onSelectCustomScenario}
          onNavigateToAddConversation={onNavigateToAddConversation}
        />
      )}

      {/* 5. Confirmation Button (contained within phone frame) */}
      <div className="mt-8 mb-4">
        <button
          onClick={onBackToHome}
          className="w-full py-3.5 px-4 bg-[#9cadc0] hover:bg-[#788a9e] active:translate-y-0.5 text-white text-sm font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_3px_0_0_#788a9e]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{getTranslation(language, "confirmAndReturn")}</span>
        </button>
      </div>
    </div>
  );
};
