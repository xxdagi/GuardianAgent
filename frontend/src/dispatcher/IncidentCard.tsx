import React from "react";
import {
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  MapPin,
  Bot,
  Keyboard,
  CheckCircle2,
  XCircle,
  MessageSquareQuote,
} from "lucide-react";
import type { AlertListItem } from "../api";

interface IncidentCardProps {
  alert: AlertListItem;
  isSelected: boolean;
  onSelect: (alert: AlertListItem) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  alert,
  isSelected,
  onSelect,
}) => {
  const isEmergency = alert.level === "emergency";
  const formattedDate = new Date(alert.createdAt).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getSourceIcon = () => {
    switch (alert.source) {
      case "keyword":
        return <Radio className="w-3.5 h-3.5 text-amber-400" />;
      case "agent":
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      case "manual":
        return <Keyboard className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return null;
    }
  };

  const getSourceLabel = () => {
    switch (alert.source) {
      case "keyword":
        return "Słowo klucz";
      case "agent":
        return "Agent AI";
      case "manual":
        return "Manual SOS";
      default:
        return alert.source;
    }
  };

  return (
    <div
      onClick={() => onSelect(alert)}
      className={`cursor-pointer rounded-xl p-4 transition-all border text-left flex flex-col gap-3 ${
        isSelected
          ? "border-sky-500 bg-slate-800/90 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500"
          : isEmergency
          ? "border-rose-800/60 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-700"
          : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isEmergency ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" />
              EMERGENCY
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              ALERT
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
            {getSourceIcon()}
            <span>{getSourceLabel()}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Trigger phrase */}
      {alert.triggerPhrase && (
        <div className="text-sm font-semibold text-slate-100 flex items-baseline gap-2">
          <span className="text-slate-400 font-normal text-xs uppercase tracking-wide">Fraza:</span>
          <span className="text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60 font-mono">
            &ldquo;{alert.triggerPhrase}&rdquo;
          </span>
        </div>
      )}

      {/* Transcript snippet */}
      {alert.transcriptSnippet && (
        <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <MessageSquareQuote className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="italic line-clamp-2">&ldquo;{alert.transcriptSnippet}&rdquo;</p>
        </div>
      )}

      {/* Footer info: Location & Deliveries */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {alert.location ? (
            <span className="text-slate-300">
              {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
              <span className="text-slate-500 ml-1">(±{Math.round(alert.location.accuracy)}m)</span>
            </span>
          ) : (
            <span className="text-slate-500 italic">Brak GPS</span>
          )}
        </div>

        {alert.deliveries && alert.deliveries.length > 0 && (
          <div className="flex items-center gap-1.5">
            {alert.deliveries.map((del, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
                  del.status === "sent"
                    ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/50"
                    : "text-rose-400 bg-rose-950/40 border border-rose-800/50"
                }`}
              >
                {del.status === "sent" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                <span className="uppercase">{del.channel}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
