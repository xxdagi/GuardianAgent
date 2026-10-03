import React from "react";
import { PhoneCall, Timer } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface CallTriggerHeroProps {
  language: Language;
  theme: Theme;
  callDelaySeconds: number;
  scheduledSeconds: number | null;
  onStartCallNow: () => void;
  onScheduleCall: () => void;
  onCancelSchedule: () => void;
}

export const CallTriggerHero: React.FC<CallTriggerHeroProps> = ({
  language,
  theme,
  callDelaySeconds,
  scheduledSeconds,
  onStartCallNow,
  onScheduleCall,
  onCancelSchedule,
}) => {
  const isCountingDown = scheduledSeconds !== null;

  return (
    <div className="flex flex-col gap-5 w-full py-2">
      {/* 1. 3D Pushable Hero Call Now Button */}
      <button
        onClick={onStartCallNow}
        className="call-3d-btn w-full min-h-[105px] px-5 py-4 group"
      >
        <div className="flex items-center space-x-3.5 text-left relative z-10 w-full">
          <div className="w-[60px] h-[60px] rounded-2xl bg-[#c0d4ed] text-[#1c2b39] border-2 border-[#9cadc0] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <PhoneCall className="w-8 h-8 text-[#1c2b39] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-lg sm:text-xl font-black block tracking-tight text-[#1c2b39] dark:text-[#c0d4ed] leading-tight">
              {getTranslation(language, "quickCallNow")}
            </span>
            <span className="text-xs sm:text-[13px] text-[#1c2b39]/75 dark:text-[#c0d4ed]/70 font-semibold mt-0.5 block">
              {getTranslation(language, "quickCallNowSub")}
            </span>
          </div>
        </div>
      </button>

      {/* 2. 3D Pushable Hero Call in X seconds Button */}
      <button
        onClick={isCountingDown ? onCancelSchedule : onScheduleCall}
        className="call-3d-btn w-full min-h-[105px] px-5 py-4 group"
      >
        <div className="flex items-center space-x-3.5 text-left relative z-10 w-full">
          <div className="w-[60px] h-[60px] rounded-2xl bg-[#c0d4ed] text-[#1c2b39] border-2 border-[#9cadc0] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Timer className="w-8 h-8 text-[#1c2b39]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-lg sm:text-xl font-black block tracking-tight text-[#1c2b39] dark:text-[#c0d4ed] leading-tight">
              {isCountingDown
                ? getTranslation(language, "ringingIn", { sec: scheduledSeconds })
                : getTranslation(language, "quickCallDelay", { sec: callDelaySeconds })}
            </span>
            <span className="text-xs sm:text-[13px] text-[#1c2b39]/75 dark:text-[#c0d4ed]/70 font-semibold mt-0.5 block">
              {isCountingDown
                ? getTranslation(language, "tapToCancel")
                : getTranslation(language, "quickCallDelaySub")}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
