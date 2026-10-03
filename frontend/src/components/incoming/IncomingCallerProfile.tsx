import React from "react";
import { motion } from "framer-motion";
import type { ConversationScenario, Language } from "../../types";
import { getTranslation } from "../../i18n";

interface IncomingCallerProfileProps {
  scenario: ConversationScenario;
  language: Language;
}

export const IncomingCallerProfile: React.FC<IncomingCallerProfileProps> = ({
  scenario,
  language,
}) => {
  return (
    <div className="flex flex-col items-center mt-8 text-center">
      <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
        {getTranslation(language, "incomingCall")}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-white mt-2">
        {scenario.callerName || scenario.role}
      </h1>
      <p className="text-sm text-neutral-400 mt-1">
        {getTranslation(language, "mobileSubtitle")}
      </p>

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
  );
};
