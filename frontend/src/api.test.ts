import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  api,
  type AlertCreateRequest,
  type AlertListItem,
  type AlertResponse,
  type RealtimeSessionCreateRequest,
  type RealtimeSessionResponse,
} from "./api";

function mockFetchJson(body: unknown, status = 200): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("frontend api client (C3)", () => {
  it("createRealtimeSession sends POST /api/realtime/session and returns typed camelCase response", async () => {
    const payload: RealtimeSessionCreateRequest = {
      sessionId: "session-1",
      language: "pl",
      alertPhrases: ["czy nakarmiłaś kota"],
      emergencyPhrases: ["zadzwoń do dziadka"],
    };
    const backendResponse: RealtimeSessionResponse = {
      clientSecret: "ek_test_secret",
      expiresAt: "2026-10-03T20:15:00Z",
      model: "gpt-realtime-mini",
    };
    mockFetchJson(backendResponse, 201);

    const result = await api.createRealtimeSession(payload);

    expect(result).toEqual(backendResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/realtime/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("createAlert sends POST /api/alerts and returns typed response", async () => {
    const payload: AlertCreateRequest = {
      sessionId: "session-2",
      level: "alert",
      source: "keyword",
      language: "en",
      recipientName: "Mom",
      recipientPhone: "+48123456789",
      location: null,
      transcriptSnippet: "Please call me back",
    };
    const alertResponse: AlertResponse = {
      id: "alert-1",
      mapsUrl: "https://maps.google.com/?q=52.406374,16.925168",
      deliveries: [{ channel: "mock", status: "sent" }],
      createdAt: "2026-10-03T20:20:00Z",
    };
    mockFetchJson(alertResponse, 201);

    const result = await api.createAlert(payload);

    expect(result).toEqual(alertResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/alerts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("listAlerts sends GET /api/alerts and returns typed list", async () => {
    const alerts: AlertListItem[] = [
      {
        id: "alert-1",
        sessionId: "session-1",
        createdAt: "2026-10-03T20:20:00Z",
        level: "alert",
        source: "keyword",
        location: null,
        deliveries: [{ channel: "mock", status: "sent" }],
      },
    ];
    mockFetchJson(alerts, 200);

    const result = await api.listAlerts();

    expect(result).toEqual(alerts);
    const [path, options] = vi.mocked(globalThis.fetch).mock.calls[0] ?? [];
    expect(path).toBe("/api/alerts");
    expect(options).toEqual(expect.any(Object));
    expect(options?.method ?? "GET").toBe("GET");
  });

  it("maps 400 VALIDATION_ERROR into ApiError with status/code/message", async () => {
    mockFetchJson(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid realtime session request",
          details: { errors: [{ field: "language" }] },
        },
      },
      400,
    );

    const promise = api.createRealtimeSession({
      sessionId: "session-1",
      language: "pl",
      alertPhrases: ["a"],
      emergencyPhrases: ["b"],
    });

    await expect(promise).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid realtime session request",
    });
  });

  it("maps 502 UPSTREAM_ERROR into ApiError", async () => {
    mockFetchJson(
      {
        error: {
          code: "UPSTREAM_ERROR",
          message: "Backend unreachable",
          details: {},
        },
      },
      502,
    );

    const promise = api.listAlerts();

    await expect(promise).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      code: "UPSTREAM_ERROR",
      message: "Backend unreachable",
    });
  });

  it("handles malformed non-JSON error responses safely", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream gateway failed", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const promise = api.listAlerts();

    await expect(promise).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      code: "UPSTREAM_ERROR",
      message: "Request failed (502)",
    });
  });

  it("never calls backend /api/v1 paths", async () => {
    mockFetchJson([], 200);

    await api.listAlerts();

    const [firstCallPath] = vi.mocked(globalThis.fetch).mock.calls[0] ?? [];
    expect(firstCallPath).toBe("/api/alerts");
    expect(String(firstCallPath)).not.toContain("/api/v1");
  });
});
