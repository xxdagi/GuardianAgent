import React from "react";
import type { ConversationScenario, Language, Theme } from "../types";
import { AddConversationHeader } from "./conversation/AddConversationHeader";
import { AddConversationForm } from "./conversation/AddConversationForm";
import { CustomScenariosList } from "./conversation/CustomScenariosList";

interface AddConversationPageProps {
  language: Language;
  theme: Theme;
  onBackToHome: () => void;
  customScenarios: ConversationScenario[];
  onAddCustomScenario: (scenario: ConversationScenario) => void;
  onDeleteCustomScenario: (id: string) => void;
  onSelectScenario: (scenario: ConversationScenario) => void;
}

export const AddConversationPage: React.FC<AddConversationPageProps> = ({
  language,
  theme,
  onBackToHome,
  customScenarios,
  onAddCustomScenario,
  onDeleteCustomScenario,
  onSelectScenario,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-[100dvh] w-full max-w-md mx-auto p-5 font-sans pb-24 transition-colors duration-200 ${
        isDark ? "bg-[#0f1720] text-[#c0d4ed]" : "bg-[#f5f9fd] text-[#1c2b39]"
      }`}
    >
      <AddConversationHeader
        language={language}
        theme={theme}
        onBackToHome={onBackToHome}
      />

      <AddConversationForm
        language={language}
        theme={theme}
        onAddCustomScenario={onAddCustomScenario}
        onSelectScenario={onSelectScenario}
        onBackToHome={onBackToHome}
      />

      <CustomScenariosList
        language={language}
        theme={theme}
        customScenarios={customScenarios}
        onDeleteCustomScenario={onDeleteCustomScenario}
      />
    </div>
  );
};
