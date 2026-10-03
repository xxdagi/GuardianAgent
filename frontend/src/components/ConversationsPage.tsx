import React, { useState } from "react";
import type {
  ConversationScenario,
  Language,
  Theme,
  DefaultCallerOption,
  DefaultTopicOption,
} from "../types";
import { ConversationsHeader } from "./conversation/ConversationsHeader";
import { ConversationModeTabs } from "./conversation/ConversationModeTabs";
import { ConversationFooter } from "./conversation/ConversationFooter";
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
      <ConversationsHeader
        language={language}
        theme={theme}
        onBackToHome={onBackToHome}
      />

      <ConversationModeTabs
        language={language}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        customScenariosCount={customScenarios.length}
      />

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

      <ConversationFooter
        language={language}
        onConfirm={onBackToHome}
      />
    </div>
  );
};
