import React from "react";
import { motion } from "framer-motion";
import { PhoneOff } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface EndCallButtonProps {
  language: Language;
  onEndCall: () => void;
}

export const EndCallButton: React.FC<EndCallButtonProps> = ({
  language,
  onEndCall,
}) => {
  return (
    <div className="flex justify-center pb-4">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onEndCall}
        className="ios-end-call-btn"
        aria-label={getTranslation(language, "endCallAria")}
      >
        <PhoneOff className="w-8 h-8 fill-current" />
      </motion.button>
    </div>
  );
};
