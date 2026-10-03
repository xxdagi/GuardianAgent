import React, { useEffect } from "react";
import type { ConversationScenario, Language } from "../types";
import { IncomingCallerProfile } from "./incoming/IncomingCallerProfile";
import { IncomingCallActions } from "./incoming/IncomingCallActions";

interface IncomingCallScreenProps {
  scenario: ConversationScenario;
  language: Language;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  scenario,
  language,
  onAccept,
  onDecline,
}) => {
  // Trigger phone vibration if available
  useEffect(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([500, 300, 500, 300, 800]);
      } catch {
        // Ignore vibration errors
      }
    }
  }, []);

  return (
    <div className="relative flex flex-col justify-between h-[100dvh] w-full max-w-md mx-auto bg-gradient-to-b from-neutral-900 via-black to-black text-white px-6 py-12 select-none overflow-hidden font-sans">
      <IncomingCallerProfile
        scenario={scenario}
        language={language}
      />

      <IncomingCallActions
        language={language}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    </div>
  );
};
