import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

const mockFetchJson = (body: unknown, status = 200) => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("bff", () => {
  it("health", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("creates realtime session with camelCase to snake_case mapping", async () => {
    mockFetchJson(
      {
        client_secret: "ek_test",
        expires_at: "2026-10-03T20:16:00Z",
        model: "gpt-realtime-test",
      },
      201,
    );

    const res = await request(createApp()).post("/api/realtime/session").send({
      sessionId: "session-1",
      language: "pl",
      alertPhrases: ["czy nakarmiłaś kota"],
      emergencyPhrases: ["zadzwoń do dziadka"],
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      clientSecret: "ek_test",
      expiresAt: "2026-10-03T20:16:00Z",
      model: "gpt-realtime-test",
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/realtime/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          session_id: "session-1",
          language: "pl",
          alert_phrases: ["czy nakarmiłaś kota"],
          emergency_phrases: ["zadzwoń do dziadka"],
        }),
      }),
    );
  });

  it("maps backend realtime validation errors to 400", async () => {
    mockFetchJson(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: { errors: [{ loc: ["body"], msg: "bad", type: "value_error" }] },
        },
      },
      422,
    );

    const res = await request(createApp()).post("/api/realtime/session").send({
      sessionId: "session-1",
      language: "pl",
      alertPhrases: ["czy nakarmiłaś kota"],
      emergencyPhrases: ["zadzwoń do dziadka"],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid realtime session input", async () => {
    const res = await request(createApp()).post("/api/realtime/session").send({
      sessionId: "session-1",
      language: "de",
      alertPhrases: [],
      emergencyPhrases: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("maps realtime session upstream errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));
    const res = await request(createApp()).post("/api/realtime/session").send({
      sessionId: "session-1",
      language: "pl",
      alertPhrases: ["czy nakarmiłaś kota"],
      emergencyPhrases: ["zadzwoń do dziadka"],
    });

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });

  it("creates alerts with optional triggerPhrase and null location", async () => {
    mockFetchJson(
      {
        id: "alert-1",
        maps_url: "https://maps.google.com/?q=50.064700,19.945000",
        deliveries: [{ channel: "sms", status: "sent" }],
        created_at: "2026-10-03T20:15:00Z",
      },
      201,
    );

    const res = await request(createApp()).post("/api/alerts").send({
      sessionId: "session-1",
      level: "alert",
      source: "manual",
      language: "pl",
      recipientName: "Ania",
      recipientPhone: "+48123456789",
      location: null,
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: "alert-1",
      mapsUrl: "https://maps.google.com/?q=50.064700,19.945000",
      deliveries: [{ channel: "sms", status: "sent" }],
      createdAt: "2026-10-03T20:15:00Z",
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/alerts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          session_id: "session-1",
          level: "alert",
          source: "manual",
          language: "pl",
          recipient_name: "Ania",
          recipient_phone: "+48123456789",
          location: null,
        }),
      }),
    );
  });

  it("maps alerts backend validation errors to 400", async () => {
    mockFetchJson(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: { errors: [{ loc: ["body"], msg: "bad", type: "value_error" }] },
        },
      },
      422,
    );

    const res = await request(createApp()).post("/api/alerts").send({
      sessionId: "session-1",
      level: "alert",
      source: "manual",
      language: "pl",
      recipientName: "Ania",
      recipientPhone: "+48123456789",
      location: null,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("maps alert request with triggerPhrase and location", async () => {
    mockFetchJson(
      {
        id: "alert-2",
        maps_url: "https://maps.google.com/?q=50.064700,19.945000",
        deliveries: [
          { channel: "sms", status: "sent" },
          { channel: "voice", status: "failed" },
        ],
        created_at: "2026-10-03T20:15:00Z",
      },
      201,
    );

    const res = await request(createApp()).post("/api/alerts").send({
      sessionId: "session-2",
      level: "emergency",
      source: "agent",
      triggerPhrase: "zadzwoń do dziadka",
      language: "en",
      recipientName: "John",
      recipientPhone: "+44123456789",
      location: { latitude: 50.0647, longitude: 19.945, accuracy: 12.5 },
      transcriptSnippet: "call grandpa",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: "alert-2",
      mapsUrl: "https://maps.google.com/?q=50.064700,19.945000",
      deliveries: [
        { channel: "sms", status: "sent" },
        { channel: "voice", status: "failed" },
      ],
      createdAt: "2026-10-03T20:15:00Z",
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/alerts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          session_id: "session-2",
          level: "emergency",
          source: "agent",
          trigger_phrase: "zadzwoń do dziadka",
          language: "en",
          recipient_name: "John",
          recipient_phone: "+44123456789",
          location: { latitude: 50.0647, longitude: 19.945, accuracy: 12.5 },
          transcript_snippet: "call grandpa",
        }),
      }),
    );
  });

  it("rejects invalid alert input", async () => {
    const res = await request(createApp()).post("/api/alerts").send({
      sessionId: "session-1",
      level: "invalid",
      source: "manual",
      language: "pl",
      recipientName: "Ania",
      recipientPhone: "+48123456789",
      location: null,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("maps alert upstream errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));
    const res = await request(createApp()).post("/api/alerts").send({
      sessionId: "session-1",
      level: "alert",
      source: "manual",
      language: "pl",
      recipientName: "Ania",
      recipientPhone: "+48123456789",
      location: null,
    });

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });

  it("lists alerts with snake_case to camelCase mapping", async () => {
    mockFetchJson([
      {
        id: "alert-1",
        session_id: "session-1",
        created_at: "2026-10-03T20:15:00Z",
        level: "alert",
        source: "keyword",
        trigger_phrase: "czy nakarmiłaś kota",
        transcript_snippet: "a powiedz, czy nakarmiłaś kota",
        location: { latitude: 50.0647, longitude: 19.945, accuracy: 12.5 },
        deliveries: [{ channel: "sms", status: "sent" }],
        language: "pl",
        recipient_name: "Ania",
        recipient_phone: "+48123456789",
        maps_url: "https://maps.google.com/?q=50.064700,19.945000",
      },
    ]);

    const res = await request(createApp()).get("/api/alerts");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: "alert-1",
        sessionId: "session-1",
        createdAt: "2026-10-03T20:15:00Z",
        level: "alert",
        source: "keyword",
        triggerPhrase: "czy nakarmiłaś kota",
        transcriptSnippet: "a powiedz, czy nakarmiłaś kota",
        location: { latitude: 50.0647, longitude: 19.945, accuracy: 12.5 },
        deliveries: [{ channel: "sms", status: "sent" }],
      },
    ]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/alerts",
      expect.any(Object),
    );
    expect(res.body[0]).not.toHaveProperty("language");
    expect(res.body[0]).not.toHaveProperty("recipientName");
    expect(res.body[0]).not.toHaveProperty("recipientPhone");
    expect(res.body[0]).not.toHaveProperty("mapsUrl");
  });

  it("maps alert list upstream errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));
    const res = await request(createApp()).get("/api/alerts");

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("UPSTREAM_ERROR");
  });

  it("returns 500 when ElevenLabs credentials are not configured", async () => {
    const res = await request(createApp()).get("/api/elevenlabs/signed-url");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("CONFIG_ERROR");
  });

  it("fetches signed-url when ElevenLabs credentials are set", async () => {
    const { config } = await import("./config.js");
    config.elevenLabsApiKey = "test-api-key";
    config.elevenLabsAgentId = "test-agent-id";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ signed_url: "wss://api.elevenlabs.io/test-signed-url" }),
    } as unknown as Response);

    const res = await request(createApp()).get("/api/elevenlabs/signed-url");
    expect(res.status).toBe(200);
    expect(res.body.signedUrl).toBe("wss://api.elevenlabs.io/test-signed-url");

    config.elevenLabsApiKey = "";
    config.elevenLabsAgentId = "";
  });
});
