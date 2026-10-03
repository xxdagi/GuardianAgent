import { useState, useEffect, useRef, useCallback } from "react";
import { api, type AlertListItem } from "../api";

export interface UseAlertsFeedResult {
  alerts: AlertListItem[];
  isLoading: boolean;
  error: string | null;
  hasNewAlert: boolean;
  acknowledgeNewAlert: () => void;
  refetch: () => Promise<void>;
  lastPolledAt: Date | null;
}

const POLL_INTERVAL_MS = 3000;

export function useAlertsFeed(): UseAlertsFeedResult {
  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);
  const isMountedRef = useRef<boolean>(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.listAlerts();
      if (!isMountedRef.current) return;

      // Sort newest first by createdAt DESC
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Detect newly arrived alerts (after initial load)
      if (!isInitialLoadRef.current) {
        const hasFresh = sorted.some((item) => !knownAlertIdsRef.current.has(item.id));
        if (hasFresh) {
          setHasNewAlert(true);
        }
      }

      // Update known IDs
      const currentIds = new Set<string>();
      sorted.forEach((item) => currentIds.add(item.id));
      knownAlertIdsRef.current = currentIds;

      setAlerts(sorted);
      setError(null);
      setLastPolledAt(new Date());
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to load alerts";
      setError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }, []);

  const acknowledgeNewAlert = useCallback(() => {
    setHasNewAlert(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAlerts();

    const intervalId = setInterval(() => {
      fetchAlerts();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    error,
    hasNewAlert,
    acknowledgeNewAlert,
    refetch: fetchAlerts,
    lastPolledAt,
  };
}
