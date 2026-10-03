import React from "react";
import { Shield, Settings as SettingsIcon } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";
import type { GeoCoordinates } from "../../services/geolocation";

interface HomeHeaderProps {
  language: Language;
  theme: Theme;
  coords: GeoCoordinates | null;
  onOpenSettings: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  language,
  theme,
  coords,
  onOpenSettings,
}) => {
  const isDark = theme === "dark";

  return (
    <header
      className={`flex items-center justify-between border-b pb-4 transition-colors shrink-0 ${
        isDark ? "border-[#9cadc0]/30" : "border-[#9cadc0]/25"
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0 pr-2">
        <div className="w-11 h-11 rounded-2xl bg-[#f0f5fc] dark:bg-[#18222e] border-2 border-[#9cadc0] flex items-center justify-center shadow-[0_2px_0_0_#c0d4ed] shrink-0">
          <Shield className="w-5 h-5 text-[#9cadc0] dark:text-[#c0d4ed]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight truncate text-[#1c2b39] dark:text-[#c0d4ed]">
            {getTranslation(language, "appTitle")}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {/* GPS Status Indicator (compact 3D style pill) */}
        <div
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-[#9cadc0] bg-[#f0f5fc] dark:bg-[#18222e] text-[#1c2b39] dark:text-[#c0d4ed] shadow-[0_2px_0_0_#c0d4ed]"
          title={
            coords
              ? `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
              : getTranslation(language, "gpsSearching")
          }
        >
          <span className={`w-2 h-2 rounded-full ${coords ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-[11px] font-black">GPS</span>
        </div>

        {/* Gear Icon Button (Settings) with 3D tactile button feel */}
        <button
          onClick={onOpenSettings}
          aria-label={getTranslation(language, "settings")}
          className="btn-mini-tactile w-10 h-10 p-0 text-[#1c2b39] dark:text-[#c0d4ed]"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
