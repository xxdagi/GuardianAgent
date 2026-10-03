import React from "react";
import { motion } from "framer-motion";
import type { ConversationScenario, Language } from "../../types";
import { getTranslation } from "../../i18n";
import { EmergencyAlertBanner } from "./EmergencyAlertBanner";

interface ActiveCallHeaderProps {
  scenario: ConversationScenario;
  language: Language;
  isListening: boolean;
  seconds: number;
  emergencyTriggered: boolean;
  alertDetails: { keyword: string; recipient: string; lat: number; lng: number } | null;
  showDebugTranscript: boolean;
  transcript: string;
  onSimulateKeyword: (keyword: string) => void;
  keywords?: string[];
}

export const ActiveCallHeader: React.FC<ActiveCallHeaderProps> = ({
  scenario,
  language,
  isListening,
  seconds,
  emergencyTriggered,
  alertDetails,
  showDebugTranscript,
  transcript,
  onSimulateKeyword,
  keywords,
}) => {
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center mt-6 text-center">
      {/* Animated avatar pulse */}
      <div className="relative mb-5">
        <motion.div
          animate={{
            scale: isListening ? [1, 1.08, 1] : 1,
            opacity: isListening ? [0.6, 0.2, 0.6] : 0,
          }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="absolute -inset-3 rounded-full bg-emerald-500/30 blur-md"
        />

        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 border-2 border-neutral-600/50 flex items-center justify-center text-3xl font-semibold shadow-2xl text-neutral-200">
          {scenario.avatarText}
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {scenario.callerName || scenario.role}
      </h1>
      <p className="text-sm text-neutral-400 mt-1 font-medium">
        {getTranslation(language, "mobileSubtitle")}
      </p>
      <p className="text-sm font-mono text-neutral-300 mt-2 font-normal">
        {formatDuration(seconds)}
      </p>

      {/* Quick Keyword chip helper: user can either SPEAK it or TAP it */}
      {!emergencyTriggered && (
        <div className="mt-3 flex items-center justify-center flex-wrap gap-2">
          {(keywords && keywords.length > 0 ? keywords.slice(0, 2) : ["czerwony"]).map((kw) => (
            <button
              key={kw}
              onClick={() => onSimulateKeyword(kw)}
              className="px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 hover:border-rose-500/60 text-xs text-neutral-300 hover:text-rose-300 flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
              title="Kliknij lub powiedz to hasło, aby cicho wysłać SMS"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px]">
                {language === "pl" ? "Hasło:" : "Keyword:"}{" "}
                <span className="font-bold text-white underline decoration-rose-500/60">
                  "{kw}"
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Emergency Alert Confirmation & Live Transcript */}
      <EmergencyAlertBanner
        language={language}
        emergencyTriggered={emergencyTriggered}
        alertDetails={alertDetails}
        showDebugTranscript={showDebugTranscript}
        transcript={transcript}
        onSimulateKeyword={onSimulateKeyword}
        keywords={keywords}
      />
    </div>
  );
};
