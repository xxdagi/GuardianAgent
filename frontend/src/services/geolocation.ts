export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export class GeoService {
  private watchId: number | null = null;
  private lastPosition: GeoCoordinates | null = null;

  public startTracking(onUpdate?: (coords: GeoCoordinates) => void) {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      console.warn("Geolocation not supported on this browser.");
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.lastPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        if (onUpdate) {
          onUpdate(this.lastPosition);
        }
      },
      (error) => {
        console.warn("Geolocation watch error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  }

  public stopTracking() {
    if (this.watchId !== null && typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public async getCurrentLocation(): Promise<GeoCoordinates> {
    if (this.lastPosition) {
      return this.lastPosition;
    }

    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        // Fallback placeholder (e.g. Krakow Main Square for HackYeah demo)
        resolve({ latitude: 50.0617, longitude: 19.9373, accuracy: 25 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          this.lastPosition = coords;
          resolve(coords);
        },
        () => {
          // Fallback if permission denied
          resolve({ latitude: 50.0617, longitude: 19.9373, accuracy: 25 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }
}

export const geoService = new GeoService();
