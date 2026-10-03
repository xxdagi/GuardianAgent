import { useState, useRef, useEffect } from "react";
import { speechService } from "../services/speech";
import { elevenLabsService } from "../services/elevenlabs";
import { geoService, type GeoCoordinates } from "../services/geolocation";
import { api } from "../api";
import type { ConversationScenario, EmergencyContact, Language, ActiveView } from "../types";

interface UseEmergencyCallParams {
  language: Language;
  selectedScenario: ConversationScenario;
  callDelaySeconds: number;
  keywords: string[];
  contact: EmergencyContact;
  onNavigate: (view: ActiveView) => void;
}

export function useEmergencyCall({
  language,
  selectedScenario,
  callDelaySeconds,
  keywords,
  contact,
  onNavigate,
}: UseEmergencyCallParams) {
  const [scheduledCountdown, setScheduledCountdown] = useState<number | null>(null);
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [transcript, setTranscript] = useState("");
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [alertDetails, setAlertDetails] = useState<{
    keyword: string;
    recipient: string;
    lat: number;
    lng: number;
  } | null>(null);

  const countdownTimerRef = useRef<any>(null);

  // 1. Sync keywords with speech service
  useEffect(() => {
    speechService.setKeywords(keywords);
  }, [keywords]);

  // 2. Continuous GPS tracking
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

  // Schedule call with countdown
  const scheduleCall = () => {
    if (scheduledCountdown !== null) return;

    setScheduledCountdown(callDelaySeconds);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setScheduledCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
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

  // Silent emergency dispatch
  const executeEmergencyAlert = async (detectedKeyword: string, textSnippet = "") => {
    if (emergencyTriggered) return;

    setEmergencyTriggered(true);

    const currentLocation = await geoService.getCurrentLocation();
    setCoords(currentLocation);

    const now = new Date();
    const recipientText =
      contact.name && contact.phone
        ? `${contact.name} (${contact.phone})`
        : contact.phone || contact.name || (language === "pl" ? "Zaufany kontakt / 112" : "Trusted Contact / 112");

    setAlertDetails({
      keyword: detectedKeyword,
      recipient: recipientText,
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
    });

    await api.sendAlert({
      contactName: contact.name || "Zaufany kontakt",
      contactPhone: contact.phone || "112",
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      triggerKeyword: detectedKeyword,
      transcriptSnippet: textSnippet || `Keyword triggered: ${detectedKeyword}`,
      timestamp: now.toISOString(),
    });

    speechService.speak(selectedScenario.deterrentResponse);
  };

  // Start active conversation
  const startActiveCall = async () => {
    cancelSchedule();
    onNavigate("connected");
    setEmergencyTriggered(false);
    setAlertDetails(null);
    setTranscript("");

    // Try starting ElevenLabs conversational agent
    const elevenLabsStarted = await elevenLabsService.startConversation({
      onTranscript: (line) => {
        setTranscript((prev) => (prev ? `${prev}\n${line}` : line));
      },
      onEmergencyTriggered: (reason) => {
        executeEmergencyAlert(reason);
      },
      onError: () => {
        // Fallback to local speech synthesis if ElevenLabs fails
        speechService.speak(selectedScenario.initialGreeting);
      },
    });

    if (!elevenLabsStarted) {
      // Fallback: Speak initial persona greeting via Web Speech API
      setTimeout(() => {
        speechService.speak(selectedScenario.initialGreeting);
      }, 600);
    }

    // Always run background speech recognition for local keywords
    speechService.startListening(
      (newTranscript) => {
        if (!elevenLabsStarted) {
          setTranscript(newTranscript);
        }
      },
      (detectedKeyword, fullText) => {
        executeEmergencyAlert(detectedKeyword, fullText);
      }
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
  };
}
