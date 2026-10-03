import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";
import { api, type AlertListItem } from "../api";
import type { Language, Theme, EmergencyContact } from "../types";

interface MockSmsViewerProps {
  language: Language;
  theme: Theme;
  onBackToApp: () => void;
  contact?: EmergencyContact;
}

// Play a pleasant, subtle two-tone incoming SMS chime via Web Audio API
function playSmsChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export const MockSmsViewer: React.FC<MockSmsViewerProps> = ({
  language,
  theme,
  onBackToApp,
  contact,
}) => {
  const isDark = theme === "dark";
  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newSmsNotification, setNewSmsNotification] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"live" | "all">("live");

  // Track session start window (allows alerts from the current server session to appear even if tab opened after trigger)
  const sessionStartTimeRef = useRef<number>(Date.now() - 1000 * 60 * 60);
  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const recipientLabel = contact?.name || (language === "pl" ? "Mama" : "Mom");
  const senderLabel = language === "pl" ? "Córka ❤️" : "Daughter ❤️";

  // Filter alerts: "live" mode shows only alerts created during or after this viewer session
  const displayedAlerts =
    viewMode === "all"
      ? alerts
      : alerts.filter((item) => {
          if (!item.createdAt) return true;
          const t = new Date(item.createdAt).getTime();
          return !isNaN(t) && t >= sessionStartTimeRef.current;
        });

  // 1. Fetch alerts from BFF
  const fetchAlerts = async (isInitial = false) => {
    try {
      const data = await api.listAlerts();
      if (Array.isArray(data)) {
        // Backend returns newest first; reverse for chronological SMS chat feed
        const sorted = [...data].reverse();

        // Detect newly arrived alerts
        let hasNew = false;
        let latestSnippet = "";
        for (const item of sorted) {
          if (!knownAlertIdsRef.current.has(item.id)) {
            knownAlertIdsRef.current.add(item.id);
            // Only trigger notifications if alert was created during current session
            const alertTime = new Date(item.createdAt).getTime();
            if (!isInitial || (!isNaN(alertTime) && alertTime >= sessionStartTimeRef.current)) {
              hasNew = true;
              latestSnippet = item.triggerPhrase || "🚨 ALARM SOS";
            }
          }
        }

        setAlerts(sorted);

        if (hasNew) {
          if (soundEnabled) playSmsChime();
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate([200, 100, 200]);
            } catch {
              // Ignore vibration errors
            }
          }
          setNewSmsNotification(latestSnippet);
          setTimeout(() => setNewSmsNotification(null), 4500);
        }
      }
    } catch (err) {
      console.warn("Could not fetch alerts for mock SMS viewer:", err);
    }
  };

  // 2. Poll every 1.5s for real-time live SMS reception
  useEffect(() => {
    fetchAlerts(true);
    const interval = setInterval(() => {
      fetchAlerts(false);
    }, 1500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // 3. Scroll to latest SMS on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedAlerts.length]);

  // 4. Reset live session (empty live inbox for fresh demo demonstration)
  const handleResetSession = () => {
    sessionStartTimeRef.current = Date.now();
    setViewMode("live");
    setNewSmsNotification(null);
  };

  // 5. Manual trigger simulation helper for instant demonstration
  const handleSimulateDemoAlert = async () => {
    try {
      await api.createAlert({
        sessionId: `demo-${Date.now()}`,
        level: "alert",
        source: "keyword",
        triggerPhrase: "czy nakarmiłaś kota",
        language,
        recipientName: recipientLabel,
        recipientPhone: contact?.phone || "+48500600700",
        location: {
          latitude: 50.0617,
          longitude: 19.9373,
          accuracy: 15,
        },
      });
      fetchAlerts(false);
    } catch (err) {
      console.warn("Failed to simulate alert:", err);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`min-h-full w-full max-w-md mx-auto flex flex-col font-sans select-none transition-colors duration-200 relative overflow-hidden ${
        isDark ? "bg-[#0b1219] text-white" : "bg-[#f4f7fb] text-[#1c2b39]"
      }`}
    >
      {/* 1. iOS-style Dynamic Alert Notification Banner (pops down from top when SMS arrives) */}
      <AnimatePresence>
        {newSmsNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="absolute top-3 left-4 right-4 z-50 p-3.5 rounded-2xl bg-neutral-900/95 border-2 border-rose-500/70 shadow-2xl text-white backdrop-blur-md flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0 animate-bounce shadow-md shadow-rose-900/40">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-center text-[10px] text-rose-300 font-black uppercase tracking-wider">
                <span>{language === "pl" ? "Nowa wiadomość SMS" : "New SMS Message"}</span>
                <span>{language === "pl" ? "Teraz" : "Now"}</span>
              </div>
              <p className="text-xs font-black truncate text-white mt-0.5">
                {senderLabel}: "{newSmsNotification}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation Bar (Recipient Phone Header) */}
      <div
        className={`px-4 pt-4 pb-3 border-b transition-colors shrink-0 flex items-center justify-between ${
          isDark ? "bg-[#111c26] border-[#9cadc0]/30" : "bg-white border-[#9cadc0]/25 shadow-sm"
        }`}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToApp}
            className="btn-mini-tactile px-2.5 py-1 text-xs text-[#1c2b39] dark:text-[#c0d4ed] flex items-center"
            title="Powrót do telefonu dzwoniącego"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span className="text-[11px] font-bold">{language === "pl" ? "Aplikacja" : "App"}</span>
          </button>
        </div>

        {/* Sender Persona Avatar & Identity */}
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9cadc0] to-[#5b728a] text-white flex items-center justify-center font-black text-sm border-2 border-white dark:border-[#111c26] shadow-sm">
            {senderLabel.charAt(0)}
          </div>
          <span className="text-xs font-black tracking-tight mt-0.5 text-[#1c2b39] dark:text-white">
            {senderLabel}
          </span>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-semibold text-emerald-500">
              {language === "pl" ? "Nasłuchiwanie na żywo" : "Listening Live"}
            </span>
          </div>
        </div>

        {/* Quick controls: Audio Chime & Reset */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleResetSession}
            className="btn-mini-tactile p-2 text-[#1c2b39] dark:text-[#c0d4ed]"
            title={language === "pl" ? "Wyczyść bieżącą sesję (przygotuj do demo)" : "Reset live session"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="btn-mini-tactile p-2 text-[#1c2b39] dark:text-[#c0d4ed]"
            title={soundEnabled ? "Dźwięk SMS włączony" : "Dźwięk wyłączony"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
          </button>
        </div>
      </div>

      {/* 3. Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Device Simulation Banner */}
        <div className="flex items-center justify-between my-1 px-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isDark
                ? "bg-[#18222e] text-[#9cadc0] border-[#9cadc0]/30"
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
            }`}
          >
            📱 {language === "pl" ? `Telefon odbiorcy (${recipientLabel})` : `Recipient's Phone (${recipientLabel})`}
          </span>

          {alerts.length > 0 && (
            <button
              onClick={() => setViewMode((prev) => (prev === "live" ? "all" : "live"))}
              className="text-[10px] font-bold text-[#9cadc0] hover:text-[#1c2b39] dark:hover:text-white underline"
            >
              {viewMode === "live"
                ? language === "pl"
                  ? `Historia (${alerts.length})`
                  : `History (${alerts.length})`
                : language === "pl"
                ? "Tylko na żywo"
                : "Live only"}
            </button>
          )}
        </div>

        {displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 space-y-4">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute -inset-3 rounded-full bg-emerald-500/25 blur-md"
              />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-8 h-8" />
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-[#1c2b39] dark:text-[#c0d4ed]">
                {language === "pl" ? "Oczekiwanie na sygnał SOS na żywo..." : "Waiting for live SOS signal..."}
              </p>
              <p className="text-xs text-[#9cadc0] mt-1.5 max-w-xs leading-relaxed font-medium">
                {language === "pl"
                  ? "Rozpocznij połączenie na telefonie i wypowiedz hasło alarmowe (np. 'czy nakarmiłaś kota'). Gdy telefon usłyszy hasło, cichy SMS pojawi się tutaj natychmiast."
                  : "Start a call and speak your secret phrase. A silent SMS with Google Maps route will appear here in real time."}
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleSimulateDemoAlert}
                className="btn-mini-tactile px-3.5 py-1.5 text-xs text-[#1c2b39] dark:text-[#c0d4ed] flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "pl" ? "Wyślij testowy alert SOS" : "Send Test SOS Alert"}</span>
              </button>
            </div>
          </div>
        ) : (
          displayedAlerts.map((item) => {
            const lat = item.location?.latitude ?? 50.0617;
            const lng = item.location?.longitude ?? 19.9373;
            const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
            const trigger = item.triggerPhrase || (language === "pl" ? "alarm cichy" : "silent alert");

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="flex flex-col items-start space-y-1"
              >
                {/* Timestamp header */}
                <div className="w-full text-center my-1">
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    {formatTime(item.createdAt) || (language === "pl" ? "Dzisiaj" : "Today")}
                  </span>
                </div>

                {/* Incoming SMS Bubble (iOS Green / Styled) */}
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm p-3.5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-500/50 space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-100 border-b border-emerald-500/40 pb-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      {item.level === "emergency"
                        ? language === "pl"
                          ? "PILNY ALARM BEZPIECZEŃSTWA"
                          : "URGENT SAFETY ALERT"
                        : language === "pl"
                        ? "ALARM BEZPIECZEŃSTWA"
                        : "SAFETY ALERT"}
                    </span>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed">
                    {language === "pl"
                      ? `🚨 Potrzebuję pomocy! Moja lokalizacja poniżej. Wykryto hasło: "${trigger}".`
                      : `🚨 I need help! My location below. Detected code: "${trigger}".`}
                  </p>

                  {/* Rich Interactive Map Card */}
                  <div className="rounded-xl bg-black/25 p-2.5 border border-white/20 text-white space-y-2 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center font-bold text-emerald-200">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-rose-300" />
                        {language === "pl" ? "Współrzędne GPS" : "GPS Coordinates"}
                      </span>
                      <span className="text-[10px] text-emerald-200/80 font-mono">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </span>
                    </div>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-white text-emerald-900 font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:bg-neutral-100 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>{language === "pl" ? "Otwórz trasę w Google Maps" : "Open Route in Google Maps"}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </a>
                  </div>

                  {/* Delivery status metadata */}
                  <div className="flex items-center justify-between text-[9px] text-emerald-100/75 pt-1">
                    <span>{language === "pl" ? "Cichy SMS • Mock Dispatcher" : "Silent SMS • Mock Dispatcher"}</span>
                    <span>✓✓ {language === "pl" ? "Dostarczono" : "Delivered"}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Simulated Input Bar */}
      <div
        className={`p-3 border-t transition-colors shrink-0 flex items-center space-x-2 ${
          isDark ? "bg-[#111c26] border-[#9cadc0]/30" : "bg-white border-[#9cadc0]/25"
        }`}
      >
        <button
          onClick={handleSimulateDemoAlert}
          className="btn-mini-tactile px-3 py-2 text-xs text-[#1c2b39] dark:text-[#c0d4ed] flex items-center space-x-1"
          title="Symuluj wysłanie SMS"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] font-bold">{language === "pl" ? "Test SOS" : "Test SOS"}</span>
        </button>

        <div
          className={`flex-1 rounded-xl px-3 py-2 text-xs border flex items-center justify-between text-neutral-400 ${
            isDark ? "bg-[#0b1219] border-[#9cadc0]/30" : "bg-neutral-100 border-neutral-300"
          }`}
        >
          <span>{language === "pl" ? "Wiadomość tekstowa..." : "iMessage / Text message..."}</span>
          <Send className="w-3.5 h-3.5 text-[#9cadc0]" />
        </div>
      </div>
    </div>
  );
};
