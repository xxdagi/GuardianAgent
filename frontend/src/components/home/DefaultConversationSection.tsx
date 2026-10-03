import React from "react";
import type { DefaultCallerOption, DefaultTopicOption, Language, Theme } from "../../types";
import { DefaultCallersGrid } from "../conversation/DefaultCallersGrid";
import { DefaultTopicsList } from "../conversation/DefaultTopicsList";

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
  return (
    <div className="space-y-5 mb-6">
      <DefaultCallersGrid
        language={language}
        theme={theme}
        defaultCallers={defaultCallers}
        selectedCaller={selectedCaller}
        isScenarioCustom={isScenarioCustom}
        onSelectCaller={onSelectCaller}
      />

      <DefaultTopicsList
        language={language}
        theme={theme}
        defaultTopics={defaultTopics}
        selectedTopic={selectedTopic}
        isScenarioCustom={isScenarioCustom}
        onSelectTopic={onSelectTopic}
      />
    </div>
  );
};
