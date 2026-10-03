import React from "react";
import type { Language, Theme, EmergencyContact } from "../types";
import { SettingsHeader } from "./settings/SettingsHeader";
import { LanguageThemeSection } from "./settings/LanguageThemeSection";
import { CallDelaySection } from "./settings/CallDelaySection";
import { KeywordsSection } from "./settings/KeywordsSection";
import { EmergencyContactSection } from "./settings/EmergencyContactSection";
import { DemoSosSection } from "./settings/DemoSosSection";

interface SettingsScreenProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: Theme;
  onSelectTheme: (theme: Theme) => void;
  onBackToHome: () => void;
  keywords: string[];
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
  callDelaySeconds: number;
  onChangeCallDelay: (sec: number) => void;
  contact: EmergencyContact;
  onUpdateContact: (c: EmergencyContact) => void;
  onTestEmergencyTrigger: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onSelectLanguage,
  theme,
  onSelectTheme,
  onBackToHome,
  keywords,
  onAddKeyword,
  onRemoveKeyword,
  callDelaySeconds,
  onChangeCallDelay,
  contact,
  onUpdateContact,
  onTestEmergencyTrigger,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <SettingsHeader
        language={language}
        theme={theme}
        onBackToHome={onBackToHome}
      />

      <LanguageThemeSection
        language={language}
        onSelectLanguage={onSelectLanguage}
        theme={theme}
        onSelectTheme={onSelectTheme}
      />

      <CallDelaySection
        language={language}
        theme={theme}
        callDelaySeconds={callDelaySeconds}
        onChangeCallDelay={onChangeCallDelay}
      />

      <KeywordsSection
        language={language}
        theme={theme}
        keywords={keywords}
        onAddKeyword={onAddKeyword}
        onRemoveKeyword={onRemoveKeyword}
      />

      <EmergencyContactSection
        language={language}
        theme={theme}
        contact={contact}
        onUpdateContact={onUpdateContact}
      />

      <DemoSosSection
        language={language}
        theme={theme}
        onTestEmergencyTrigger={onTestEmergencyTrigger}
      />
    </div>
  );
};
