import React from "react";
import { ChevronRight } from "lucide-react";
import type { ConversationScenario, Language, Theme } from "../types";
import { getTranslation } from "../i18n";
import type { GeoCoordinates } from "../services/geolocation";
import { HomeHeader } from "./home/HomeHeader";
import { CallTriggerHero } from "./home/CallTriggerHero";

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
      <div
        onClick={onNavigateToConversations}
        className="card-tactile cursor-pointer p-4 mt-auto shrink-0 mb-1 active:scale-98 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-2">
            <div className="w-12 h-12 rounded-2xl bg-[#c0d4ed] text-[#1c2b39] border-2 border-[#9cadc0] font-black text-base shrink-0 shadow-inner flex items-center justify-center">
              {selectedScenario.avatarText || "📞"}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider block text-[#9cadc0] dark:text-[#c0d4ed]">
                {getTranslation(language, "activeConversationTitle")}
              </span>
              <div className="flex items-center space-x-1.5 truncate">
                <span className="text-base font-black truncate text-[#1c2b39] dark:text-[#c0d4ed]">
                  {selectedScenario.callerName}
                </span>
                {selectedScenario.role && selectedScenario.role !== selectedScenario.callerName && (
                  <span className="text-xs font-semibold shrink-0 text-[#9cadc0] dark:text-[#c0d4ed]/70">
                    ({selectedScenario.role})
                  </span>
                )}
              </div>
              <p className="text-xs truncate mt-0.5 font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/75">
                {selectedScenario.title || selectedScenario.topics}
              </p>
            </div>
          </div>

          <div className="btn-mini-tactile px-3 py-1.5 text-xs text-[#1c2b39] dark:text-[#c0d4ed] shrink-0 space-x-1">
            <span>{language === "pl" ? "Zmień" : "Change"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
