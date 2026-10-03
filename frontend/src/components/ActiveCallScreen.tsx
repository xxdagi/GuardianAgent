import React, { useEffect, useState } from "react";
import type { ConversationScenario, Language } from "../types";
import { ActiveCallStatusBar } from "./call/ActiveCallStatusBar";
import { ActiveCallHeader } from "./call/ActiveCallHeader";
import { CallControlsGrid } from "./call/CallControlsGrid";
import { EndCallButton } from "./call/EndCallButton";

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

      <EndCallButton
        language={language}
        onEndCall={onEndCall}
      />
    </div>
  );
};
