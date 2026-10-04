import React from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { AlertListItem } from "../api";

interface IncidentCardProps {
  alert: AlertListItem;
  isSelected: boolean;
  onSelect: (alert: AlertListItem) => void;
  isNew?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  alert,
  isSelected,
  onSelect,
  isNew,
}) => {
  const isEmergency = alert.level === "emergency";
  const formattedDate = new Date(alert.createdAt).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      onClick={() => onSelect(alert)}
      className={`cursor-pointer rounded-2xl p-4 transition-all text-left flex flex-col gap-2.5 border-2 ${
        isSelected
          ? isEmergency
            ? "bg-[#18222e] border-rose-500/80 shadow-[0_2px_0_0_#e11d48]"
            : "bg-[#18222e] border-[#9cadc0] shadow-[0_2px_0_0_#c0d4ed]"
          : isEmergency
          ? "bg-[#141b24] border-rose-900/50 hover:border-rose-700/60"
          : "bg-[#101720] border-[#9cadc0]/25 hover:border-[#9cadc0]/50"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Subtle Level Badge matching mobile language */}
          <span
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-wide uppercase border ${
              isEmergency
                ? "bg-rose-950/60 border-rose-700 text-rose-300"
                : "bg-[#1c2b39] border-[#9cadc0]/40 text-[#c0d4ed]"
            }`}
          >
            {isEmergency ? "Emergency" : "Alert"}
          </span>

          <span className="text-[11px] text-[#9cadc0] font-medium uppercase tracking-wider">
            {alert.source}
          </span>

          {isNew && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              New
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-[#9cadc0]">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Trigger Phrase or Title */}
      <div className="text-sm font-bold text-[#c0d4ed] leading-snug">
        {alert.triggerPhrase ? (
          <span className="text-white">&ldquo;{alert.triggerPhrase}&rdquo;</span>
        ) : (
          <span className="text-[#9cadc0] italic font-normal">Sygnał bez frazy</span>
        )}
      </div>

      {/* Transcript snippet if available */}
      {alert.transcriptSnippet && (
        <p className="text-xs text-[#9cadc0] line-clamp-1 italic">
          &ldquo;{alert.transcriptSnippet}&rdquo;
        </p>
      )}

      {/* Footer info: Location & Deliveries */}
      <div className="pt-2 border-t border-[#9cadc0]/20 flex items-center justify-between text-[11px] text-[#9cadc0]">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          {alert.location ? (
            <span>
              {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
              <span className="text-neutral-500 ml-1">(±{Math.round(alert.location.accuracy)}m)</span>
            </span>
          ) : (
            <span className="text-neutral-500">Brak GPS</span>
          )}
        </div>

        {alert.deliveries && alert.deliveries.length > 0 && (
          <div className="flex items-center gap-1.5">
            {alert.deliveries.map((del, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#9cadc0]"
              >
                {del.status === "sent" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-rose-400" />
                )}
                <span>{del.channel}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
