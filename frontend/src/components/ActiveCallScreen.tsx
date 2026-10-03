import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneOff, ShieldAlert } from "lucide-react";
import type { ConversationScenario, Language } from "../types";
import { ActiveCallStatusBar } from "./call/ActiveCallStatusBar";
import { ActiveCallHeader } from "./call/ActiveCallHeader";
import { CallControlsGrid } from "./call/CallControlsGrid";

interface ActiveCallScreenProps {
  scenario: ConversationScenario;
  language: Language;
  onEndCall: () => void;
  isListening: boolean;
  transcript: string;
  emergencyTriggered: boolean;
  alertDetails: { keyword: string; recipient: string; lat: number; lng: number } | null;
  onSimulateKeyword: (keyword: string) => void;
  keywords?: string[];
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  scenario,
  language,
  onEndCall,
  isListening,
  transcript,
  emergencyTriggered,
  alertDetails,
  onSimulateKeyword,
  keywords,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showDebugTranscript, setShowDebugTranscript] = useState(false);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col justify-between h-[100dvh] w-full max-w-md mx-auto bg-black text-white px-6 py-10 select-none overflow-hidden font-sans">
      <ActiveCallStatusBar
        language={language}
        isListening={isListening}
        showDebugTranscript={showDebugTranscript}
        onToggleDebugTranscript={() => setShowDebugTranscript((prev) => !prev)}
        emergencyTriggered={emergencyTriggered}
      />

      <ActiveCallHeader
        scenario={scenario}
        language={language}
        isListening={isListening}
        seconds={seconds}
        emergencyTriggered={emergencyTriggered}
        alertDetails={alertDetails}
        showDebugTranscript={showDebugTranscript}
        transcript={transcript}
        onSimulateKeyword={onSimulateKeyword}
        keywords={keywords}
      />

      <CallControlsGrid
        language={language}
        isMuted={isMuted}
        isSpeaker={isSpeaker}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleSpeaker={() => setIsSpeaker((prev) => !prev)}
      />

      {/* 4. Action Buttons: Red End Call & Red SOS Trigger */}
      <div className="flex items-center justify-center space-x-10 pb-4">
        {/* Red End Call Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-600 active:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transition-colors"
            aria-label="Zakończ połączenie"
          >
            <PhoneOff className="w-7 h-7 fill-current" />
          </motion.button>
          <span className="text-[11px] text-neutral-400 mt-1.5 font-medium">
            {language === "pl" ? "Rozłącz" : "End Call"}
          </span>
        </div>

        {/* Dedicated Red SOS Button (Sends Silent SMS with GPS) */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onSimulateKeyword(keywords?.[0] || "czerwony")}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              emergencyTriggered
                ? "bg-rose-950/80 border-2 border-rose-500 text-rose-300 shadow-rose-950/80"
                : "bg-red-600 active:bg-red-700 text-white shadow-red-950/60 ring-4 ring-red-500/30 animate-pulse"
            }`}
            aria-label="Wyślij natychmiast cichy SMS SOS"
          >
            <ShieldAlert className="w-8 h-8" />
          </motion.button>
          <span className="text-[11px] text-rose-400 font-bold mt-1.5">
            {emergencyTriggered
              ? language === "pl"
                ? "SMS WYSŁANY"
                : "SMS SENT"
              : language === "pl"
              ? "SOS (SMS)"
              : "SOS (SMS)"}
          </span>
        </div>
      </div>
    </div>
  );
};
