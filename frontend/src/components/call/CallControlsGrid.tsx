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
          className={`ios-call-btn ${isMuted ? "ios-call-btn-active" : ""}`}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {isMuted ? getTranslation(language, "muted") : getTranslation(language, "mute")}
        </span>
      </div>

      {/* Keypad */}
      <div className="flex flex-col items-center">
        <button className="ios-call-btn">
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
          className={`ios-call-btn ${isSpeaker ? "ios-call-btn-active" : ""}`}
        >
          <Volume2 className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "speaker")}
        </span>
      </div>

      {/* Add Call */}
      <div className="flex flex-col items-center">
        <button className="ios-call-btn">
          <UserPlus className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "addCall")}
        </span>
      </div>

      {/* FaceTime / Video */}
      <div className="flex flex-col items-center">
        <button className="ios-call-btn">
          <Video className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "videoCall")}
        </span>
      </div>

      {/* Contacts */}
      <div className="flex flex-col items-center">
        <button className="ios-call-btn">
          <User className="w-7 h-7" />
        </button>
        <span className="text-xs text-neutral-300 mt-2 font-light">
          {getTranslation(language, "contacts")}
        </span>
      </div>
    </div>
  );
};
