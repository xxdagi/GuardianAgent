import React, { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import type { ConversationScenario, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface AddConversationFormProps {
  language: Language;
  theme: Theme;
  onAddCustomScenario: (scenario: ConversationScenario) => void;
  onSelectScenario: (scenario: ConversationScenario) => void;
  onBackToHome: () => void;
}

export const AddConversationForm: React.FC<AddConversationFormProps> = ({
  language,
  theme,
  onAddCustomScenario,
  onSelectScenario,
  onBackToHome,
}) => {
  const [customTitle, setCustomTitle] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [customCallerName, setCustomCallerName] = useState("");
  const [customTopics, setCustomTopics] = useState("");
  const [successSaved, setSuccessSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customRole.trim()) return;

    const callerDisplayName = customCallerName.trim() || customRole.trim();

    const newScenario: ConversationScenario = {
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      role: customRole.trim(),
      callerName: callerDisplayName,
      topics: customTopics.trim() || getTranslation(language, "defaultCustomTopics"),
      isCustom: true,
      avatarText: callerDisplayName.charAt(0).toUpperCase(),
      initialGreeting: getTranslation(language, "defaultGreetingTemplate", { name: callerDisplayName }),
      deterrentResponse: getTranslation(language, "defaultDeterrentResponse"),
    };

    onAddCustomScenario(newScenario);
    onSelectScenario(newScenario);

    setSuccessSaved(true);
    setTimeout(() => {
      onBackToHome();
    }, 700);
  };

  return (
    <div className="card-tactile p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs font-black text-[#9cadc0] dark:text-[#c0d4ed]">
          <Sparkles className="w-4 h-4" />
          <span>{getTranslation(language, "createConversationPageTitle")}</span>
        </div>
        {successSaved && (
          <span className="text-xs text-[#9cadc0] dark:text-[#c0d4ed] font-black flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> {getTranslation(language, "savedNotification")}
          </span>
        )}
      </div>
      <p className="text-[11px] mb-4 font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/70">
        {getTranslation(language, "createConversationPageSub")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold block mb-1.5 text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "scenarioNameLabel")} *
          </label>
          <input
            type="text"
            required
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={getTranslation(language, "scenarioNamePlaceholder")}
            className="input-tactile"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1.5 text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "scenarioRoleLabel")} *
          </label>
          <input
            type="text"
            required
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder={getTranslation(language, "scenarioRolePlaceholder")}
            className="input-tactile"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1.5 text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "callerNameLabel")}
          </label>
          <input
            type="text"
            value={customCallerName}
            onChange={(e) => setCustomCallerName(e.target.value)}
            placeholder={getTranslation(language, "callerNamePlaceholder")}
            className="input-tactile"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1.5 text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "scenarioTopicsLabel")}
          </label>
          <textarea
            rows={3}
            value={customTopics}
            onChange={(e) => setCustomTopics(e.target.value)}
            placeholder={getTranslation(language, "scenarioTopicsPlaceholder")}
            className="input-tactile"
          />
        </div>

        <button
          type="submit"
          className="btn-tactile-primary mt-2"
        >
          {getTranslation(language, "saveScenarioBtn")}
        </button>
      </form>
    </div>
  );
};
