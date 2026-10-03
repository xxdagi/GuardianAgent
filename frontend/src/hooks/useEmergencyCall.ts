import { useState, useRef, useEffect } from "react";
import { speechService } from "../services/speech";
import { elevenLabsService } from "../services/elevenlabs";
import { geoService, type GeoCoordinates } from "../services/geolocation";
import { useSafetyMonitor } from "../safety/useSafetyMonitor";
import type { SafetySettings } from "../types/settings";
import type {
  ConversationScenario,
  EmergencyContact,
  Language,
  ActiveView,
} from "../types";
import { getTranslation } from "../i18n";

interface UseEmergencyCallParams {
  language: Language;
  selectedScenario: ConversationScenario;
  callDelaySeconds: number;
  keywords: string[];
  contact: EmergencyContact;
  onNavigate: (view: ActiveView) => void;
  safetySettings?: SafetySettings;
  sessionId?: string;
}

export function useEmergencyCall({
  language,
  selectedScenario,
  callDelaySeconds,
  keywords,
  contact,
  onNavigate,
  safetySettings,
  sessionId,
}: UseEmergencyCallParams) {
  const [scheduledCountdown, setScheduledCountdown] = useState<number | null>(
    null,
  );
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [transcript, setTranscript] = useState("");
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [alertDetails, setAlertDetails] = useState<{
    keyword: string;
    recipient: string;
    lat: number;
    lng: number;
  } | null>(null);

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTriggerPhraseRef = useRef<string>("");

  const defaultSessionIdRef = useRef<string>("");
  if (!defaultSessionIdRef.current) {
    defaultSessionIdRef.current =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
  }
  const activeSessionId = sessionId ?? defaultSessionIdRef.current;

  const activeSafetySettings: SafetySettings = safetySettings ?? {
    language,
    contactName: contact.name || "Zaufany kontakt",
    contactPhone: contact.phone || "+48000000000",
    alertPhrases: keywords.length > 0 ? keywords : ["czy nakarmiłaś kota"],
    emergencyPhrases: ["zadzwoń do dziadka", "call grandpa"],
    emergencyNumber: contact.phone || "112",
  };

  // C4 Safety Pipeline is the sole source of truth for keyword detection and alert dispatch
  const {
    handleUserTranscript,
    handleToolCall,
    triggerManually,
    lastAlert,
    gpsStatus,
  } = useSafetyMonitor(activeSafetySettings, activeSessionId);

  // 1. Sync keywords with speech service
  useEffect(() => {
    speechService.setKeywords(keywords);
  }, [keywords]);

  // 2. Continuous GPS tracking for home screen preview coordinates
  useEffect(() => {
    geoService.startTracking((newCoords) => {
      setCoords(newCoords);
    });
    return () => {
      geoService.stopTracking();
    };
  }, []);

  // 3. Clear timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // 4. Update UI state when C4 dispatches an alert
  useEffect(() => {
    if (!lastAlert) return;

    setEmergencyTriggered(true);

    const recipientText =
      contact.name && contact.phone
        ? `${contact.name} (${contact.phone})`
        : contact.phone ||
          contact.name ||
          getTranslation(language, "trustedContactFallback");

    let lat = coords?.latitude ?? 0;
    let lng = coords?.longitude ?? 0;
    if (lastAlert.mapsUrl) {
      const match = lastAlert.mapsUrl.match(/q=([\d.-]+),([\d.-]+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    setAlertDetails({
      keyword:
        lastTriggerPhraseRef.current ||
        getTranslation(language, "alertPhraseLabel"),
      recipient: recipientText,
      lat,
      lng,
    });

    // Only speak local deterrent if ElevenLabs is not connected (ElevenLabs agent handles its own response)
    if (!elevenLabsService.getIsConnected()) {
      speechService.speak(selectedScenario.deterrentResponse);
    }
  }, [lastAlert, contact, coords, language, selectedScenario.deterrentResponse]);

  // Schedule call with countdown
  const scheduleCall = () => {
    if (scheduledCountdown !== null) return;

    setScheduledCountdown(callDelaySeconds);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setScheduledCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          onNavigate("incoming");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel scheduled countdown
  const cancelSchedule = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setScheduledCountdown(null);
  };

  // Manual or legacy test trigger routed through C4 triggerManually
  const executeEmergencyAlert = (
    detectedKeyword: string,
    _textSnippet = "",
  ) => {
    lastTriggerPhraseRef.current = detectedKeyword;
    triggerManually("alert");
  };

  // Start active conversation
  const startActiveCall = async () => {
    cancelSchedule();
    onNavigate("connected");
    setEmergencyTriggered(false);
    setAlertDetails(null);
    setTranscript("");

    // Start ElevenLabs conversational agent directly with user's agent settings
    const elevenLabsStarted = await elevenLabsService.startConversation({
      callerName: selectedScenario.callerName,
      onTranscript: (line) => {
        setTranscript((prev) => (prev ? `${prev}\n${line}` : line));
      },
      onEmergencyTriggered: (reason) => {
        executeEmergencyAlert(reason);
      },
      onError: (err) => {
        console.warn("ElevenLabs conversation error:", err);
      },
    });

    if (!elevenLabsStarted) {
      console.warn("Could not connect to ElevenLabs agent.");
    }

    // Forward background speech recognition transcripts to safety monitor
    speechService.startListening(
      (newTranscript, isFinal) => {
        if (!elevenLabsStarted) {
          setTranscript(newTranscript);
        }
        handleUserTranscript(newTranscript, isFinal);
      },
      () => {
        // C4 useSafetyMonitor is the sole source of truth for keyword detection
      },
    );
  };

  // End active call
  const endActiveCall = () => {
    elevenLabsService.endConversation();
    speechService.stopListening();
    speechService.cancelSpeech();
    onNavigate("home");
    setEmergencyTriggered(false);
    cancelSchedule();
  };

  return {
    scheduledCountdown,
    scheduleCall,
    cancelSchedule,
    coords,
    transcript,
    emergencyTriggered,
    alertDetails,
    startActiveCall,
    endActiveCall,
    executeEmergencyAlert,
    handleToolCall,
    triggerManually,
    gpsStatus,
    lastAlert,
  };
}
