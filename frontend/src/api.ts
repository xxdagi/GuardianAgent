// Types mirror contracts/bff.openapi.yaml. The frontend talks ONLY to the BFF.
export interface Item {
  id: string;
  name: string;
  createdAt: string;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(body?.error.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

import type { AlertPayload } from "./types";

export const api = {
  listItems: () => request<Item[]>("/items"),
  createItem: (name: string) =>
    request<Item>("/items", { method: "POST", body: JSON.stringify({ name }) }),
  sendAlert: async (payload: AlertPayload): Promise<boolean> => {
    try {
      await request<unknown>("/alert", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return true;
    } catch (err) {
      console.warn("BFF alert endpoint not reachable, fallback to mock alert:", err);
      return false;
    }
  },
  getElevenLabsSignedUrl: async (): Promise<string | null> => {
    try {
      const data = await request<{ signedUrl: string }>("/elevenlabs/signed-url");
      return data.signedUrl;
    } catch (err) {
      console.warn("Could not retrieve ElevenLabs signed URL from BFF:", err);
      return null;
    }
  },
};

