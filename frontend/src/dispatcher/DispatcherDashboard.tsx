import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  RefreshCw,
  Bell,
  Check,
  MapPin,
  Clock,
  Flame,
  AlertTriangle,
  ArrowLeft,
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Dispatcher Live Feed
              </h1>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Jury / Laptop Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Centrum powiadomień alarmowych i geolokalizacji w czasie rzeczywistym
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          {/* New Alert Notification Badge */}
          {hasNewAlert && (
            <button
              onClick={acknowledgeNewAlert}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/60 animate-bounce transition-colors"
            >
              <Bell className="w-4 h-4 fill-current" />
              <span>NOWY INCYDENT!</span>
              <Check className="w-3.5 h-3.5 ml-1" />
            </button>
          )}

          {/* Counters */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              {emergencyCount} Emergency
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {alertCount} Alert
            </span>
          </div>

          {/* Polling Heartbeat */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Polling (3s):</span>
            <span className="text-slate-200">
              {lastPolledAt ? lastPolledAt.toLocaleTimeString("pl-PL") : "łączenie..."}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              title="Odśwież teraz"
              className="hover:text-slate-200 ml-1 p-0.5 rounded transition-transform active:rotate-180"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Back to Mobile App button */}
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Aplikacja mobilna</span>
          </a>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feed List (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Ostatnie incydenty ({alerts.length})</span>
            </h2>
            {isLoading && alerts.length === 0 && (
              <span className="text-xs text-slate-500 animate-pulse">Ładowanie alertów...</span>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
              <span>Błąd pobierania alertów: {error}</span>
              <button
                onClick={() => refetch()}
                className="underline hover:text-white ml-2"
              >
                Ponów
              </button>
            </div>
          )}

          {alerts.length === 0 && !isLoading && !error && (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
              <p className="font-semibold text-slate-400">Brak zarejestrowanych incydentów</p>
              <p className="text-xs max-w-xs">
                Wyzwól testowy alert lub wypowiedz frazę kluczową w aplikacji na telefonie. Pojawi się tutaj natychmiast.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {alerts.map((alert) => (
              <IncidentCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={(a) => setSelectedAlertId(a.id)}
              />
            ))}
          </div>
        </section>

        {/* Right Column: Active Incident Details & Map (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Szczegóły zdarzenia & Lokalizacja GPS</span>
            </h2>
          </div>

          {selectedAlert ? (
            <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-slate-500">ID: {selectedAlert.id}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedAlert.triggerPhrase
                      ? `Fraza alarmowa: "${selectedAlert.triggerPhrase}"`
                      : `Incydent ${selectedAlert.level.toUpperCase()}`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedAlert.level === "emergency"
                        ? "bg-rose-600 text-white shadow-lg shadow-rose-950/50 animate-pulse"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {selectedAlert.level}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono">
                    {selectedAlert.source}
                  </span>
                </div>
              </div>

              {/* Transcript Snippet */}
              {selectedAlert.transcriptSnippet && (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Fragment transkrypcji rozmowy (STT):
                  </span>
                  <p className="text-sm text-slate-200 italic font-mono">
                    &ldquo;{selectedAlert.transcriptSnippet}&rdquo;
                  </p>
                </div>
              )}

              {/* Map View */}
              <IncidentMap
                location={selectedAlert.location}
                alertTitle={selectedAlert.triggerPhrase || selectedAlert.id}
              />

              {/* Meta details table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Zarejestrowano</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">
                    {new Date(selectedAlert.createdAt).toLocaleString("pl-PL")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Session UUID</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate block mt-0.5" title={selectedAlert.sessionId}>
                    {selectedAlert.sessionId.slice(0, 13)}...
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Koordynaty GPS</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">
                    {selectedAlert.location
                      ? `${selectedAlert.location.latitude.toFixed(4)}, ${selectedAlert.location.longitude.toFixed(4)}`
                      : "Brak"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dokładność</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">
                    {selectedAlert.location ? `±${Math.round(selectedAlert.location.accuracy)} m` : "—"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <MapPin className="w-12 h-12 text-slate-600 mb-3" />
              <p className="font-semibold text-slate-400">Wybierz incydent z listy</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Kliknij dowolną kartę incydentu po lewej stronie, aby wyświetlić pozycję na mapie i pełny kontekst audio.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
