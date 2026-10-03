// Types mirror contracts/bff.openapi.yaml. The frontend talks ONLY to the BFF.
export type Language = "pl" | "en";
export type AlertLevel = "alert" | "emergency";
export type AlertSource = "keyword" | "agent" | "manual";
export type DeliveryChannel = "mock" | "sms" | "voice" | "telegram";
export type DeliveryStatus = "sent" | "failed";
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

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

export interface AlertCreateRequest {
  sessionId: string;
  level: AlertLevel;
  source: AlertSource;
  language: Language;
  recipientName: string;
  recipientPhone: string;
  location: Location | null;
  triggerPhrase?: string;
  transcriptSnippet?: string;
}

export interface Delivery {
  channel: DeliveryChannel;
  status: DeliveryStatus;
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
  location: Location | null;
  deliveries: Delivery[];
  triggerPhrase?: string;
  transcriptSnippet?: string;
}

// Legacy item types/methods are kept for current UI compatibility.
export interface Item {
  id: string;
  name: string;
  createdAt: string;
}

interface ContractErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

function defaultErrorCode(status: number): ApiErrorCode | "UNKNOWN_ERROR" {
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 502) return "UPSTREAM_ERROR";
  if (status >= 500) return "INTERNAL_ERROR";
  return "UNKNOWN_ERROR";
}

async function parseJsonSafely(res: Response): Promise<unknown | null> {
  const raw = await res.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await parseJsonSafely(res);
  if (!res.ok) {
    const contractError = body as ContractErrorBody | null;
    const code = contractError?.error?.code ?? defaultErrorCode(res.status);
    const message = contractError?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, code, message, contractError?.error?.details);
  }

  if (body === null) {
    throw new ApiError(res.status, "INTERNAL_ERROR", "Invalid JSON response from API");
  }
  return body as T;
}

export const api = {
  createRealtimeSession: (payload: RealtimeSessionCreateRequest) =>
    request<RealtimeSessionResponse>("/realtime/session", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createAlert: (payload: AlertCreateRequest) =>
    request<AlertResponse>("/alerts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listAlerts: () => request<AlertListItem[]>("/alerts"),

  // Legacy item methods are kept for current UI compatibility.
  listItems: () => request<Item[]>("/items"),
  createItem: (name: string) =>
    request<Item>("/items", { method: "POST", body: JSON.stringify({ name }) }),
  getElevenLabsConfig: async (): Promise<{ agentId?: string; signedUrl?: string } | null> => {
    try {
      return await request<{ agentId?: string; signedUrl?: string }>("/elevenlabs/signed-url");
    } catch (err) {
      console.warn("Could not retrieve ElevenLabs config from BFF:", err);
      return null;
    }
  },
  getElevenLabsSignedUrl: async (): Promise<string | null> => {
    try {
      const data = await request<{ agentId?: string; signedUrl?: string }>("/elevenlabs/signed-url");
      return data.signedUrl ?? null;
    } catch (err) {
      console.warn("Could not retrieve ElevenLabs signed URL from BFF:", err);
      return null;
    }
  },
};


export const createRealtimeSession = api.createRealtimeSession;
export const createAlert = api.createAlert;
export const listAlerts = api.listAlerts;
export const getElevenLabsSignedUrl = api.getElevenLabsSignedUrl;

