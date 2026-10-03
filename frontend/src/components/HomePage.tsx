import React from "react";
import type { ConversationScenario, Language, Theme } from "../types";
import type { GeoCoordinates } from "../services/geolocation";
import { HomeHeader } from "./home/HomeHeader";
import { CallTriggerHero } from "./home/CallTriggerHero";
import { ActiveConversationCard } from "./home/ActiveConversationCard";

interface HomePageProps {
  language: Language;
  theme: Theme;
  onOpenSettings: () => void;
  onNavigateToConversations: () => void;
  selectedScenario: ConversationScenario;
  onStartCallNow: () => void;
  onScheduleCall: () => void;
  onCancelSchedule: () => void;
  scheduledSeconds: number | null;
  callDelaySeconds: number;
  coords: GeoCoordinates | null;
  contactName?: string;
  onOpenSmsViewer?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  language,
  theme,
  onOpenSettings,
  onNavigateToConversations,
  selectedScenario,
  onStartCallNow,
  onScheduleCall,
  onCancelSchedule,
  scheduledSeconds,
  callDelaySeconds,
  coords,
  contactName = "Zaufany kontakt",
  onOpenSmsViewer,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`h-full min-h-[100dvh] sm:min-h-full flex-1 w-full max-w-md mx-auto p-5 font-sans flex flex-col justify-between transition-colors duration-200 select-none ${
        isDark ? "bg-[#0f1720] text-[#c0d4ed]" : "bg-[#f5f9fd] text-[#1c2b39]"
      }`}
    >
      {/* 1. Header (Brand, GPS, Settings gear button) */}
      <HomeHeader
        language={language}
        theme={theme}
        coords={coords}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Emergency Action Triggers - Vertically centered with slight gap */}
      <div className="flex-1 flex flex-col justify-center my-auto py-4">
        <CallTriggerHero
          language={language}
          theme={theme}
          callDelaySeconds={callDelaySeconds}
          scheduledSeconds={scheduledSeconds}
          onStartCallNow={onStartCallNow}
          onScheduleCall={onScheduleCall}
          onCancelSchedule={onCancelSchedule}
        />
      </div>

      {/* 3. Active Conversation Profile Card - Pinned to the bottom with matching tactile style */}
      <ActiveConversationCard
        language={language}
        selectedScenario={selectedScenario}
        onNavigateToConversations={onNavigateToConversations}
      />

      {/* Quick link to Mock SMS (Recipient Phone View) */}
      {onOpenSmsViewer && (
        <div className="mt-3 text-center">
          <button
            onClick={onOpenSmsViewer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#9cadc0]/40 text-[11px] font-bold text-[#1c2b39]/80 dark:text-[#c0d4ed]/80 hover:border-[#9cadc0] hover:bg-[#e6effa]/50 dark:hover:bg-[#18222e] transition-all"
          >
            <span>📱</span>
            <span>{language === "pl" ? "Podgląd SMS odbiorcy (Telefon Mamy)" : "Recipient's SMS Preview (Mom's Phone)"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
