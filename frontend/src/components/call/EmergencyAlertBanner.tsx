import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, MapPin } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface EmergencyAlertBannerProps {
  language: Language;
  emergencyTriggered: boolean;
  alertDetails: { keyword: string; recipient: string; lat: number; lng: number } | null;
  showDebugTranscript: boolean;
  transcript: string;
  onSimulateKeyword: (keyword: string) => void;
  keywords?: string[];
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  language,
  emergencyTriggered,
  alertDetails,
  showDebugTranscript,
  transcript,
  onSimulateKeyword,
  keywords,
}) => {
  return (
    <>
      {/* Emergency Trigger Confirmation Banner */}
      <AnimatePresence>
        {emergencyTriggered && alertDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 w-full bg-rose-950/80 border border-rose-500/40 rounded-xl p-3 text-left shadow-lg backdrop-blur-md"
          >
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-rose-200">
                  {getTranslation(language, "alertSentBanner")}
                </p>
                <p className="text-rose-300/80 mt-0.5">
                  {getTranslation(language, "detectedKeyword")}{" "}
                  <span className="font-bold underline text-white">"{alertDetails.keyword}"</span>
                </p>
                <p className="text-[11px] text-neutral-300 mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-rose-400" />
                  {getTranslation(language, "smsSentTo")} {alertDetails.recipient}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Transcript Debug / Demo View */}
      <AnimatePresence>
        {showDebugTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 w-full bg-neutral-900/90 border border-neutral-700 rounded-lg p-2.5 text-left text-xs text-neutral-300 max-h-28 overflow-y-auto"
          >
            <div className="flex justify-between items-center text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              <span>{getTranslation(language, "transcriptTitle")}</span>
              <span className="text-emerald-400">{getTranslation(language, "transcriptListening")}</span>
            </div>
            <p className="italic text-neutral-200">
              {transcript || getTranslation(language, "transcriptPlaceholder")}
            </p>
            {/* Quick Trigger helper buttons for live demo presentation */}
            {keywords && keywords.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-400">{getTranslation(language, "quickTestWord")}</span>
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => onSimulateKeyword(kw)}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-[10px] rounded text-emerald-300 border border-neutral-700"
                  >
                    "{kw}"
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
