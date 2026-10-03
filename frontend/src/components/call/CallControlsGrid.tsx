import React from "react";
import { Mic, MicOff, Volume2, Grid, UserPlus, Video, User } from "lucide-react";
import type { Language } from "../../types";
import { getTranslation } from "../../i18n";

interface CallControlsGridProps {
  language: Language;
  isMuted: boolean;
  isSpeaker: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export const CallControlsGrid: React.FC<CallControlsGridProps> = ({
  language,
  isMuted,
  isSpeaker,
  onToggleMute,
  onToggleSpeaker,
}) => {
  return (
    <div className="grid grid-cols-3 gap-y-6 gap-x-4 max-w-xs mx-auto w-full my-auto py-4">
      {/* Mute Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? "bg-white text-black"
              : "bg-neutral-800/80 text-white active:bg-neutral-700 border border-neutral-700/50"
          }`}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {isMuted ? getTranslation(language, "muted") : getTranslation(language, "mute")}
        </span>
      </div>

      {/* Keypad */}
      <div className="flex flex-col items-center">
        <button className="w-16 h-16 rounded-full bg-neutral-800/80 active:bg-neutral-700 border border-neutral-700/50 flex items-center justify-center text-white transition-all">
          <Grid className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "keypad")}
        </span>
      </div>

      {/* Speaker / Audio */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleSpeaker}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isSpeaker
              ? "bg-white text-black"
              : "bg-neutral-800/80 text-white active:bg-neutral-700 border border-neutral-700/50"
          }`}
        >
          <Volume2 className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "speaker")}
        </span>
      </div>

      {/* Add Call */}
      <div className="flex flex-col items-center">
        <button className="w-16 h-16 rounded-full bg-neutral-800/80 active:bg-neutral-700 border border-neutral-700/50 flex items-center justify-center text-white transition-all">
          <UserPlus className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "addCall")}
        </span>
      </div>

      {/* FaceTime / Video */}
      <div className="flex flex-col items-center">
        <button className="w-16 h-16 rounded-full bg-neutral-800/80 active:bg-neutral-700 border border-neutral-700/50 flex items-center justify-center text-white transition-all">
          <Video className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">FaceTime</span>
      </div>

      {/* Contacts */}
      <div className="flex flex-col items-center">
        <button className="w-16 h-16 rounded-full bg-neutral-800/80 active:bg-neutral-700 border border-neutral-700/50 flex items-center justify-center text-white transition-all">
          <User className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "contacts")}
        </span>
      </div>
    </div>
  );
};
