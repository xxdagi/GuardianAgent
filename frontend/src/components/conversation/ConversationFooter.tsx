import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface ConversationFooterProps {
  language: Language;
  onConfirm: () => void;
}

export const ConversationFooter: React.FC<ConversationFooterProps> = ({
  language,
  onConfirm,
}) => {
  return (
    <div className="mt-8 mb-4">
      <button
        onClick={onConfirm}
        className="btn-tactile-primary text-sm rounded-2xl"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>{getTranslation(language, "confirmAndReturn")}</span>
      </button>
    </div>
  );
};
