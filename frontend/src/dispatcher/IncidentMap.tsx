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
      <div className="w-full h-80 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <ShieldOff className="w-12 h-12 text-slate-500 mb-3" />
        <p className="font-semibold text-slate-300">Brak współrzędnych GPS</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Użytkownik nie udostępnił lokalizacji lub alert został wywołany bez aktywnego modułu geolokalizacji.
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
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
        <iframe
          title="Incident Map"
          className="w-full h-full border-0"
          src={embedUrl}
          loading="lazy"
        />
        <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
          <span className="text-slate-400">
            (±{Math.round(accuracy)}m)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>{alertTitle ? `Pozycja incydentu: ${alertTitle}` : "Podgląd pozycji OpenStreetMap"}</span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
        >
          <span>Otwórz w Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
