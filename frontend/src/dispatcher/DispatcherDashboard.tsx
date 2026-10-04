import React, { useState, useEffect } from "react";
import {
  Shield,
  Radio,
  RefreshCw,
  MapPin,
  Clock,
  ArrowLeft,
  MessageSquareQuote,
  AlertTriangle,
} from "lucide-react";
import { useAlertsFeed } from "./useAlertsFeed";
import { IncidentCard } from "./IncidentCard";
import { IncidentMap } from "./IncidentMap";

export const DispatcherDashboard: React.FC = () => {
  const {
    alerts,
    isLoading,
    error,
    hasNewAlert,
    acknowledgeNewAlert,
    refetch,
    lastPolledAt,
  } = useAlertsFeed();

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Auto-select newest alert or preserve selection
  useEffect(() => {
    if (alerts.length > 0 && !selectedAlertId) {
      setSelectedAlertId(alerts[0].id);
    }
  }, [alerts, selectedAlertId]);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0] || null;

  const emergencyCount = alerts.filter((a) => a.level === "emergency").length;
  const alertCount = alerts.filter((a) => a.level === "alert").length;

  return (
    <div className="min-h-screen w-full bg-[#0f1720] text-[#c0d4ed] font-sans flex flex-col select-none antialiased">
      {/* 1. Guardian Agent Consistent Desktop Header */}
      <header className="border-b border-[#9cadc0]/25 bg-[#0f1720] sticky top-0 z-20 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Mode Identification */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#18222e] border-2 border-[#9cadc0] flex items-center justify-center shadow-[0_2px_0_0_#c0d4ed] shrink-0">
            <Shield className="w-5 h-5 text-[#c0d4ed]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">
                Guardian Agent
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg border-2 border-[#9cadc0] bg-[#18222e] text-[#c0d4ed] shadow-[0_1px_0_0_#c0d4ed]">
                Dispatcher
              </span>
            </div>
            <p className="text-xs text-[#9cadc0] mt-0.5">
              Centrum monitoringu i podglądu alertów w czasie rzeczywistym
            </p>
          </div>
        </div>

        {/* Status Indicators & Navigation */}
        <div className="flex items-center gap-3 text-xs">
          {/* Subtle New Alert Indicator */}
          {hasNewAlert && (
            <button
              onClick={acknowledgeNewAlert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-500/70 bg-emerald-950/40 text-emerald-300 font-bold shadow-[0_2px_0_0_#10b981] hover:bg-emerald-950/70 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nowe zdarzenie</span>
              <span className="text-[10px] text-emerald-400/80 font-normal ml-1">✕</span>
            </button>
          )}

          {/* Incident Severity Counters */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#9cadc0]/40 bg-[#18222e] text-xs font-bold text-[#c0d4ed] shadow-[0_2px_0_0_#0a1017]">
            <span className="text-rose-400">{emergencyCount} Emergency</span>
            <span className="text-[#9cadc0]/40">·</span>
            <span className="text-[#c0d4ed]">{alertCount} Alert</span>
          </div>

          {/* Polling Heartbeat Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#9cadc0]/40 bg-[#18222e] text-xs font-bold text-[#9cadc0] shadow-[0_2px_0_0_#0a1017]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Na żywo (3s)</span>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              title="Odśwież"
              className="hover:text-white p-0.5 rounded transition-transform active:rotate-180"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Back to Mobile App Button */}
          <a
            href="/"
            className="btn-mini-tactile px-3.5 py-1.5 text-xs text-[#c0d4ed] flex items-center space-x-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Aplikacja</span>
          </a>
        </div>
      </header>

      {/* 2. Main Workstation Layout */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Large Map & Selected Incident Details (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Map Workspace */}
          <div className="w-full flex flex-col gap-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#9cadc0] flex items-center gap-1.5 px-1">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Mapa incydentu</span>
            </h2>
            <IncidentMap
              location={selectedAlert?.location || null}
              alertTitle={selectedAlert?.triggerPhrase || selectedAlert?.id}
            />
          </div>

          {/* Selected Incident Clean Panel */}
          {selectedAlert ? (
            <div className="w-full rounded-2xl bg-[#141d27] border-2 border-[#9cadc0]/40 p-6 flex flex-col gap-4 shadow-[0_2px_0_0_#0a1017]">
              {/* Header: Title, Level & Source */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#9cadc0]/20">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-[#9cadc0]">ID: {selectedAlert.id}</div>
                  <h3 className="text-base font-black text-white mt-0.5 truncate">
                    {selectedAlert.triggerPhrase
                      ? `Hasło alarmowe: "${selectedAlert.triggerPhrase}"`
                      : `Incydent ${selectedAlert.level.toUpperCase()}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 ${
                      selectedAlert.level === "emergency"
                        ? "bg-rose-950/70 border-rose-600 text-rose-200"
                        : "bg-[#1c2b39] border-[#9cadc0] text-[#c0d4ed]"
                    }`}
                  >
                    {selectedAlert.level}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#18222e] border border-[#9cadc0]/40 text-[#9cadc0] uppercase">
                    {selectedAlert.source}
                  </span>
                </div>
              </div>

              {/* Transcript Snippet */}
              {selectedAlert.transcriptSnippet && (
                <div className="rounded-xl bg-[#0f1720] border border-[#9cadc0]/25 p-3.5 text-xs text-[#c0d4ed]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#9cadc0] uppercase mb-1">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Zarejestrowana wypowiedź</span>
                  </div>
                  <p className="italic font-medium leading-relaxed">&ldquo;{selectedAlert.transcriptSnippet}&rdquo;</p>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#0f1720] p-4 rounded-xl border border-[#9cadc0]/20">
                <div>
                  <span className="text-[#9cadc0] block text-[11px]">Czas</span>
                  <span className="text-white font-bold mt-0.5 block">
                    {new Date(selectedAlert.createdAt).toLocaleTimeString("pl-PL")}
                  </span>
                </div>
                <div>
                  <span className="text-[#9cadc0] block text-[11px]">Koordynaty</span>
                  <span className="text-white font-mono font-bold mt-0.5 block">
                    {selectedAlert.location
                      ? `${selectedAlert.location.latitude.toFixed(4)}, ${selectedAlert.location.longitude.toFixed(4)}`
                      : "Brak"}
                  </span>
                </div>
                <div>
                  <span className="text-[#9cadc0] block text-[11px]">Dokładność</span>
                  <span className="text-white font-bold mt-0.5 block">
                    {selectedAlert.location ? `±${Math.round(selectedAlert.location.accuracy)} m` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#9cadc0] block text-[11px]">Doręczenie</span>
                  <span className="text-emerald-400 font-bold mt-0.5 block uppercase">
                    {selectedAlert.deliveries?.[0]?.status === "sent" ? "Dostarczono" : "Wysłano"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#141d27] border-2 border-[#9cadc0]/25 p-6 text-center text-[#9cadc0]">
              <p className="font-bold text-sm text-[#c0d4ed]">Wybierz incydent</p>
              <p className="text-xs mt-1">Kliknij incydent z listy po prawej stronie, aby wyświetlić szczegóły.</p>
            </div>
          )}
        </section>

        {/* Right Side: Incidents Feed List (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#9cadc0] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Lista incydentów ({alerts.length})</span>
            </h2>
            {isLoading && alerts.length === 0 && (
              <span className="text-xs text-[#9cadc0] animate-pulse">Ładowanie...</span>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border-2 border-rose-700/60 text-rose-300 text-xs flex items-center justify-between">
              <span>Błąd: {error}</span>
              <button
                onClick={() => refetch()}
                className="underline hover:text-white ml-2 font-bold"
              >
                Ponów
              </button>
            </div>
          )}

          {alerts.length === 0 && !isLoading && !error && (
            <div className="rounded-2xl border-2 border-dashed border-[#9cadc0]/30 bg-[#101720] p-10 text-center text-[#9cadc0] flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8 text-[#9cadc0]/50" />
              <p className="font-bold text-sm text-[#c0d4ed]">Brak zarejestrowanych incydentów</p>
              <p className="text-xs max-w-xs leading-relaxed">
                Po wyzwoleniu alertu w aplikacji Guardian Agent incydent pojawi się na tej liście w czasie rzeczywistym.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {alerts.map((alert, idx) => (
              <IncidentCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={(a) => {
                  setSelectedAlertId(a.id);
                  if (hasNewAlert && idx === 0) acknowledgeNewAlert();
                }}
                isNew={hasNewAlert && idx === 0}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
