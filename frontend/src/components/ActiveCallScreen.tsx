import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneOff, ShieldCheck, ShieldAlert } from "lucide-react";
import type { ConversationScenario, Language } from "../types";
import { getTranslation } from "../i18n";
import { CallControlsGrid } from "./call/CallControlsGrid";
import { EmergencyAlertBanner } from "./call/EmergencyAlertBanner";

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

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col justify-between h-[100dvh] w-full max-w-md mx-auto bg-black text-white px-6 py-10 select-none overflow-hidden font-sans">
      {/* 1. Subtle Stealth Status Bar at the top */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 px-2">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isListening ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
            }`}
            title="Speech detector active"
          />
          <span className="text-[11px] tracking-wide text-neutral-400">
            {getTranslation(language, "statusLte")}
          </span>
        </div>

        {/* Secret tap area to toggle transcript for demo presentation */}
        <button
          onClick={() => setShowDebugTranscript((prev) => !prev)}
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

      {/* 2. Caller Details Header */}
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

        {/* Clean caller name without awkward labels */}
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {scenario.callerName || scenario.role}
        </h1>
        <p className="text-sm text-neutral-400 mt-1 font-medium">
          {getTranslation(language, "mobileSubtitle")}
        </p>
        <p className="text-sm font-mono text-neutral-300 mt-2 font-normal">
          {formatDuration(seconds)}
        </p>

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

      {/* 3. Grid of iOS-style In-Call Buttons */}
      <CallControlsGrid
        language={language}
        isMuted={isMuted}
        isSpeaker={isSpeaker}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleSpeaker={() => setIsSpeaker((prev) => !prev)}
      />

      {/* 4. Red Circular End Call Button */}
      <div className="flex justify-center pb-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onEndCall}
          className="w-18 h-18 p-5 rounded-full bg-red-600 active:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transition-colors"
          aria-label="Zakończ połączenie"
        >
          <PhoneOff className="w-8 h-8 fill-current" />
        </motion.button>
      </div>
    </div>
  );
};
