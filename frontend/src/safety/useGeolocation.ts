import { useEffect, useRef, useState } from "react";
import type { Location } from "../api";

export type GpsStatus = "ok" | "denied" | "unavailable" | "pending";

export interface GeolocationHookResult {
  location: Location | null;
  gpsStatus: GpsStatus;
  locationRef: React.MutableRefObject<Location | null>;
}

/**
 * Continuous geolocation watcher hook:
 * - Uses navigator.geolocation.watchPosition with high accuracy
 * - Tracks latest coordinates in both state and a mutable ref
 * - Cleans up watchPosition on unmount
 */
export function useGeolocation(): GeolocationHookResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("pending");
  const locationRef = useRef<Location | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        locationRef.current = nextLocation;
        setLocation(nextLocation);
        setGpsStatus("ok");
      },
      (error) => {
        // Code 1 is PERMISSION_DENIED
        if (error.code === 1) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("unavailable");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, gpsStatus, locationRef };
}
