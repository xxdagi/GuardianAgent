import React, { useState } from "react";
import { Timer } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface CallDelaySectionProps {
  language: Language;
  theme: Theme;
  callDelaySeconds: number;
  onChangeCallDelay: (sec: number) => void;
}

export const CallDelaySection: React.FC<CallDelaySectionProps> = ({
  language,
  theme,
  callDelaySeconds,
  onChangeCallDelay,
}) => {
  const isDark = theme === "dark";
  const [customDelayInput, setCustomDelayInput] = useState<string>(String(callDelaySeconds));
  const delayPresets = [5, 10, 15, 30, 60];

  const handleDelayChange = (value: string) => {
    setCustomDelayInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onChangeCallDelay(parsed);
    }
  };

  return (
    <div className="card-tactile mb-6">
      <div className="flex items-center space-x-2 text-xs font-black mb-1 text-[#1c2b39] dark:text-[#c0d4ed]">
        <Timer className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
        <span>{getTranslation(language, "delayTitle")}</span>
      </div>
      <p className="text-[11px] mb-3 font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/70">
        {getTranslation(language, "delayDesc")}
      </p>

      {/* Custom Seconds Input */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="number"
          min="1"
          max="600"
          value={customDelayInput}
          onChange={(e) => handleDelayChange(e.target.value)}
          placeholder={getTranslation(language, "secondsPlaceholder")}
          className="w-28 input-tactile text-sm py-2"
        />
        <span className="text-xs font-bold text-[#1c2b39] dark:text-[#c0d4ed]">
          {getTranslation(language, "seconds")}
        </span>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {delayPresets.map((sec) => (
          <button
            key={sec}
            onClick={() => {
              setCustomDelayInput(String(sec));
              onChangeCallDelay(sec);
            }}
            className={`h-8 px-3.5 rounded-xl text-xs font-black flex items-center justify-center border-2 transition-all ${
              callDelaySeconds === sec
                ? "bg-[#9cadc0] text-white border-[#9cadc0] shadow-sm"
                : isDark
                ? "bg-[#0f1720] text-[#c0d4ed] border-[#9cadc0]/40 hover:border-[#9cadc0]"
                : "bg-white text-[#1c2b39] border-[#9cadc0]/40 hover:border-[#9cadc0]"
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
};
