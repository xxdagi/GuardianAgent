import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, MessageSquare, Clock } from "lucide-react";
import type { ConversationScenario, Language } from "../types";
import { translations } from "../i18n";

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
  const t = translations[language];

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
      {/* Top Header */}
      <div className="flex flex-col items-center mt-8 text-center">
        <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
          {t.incomingCall}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white mt-2">
          {scenario.callerName || scenario.role}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{t.mobileSubtitle}</p>

        {/* Animated avatar pulse */}
        <div className="relative mt-12">
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-md"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut", delay: 0.3 }}
            className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-sm"
          />

          <div className="w-28 h-28 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 border-2 border-neutral-600/60 flex items-center justify-center text-4xl font-semibold shadow-2xl text-neutral-200">
            {scenario.avatarText}
          </div>
        </div>
      </div>

      {/* Quick response helpers */}
      <div className="flex justify-around items-center px-6 text-neutral-400 text-xs">
        <div className="flex flex-col items-center space-y-1">
          <Clock className="w-6 h-6 stroke-[1.5]" />
          <span>{language === "pl" ? "Przypomnij" : "Remind"}</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <MessageSquare className="w-6 h-6 stroke-[1.5]" />
          <span>{language === "pl" ? "Wiadomość" : "Message"}</span>
        </div>
      </div>

      {/* Accept / Decline Action Buttons */}
      <div className="flex items-center justify-around px-4 pb-8">
        {/* Decline Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onDecline}
            className="w-18 h-18 p-5 rounded-full bg-red-600 active:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-950/60"
            aria-label={t.decline}
          >
            <PhoneOff className="w-8 h-8 fill-current" />
          </motion.button>
          <span className="text-xs text-neutral-300 mt-3 font-medium">{t.decline}</span>
        </div>

        {/* Accept Button with bounce animation */}
        <div className="flex flex-col items-center">
          <motion.button
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            whileTap={{ scale: 0.9 }}
            onClick={onAccept}
            className="w-18 h-18 p-5 rounded-full bg-emerald-500 active:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60"
            aria-label={t.answer}
          >
            <Phone className="w-8 h-8 fill-current" />
          </motion.button>
          <span className="text-xs text-neutral-300 mt-3 font-medium">{t.answer}</span>
        </div>
      </div>
    </div>
  );
};
