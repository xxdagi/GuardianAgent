import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface ActiveCallStatusBarProps {
  language: Language;
  isListening: boolean;
  showDebugTranscript: boolean;
  onToggleDebugTranscript: () => void;
  emergencyTriggered: boolean;
}

export const ActiveCallStatusBar: React.FC<ActiveCallStatusBarProps> = ({
  language,
  isListening,
  showDebugTranscript,
  onToggleDebugTranscript,
  emergencyTriggered,
}) => {
  return (
    <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 px-2">
      <div className="flex items-center space-x-2">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isListening ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
          }`}
          title={getTranslation(language, "speechDetectorActive")}
        />
        <span className="text-[11px] tracking-wide text-neutral-400">
          {getTranslation(language, "statusLte")}
        </span>
      </div>

      {/* Secret tap area to toggle transcript for demo presentation */}
      <button
        onClick={onToggleDebugTranscript}
        className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest px-2 py-1 rounded"
      >
        {showDebugTranscript
          ? getTranslation(language, "hideTranscript")
          : getTranslation(language, "guardian")}
      </button>

      <div className="flex items-center space-x-1">
        {emergencyTriggered ? (
          <span className="flex items-center text-rose-500 text-[11px] font-medium animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> {getTranslation(language, "statusSos")}
          </span>
        ) : (
          <span className="flex items-center text-neutral-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500/70" />{" "}
            {getTranslation(language, "statusSafe")}
          </span>
        )}
      </div>
    </div>
  );
};
