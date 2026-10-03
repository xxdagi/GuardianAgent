import { config } from "./config.js";

export type Language = "pl" | "en";
export type AlertLevel = "alert" | "emergency";
export type AlertSource = "keyword" | "agent" | "manual";

export interface RealtimeSessionCreateRequest {
  sessionId: string;
  language: Language;
  alertPhrases: string[];
  emergencyPhrases: string[];
}

export interface RealtimeSessionResponse {
  clientSecret: string;
  expiresAt: string;
  model: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AlertCreateRequest {
  sessionId: string;
  level: AlertLevel;
  source: AlertSource;
  triggerPhrase?: string | null;
  language: Language;
  recipientName: string;
  recipientPhone: string;
  location: Location | null;
  transcriptSnippet?: string | null;
}

export interface Delivery {
  channel: "mock" | "sms" | "voice" | "telegram";
  status: "sent" | "failed";
}

export interface AlertResponse {
  id: string;
  mapsUrl: string;
  deliveries: Delivery[];
  createdAt: string;
}

export interface AlertListItem {
  id: string;
  sessionId: string;
  createdAt: string;
  level: AlertLevel;
  source: AlertSource;
  triggerPhrase?: string | null;
  transcriptSnippet?: string | null;
  location: Location | null;
  deliveries: Delivery[];
}

interface BackendRealtimeSessionCreateRequest {
  session_id: string;
  language: Language;
  alert_phrases: string[];
  emergency_phrases: string[];
}

interface BackendRealtimeSessionResponse {
  client_secret: string;
  expires_at: string;
  model: string;
}

interface BackendAlertCreateRequest {
  session_id: string;
  level: AlertLevel;
  source: AlertSource;
  trigger_phrase?: string | null;
  language: Language;
  recipient_name: string;
  recipient_phone: string;
  location: Location | null;
  transcript_snippet?: string | null;
}

interface BackendDelivery {
  channel: Delivery["channel"];
  status: Delivery["status"];
}

interface BackendAlertResponse {
  id: string;
  maps_url: string;
  deliveries: BackendDelivery[];
  created_at: string;
}

interface BackendAlertListItem {
  id: string;
  session_id: string;
  created_at: string;
  level: AlertLevel;
  source: AlertSource;
  trigger_phrase?: string | null;
  transcript_snippet?: string | null;
  location: Location | null;
  deliveries: BackendDelivery[];
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    public status = 502,
    public details: unknown = {},
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.backendUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new UpstreamError("Backend unreachable");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new UpstreamError("Backend returned an error", res.status, body);
  }

  return (await res.json()) as T;
}

const toBackendRealtimeSessionCreateRequest = (
  req: RealtimeSessionCreateRequest,
): BackendRealtimeSessionCreateRequest => ({
  session_id: req.sessionId,
  language: req.language,
  alert_phrases: req.alertPhrases,
  emergency_phrases: req.emergencyPhrases,
});

const toRealtimeSessionResponse = (res: BackendRealtimeSessionResponse): RealtimeSessionResponse => ({
  clientSecret: res.client_secret,
  expiresAt: res.expires_at,
  model: res.model,
});

const toBackendAlertCreateRequest = (req: AlertCreateRequest): BackendAlertCreateRequest => ({
  session_id: req.sessionId,
  level: req.level,
  source: req.source,
  trigger_phrase: req.triggerPhrase,
  language: req.language,
  recipient_name: req.recipientName,
  recipient_phone: req.recipientPhone,
  location: req.location,
  transcript_snippet: req.transcriptSnippet,
});

const toAlertResponse = (res: BackendAlertResponse): AlertResponse => ({
  id: res.id,
  mapsUrl: res.maps_url,
  deliveries: res.deliveries.map((delivery) => ({
    channel: delivery.channel,
    status: delivery.status,
  })),
  createdAt: res.created_at,
});

const toAlertListItem = (alert: BackendAlertListItem): AlertListItem => ({
  id: alert.id,
  sessionId: alert.session_id,
  createdAt: alert.created_at,
  level: alert.level,
  source: alert.source,
  triggerPhrase: alert.trigger_phrase,
  transcriptSnippet: alert.transcript_snippet,
  location: alert.location,
  deliveries: alert.deliveries.map((delivery) => ({
    channel: delivery.channel,
    status: delivery.status,
  })),
});

export const backend = {
  createRealtimeSession: (req: RealtimeSessionCreateRequest) =>
    call<BackendRealtimeSessionResponse>("/api/v1/realtime/session", {
      method: "POST",
      body: JSON.stringify(toBackendRealtimeSessionCreateRequest(req)),
    }).then(toRealtimeSessionResponse),
  createAlert: (req: AlertCreateRequest) =>
    call<BackendAlertResponse>("/api/v1/alerts", {
      method: "POST",
      body: JSON.stringify(toBackendAlertCreateRequest(req)),
    }).then(toAlertResponse),
  listAlerts: () => call<BackendAlertListItem[]>("/api/v1/alerts").then((alerts) => alerts.map(toAlertListItem)),
};
