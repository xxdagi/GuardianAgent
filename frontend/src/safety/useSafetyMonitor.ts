import { useCallback, useRef, useState } from "react";
import {
  api,
  type AlertLevel,
  type AlertResponse,
  type AlertSource,
} from "../api";
import type { SafetySettings } from "../types/settings";
import { detect } from "./keywordDetector";
import { useGeolocation, type GpsStatus } from "./useGeolocation";

export interface SafetyMonitorHookResult {
  handleUserTranscript(text: string, isFinal: boolean): void;
  handleToolCall(name: string, args: unknown): void;
  triggerManually(level: "alert" | "emergency", triggerPhrase?: string): void;
  lastAlert: AlertResponse | null;
  gpsStatus: GpsStatus;
}

const COOLDOWN_MS = 30_000;
const MAX_BUFFER_LENGTH = 300;

export function useSafetyMonitor(
  settings: SafetySettings,
  sessionId: string,
): SafetyMonitorHookResult {
  const settingsRef = useRef<SafetySettings>(settings);
  settingsRef.current = settings;

  const sessionIdRef = useRef<string>(sessionId);
  sessionIdRef.current = sessionId;

  const { gpsStatus, locationRef } = useGeolocation();
  const [lastAlert, setLastAlert] = useState<AlertResponse | null>(null);

  const rollingBufferRef = useRef<string>("");
  const lastAlertTimeRef = useRef<{ alert: number; emergency: number }>({
    alert: 0,
    emergency: 0,
  });

  const dispatchAlert = useCallback(
    async (
      level: AlertLevel,
      source: AlertSource,
      triggerPhrase?: string,
      transcriptSnippet?: string,
    ): Promise<void> => {
      const now = Date.now();
      if (now - lastAlertTimeRef.current[level] < COOLDOWN_MS) {
        return;
      }
      lastAlertTimeRef.current[level] = now;

      const currentSettings = settingsRef.current;
      const currentSessionId = sessionIdRef.current;
      const loc = locationRef.current;

      const locationPayload =
        loc &&
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number"
          ? {
              latitude: loc.latitude,
              longitude: loc.longitude,
              accuracy: typeof loc.accuracy === "number" ? loc.accuracy : 15,
            }
          : null;

      try {
        const response = await api.createAlert({
          sessionId: currentSessionId,
          level,
          source,
          language: currentSettings.language,
          recipientName: currentSettings.contactName,
          recipientPhone: currentSettings.contactPhone,
          location: locationPayload,
          triggerPhrase,
          transcriptSnippet,
        });
        setLastAlert(response);
      } catch (error) {
        // Log safe message without customer phone or sensitive payload
        console.error(
          "Alert dispatch failed:",
          (error as Error)?.message ?? "Unknown error",
        );
      }
    },
    [locationRef],
  );

  const handleUserTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (!text || !text.trim()) {
        if (isFinal) {
          rollingBufferRef.current = "";
        }
        return;
      }

      const prev = rollingBufferRef.current;
      const spaceJoined =
        prev.length > 0 && !prev.endsWith(" ") && !text.startsWith(" ")
          ? `${prev} ${text}`
          : `${prev}${text}`;
      const directJoined = `${prev}${text}`;

      const match =
        detect(spaceJoined, settingsRef.current) ??
        detect(directJoined, settingsRef.current);

      if (match) {
        rollingBufferRef.current = "";
        void dispatchAlert(match.level, "keyword", match.phrase, spaceJoined);
      } else if (isFinal) {
        rollingBufferRef.current = "";
      } else {
        rollingBufferRef.current = spaceJoined.slice(-MAX_BUFFER_LENGTH);
      }
    },
    [dispatchAlert],
  );

  const handleToolCall = useCallback(
    (name: string, args: unknown) => {
      if (name !== "trigger_alert") {
        return;
      }

      let parsed: Record<string, unknown> | null = null;
      if (typeof args === "string") {
        try {
          parsed = JSON.parse(args) as Record<string, unknown>;
        } catch {
          return;
        }
      } else if (typeof args === "object" && args !== null) {
        parsed = args as Record<string, unknown>;
      } else {
        return;
      }

      const level = parsed.level;
      if (level !== "alert" && level !== "emergency") {
        return;
      }

      const triggerPhrase =
        typeof parsed.reason === "string" ? parsed.reason : undefined;
      void dispatchAlert(level, "agent", triggerPhrase);
    },
    [dispatchAlert],
  );

  const triggerManually = useCallback(
    (level: "alert" | "emergency", triggerPhrase?: string) => {
      if (level !== "alert" && level !== "emergency") {
        return;
      }
      void dispatchAlert(level, "manual", triggerPhrase);
    },
    [dispatchAlert],
  );

  return {
    handleUserTranscript,
    handleToolCall,
    triggerManually,
    lastAlert,
    gpsStatus,
  };
}
