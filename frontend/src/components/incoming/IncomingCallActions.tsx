import React from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff, MessageSquare, Clock } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface IncomingCallActionsProps {
  language: Language;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallActions: React.FC<IncomingCallActionsProps> = ({
  language,
  onAccept,
  onDecline,
}) => {
  return (
    <>
      {/* Quick response helpers */}
      <div className="flex justify-around items-center px-6 text-neutral-400 text-xs">
        <div className="flex flex-col items-center space-y-1">
          <Clock className="w-6 h-6 stroke-[1.5]" />
          <span>{getTranslation(language, "remindMe")}</span>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <MessageSquare className="w-6 h-6 stroke-[1.5]" />
          <span>{getTranslation(language, "sendMessage")}</span>
        </div>
      </div>

      {/* Accept / Decline Action Buttons */}
      <div className="flex items-center justify-around px-4 pb-8">
        {/* Decline Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onDecline}
            className="ios-end-call-btn"
            aria-label={getTranslation(language, "decline")}
          >
            <PhoneOff className="w-8 h-8 fill-current" />
          </motion.button>
          <span className="text-xs text-neutral-300 mt-3 font-medium">
            {getTranslation(language, "decline")}
          </span>
        </div>

        {/* Accept Button with bounce animation */}
        <div className="flex flex-col items-center">
          <motion.button
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            whileTap={{ scale: 0.9 }}
            onClick={onAccept}
            className="ios-answer-call-btn"
            aria-label={getTranslation(language, "answer")}
          >
            <Phone className="w-8 h-8 fill-current" />
          </motion.button>
          <span className="text-xs text-neutral-300 mt-3 font-medium">
            {getTranslation(language, "answer")}
          </span>
        </div>
      </div>
    </>
  );
};
