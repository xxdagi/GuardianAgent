import React from "react";
import { MapPin, ExternalLink, ShieldOff } from "lucide-react";
import type { Location } from "../api";

interface IncidentMapProps {
  location: Location | null;
  alertTitle?: string;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ location, alertTitle }) => {
  if (!location) {
    return (
      <div className="w-full h-full min-h-[380px] rounded-2xl bg-[#101720] border-2 border-[#9cadc0]/25 flex flex-col items-center justify-center text-[#9cadc0] p-6 text-center shadow-[0_2px_0_0_#0a1017]">
        <div className="w-12 h-12 rounded-2xl bg-[#18222e] border-2 border-[#9cadc0]/40 flex items-center justify-center mb-3">
          <ShieldOff className="w-6 h-6 text-[#9cadc0]" />
        </div>
        <p className="font-bold text-[#c0d4ed] text-sm">Brak współrzędnych GPS</p>
        <p className="text-xs text-[#9cadc0] mt-1 max-w-sm leading-relaxed">
          Alert został zarejestrowany bez współrzędnych geolokalizacyjnych.
        </p>
      </div>
    );
  }

  const { latitude, longitude, accuracy } = location;

  // OpenStreetMap embed coordinates bounding box (roughly ~0.005 deg around target for zoom ~16)
  const delta = 0.005;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Map Container */}
      <div className="relative w-full flex-1 min-h-[380px] rounded-2xl overflow-hidden border-2 border-[#9cadc0] bg-[#101720] shadow-[0_2px_0_0_#c0d4ed]">
        <iframe
          title="Guardian Agent Incident Map"
          className="w-full h-full min-h-[380px] border-0"
          src={embedUrl}
          loading="lazy"
        />

        {/* GPS Badge Overlay in Mobile Tactile Style */}
        <div className="absolute bottom-3 left-3 bg-[#101720]/95 backdrop-blur px-3 py-1.5 rounded-xl border-2 border-[#9cadc0] text-xs text-[#c0d4ed] flex items-center gap-2 shadow-[0_2px_0_0_#c0d4ed]">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-mono font-bold">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
          <span className="text-[11px] text-[#9cadc0]">
            (±{Math.round(accuracy)}m)
          </span>
        </div>
      </div>

      {/* Map Footer Bar */}
      <div className="flex items-center justify-between text-xs text-[#9cadc0] px-1">
        <span className="truncate max-w-md">
          {alertTitle ? `Pozycja incydentu: ${alertTitle}` : "Podgląd pozycji zdarzenia"}
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-[#c0d4ed] hover:text-white transition-colors"
        >
          <span>Otwórz w Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
