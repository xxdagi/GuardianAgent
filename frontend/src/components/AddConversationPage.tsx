import React, { useState } from "react";
import { ArrowLeft, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import type { ConversationScenario, Language, Theme } from "../types";
import { getTranslation } from "../i18n";

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
      topics: customTopics.trim() || (language === "pl" ? "dowolne tematy" : "general topics"),
      isCustom: true,
      avatarText: callerDisplayName.charAt(0).toUpperCase(),
      initialGreeting:
        language === "pl"
          ? `Cześć! Tu ${callerDisplayName}. Gdzie jesteś? Czekam na Ciebie.`
          : `Hey! It's ${callerDisplayName}. Where are you right now? I'm waiting for you.`,
      deterrentResponse:
        language === "pl"
          ? "Dobrze, to ja już zakładam buty i wychodzę przed klatkę, będę na dole za minutę!"
          : "Alright, I'm putting on my shoes and coming down to meet you outside right now!",
    };

    onAddCustomScenario(newScenario);
    onSelectScenario(newScenario);

    setSuccessSaved(true);
    setTimeout(() => {
      onBackToHome();
    }, 700);
  };

  return (
    <div
      className={`min-h-[100dvh] w-full max-w-md mx-auto p-5 font-sans pb-24 transition-colors duration-200 ${
        isDark ? "bg-[#0f1720] text-[#c0d4ed]" : "bg-[#f5f9fd] text-[#1c2b39]"
      }`}
    >
      {/* Top Header */}
      <div
        className={`border-b pb-4 mb-6 transition-colors ${
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
          {getTranslation(language, "createConversationPageTitle")}
        </h1>
        <p className="text-xs mt-1 font-medium text-[#9cadc0] dark:text-[#c0d4ed]/70">
          {getTranslation(language, "createConversationPageSub")}
        </p>
      </div>

      {/* Main Creation Card */}
      <div
        className={`border-2 rounded-2xl p-5 mb-6 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
          isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-black text-[#9cadc0] dark:text-[#c0d4ed]">
            <Sparkles className="w-4 h-4" />
            <span>{getTranslation(language, "createConversationPageTitle")}</span>
          </div>
          {successSaved && (
            <span className="text-xs text-[#9cadc0] dark:text-[#c0d4ed] font-black flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Zapisano!
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
              className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
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
              className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
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
              className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
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
              className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#9cadc0] hover:bg-[#788a9e] text-white font-black text-xs rounded-xl shadow-[0_3px_0_0_#788a9e] transition-all active:translate-y-0.5 mt-2 uppercase tracking-wider"
          >
            {getTranslation(language, "saveScenarioBtn")}
          </button>
        </form>
      </div>

      {/* Existing Custom Scenarios List */}
      {customScenarios.length > 0 && (
        <div
          className={`border-2 rounded-2xl p-4 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
            isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
          }`}
        >
          <h3 className="text-xs font-black uppercase tracking-wider mb-3 text-[#1c2b39] dark:text-[#c0d4ed]">
            Twoje zapisane rozmowy ({customScenarios.length})
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
                  aria-label="Usuń rozmowę"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
