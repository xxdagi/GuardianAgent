import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import {
  backend,
  UpstreamError,
  type AlertCreateRequest,
  type AlertLevel,
  type AlertSource,
  type Language,
  type Location,
  type RealtimeSessionCreateRequest,
} from "./backendClient.js";
import { config } from "./config.js";

const apiError = (code: string, message: string, details: unknown = {}) => ({
  error: { code, message, details },
});

const isString = (value: unknown): value is string => typeof value === "string";
const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const isLanguage = (value: unknown): value is Language => value === "pl" || value === "en";
const isLevel = (value: unknown): value is AlertLevel => value === "alert" || value === "emergency";
const isSource = (value: unknown): value is AlertSource =>
  value === "keyword" || value === "agent" || value === "manual";
const isLocation = (value: unknown): value is Location =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { latitude?: unknown }).latitude === "number" &&
  typeof (value as { longitude?: unknown }).longitude === "number" &&
  typeof (value as { accuracy?: unknown }).accuracy === "number";
const isLocationOrNull = (value: unknown): value is Location | null => value === null || isLocation(value);

function readRealtimeSessionRequest(body: unknown): RealtimeSessionCreateRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const candidate = body as Record<string, unknown>;
  if (
    !isString(candidate.sessionId) ||
    !isLanguage(candidate.language) ||
    !isArrayOfStrings(candidate.alertPhrases) ||
    !isArrayOfStrings(candidate.emergencyPhrases)
  ) {
    return null;
  }
  return {
    sessionId: candidate.sessionId,
    language: candidate.language,
    alertPhrases: candidate.alertPhrases,
    emergencyPhrases: candidate.emergencyPhrases,
  };
}

function readAlertRequest(body: unknown): AlertCreateRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const candidate = body as Record<string, unknown>;
  if (
    !isString(candidate.sessionId) ||
    !isLevel(candidate.level) ||
    !isSource(candidate.source) ||
    (candidate.triggerPhrase !== undefined &&
      candidate.triggerPhrase !== null &&
      !isString(candidate.triggerPhrase)) ||
    !isLanguage(candidate.language) ||
    !isString(candidate.recipientName) ||
    !isString(candidate.recipientPhone) ||
    !Object.prototype.hasOwnProperty.call(candidate, "location") ||
    !isLocationOrNull(candidate.location) ||
    (candidate.transcriptSnippet !== undefined &&
      candidate.transcriptSnippet !== null &&
      !isString(candidate.transcriptSnippet))
  ) {
    return null;
  }
  return {
    sessionId: candidate.sessionId,
    level: candidate.level,
    source: candidate.source,
    triggerPhrase: candidate.triggerPhrase,
    language: candidate.language,
    recipientName: candidate.recipientName,
    recipientPhone: candidate.recipientPhone,
    location: candidate.location,
    transcriptSnippet: candidate.transcriptSnippet,
  };
}

function validationError(message: string) {
  return apiError("VALIDATION_ERROR", message);
}

function mapUpstreamError(err: UpstreamError) {
  const body = err.details as
    | { error?: { message?: string; details?: unknown } }
    | undefined;
  if (err.status === 422) {
    return {
      status: 400,
      payload: apiError(
        "VALIDATION_ERROR",
        body?.error?.message ?? "Invalid request",
        body?.error?.details ?? {},
      ),
    };
  }

  return {
    status: 502,
    payload: apiError("UPSTREAM_ERROR", err.message, err.details),
  };
}

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/realtime/session", async (req, res, next) => {
    const body = readRealtimeSessionRequest(req.body);
    if (!body) {
      res.status(400).json(validationError("Invalid realtime session request"));
      return;
    }
    try {
      res.status(201).json(await backend.createRealtimeSession(body));
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/alerts", async (req, res, next) => {
    const body = readAlertRequest(req.body);
    if (!body) {
      res.status(400).json(validationError("Invalid alert request"));
      return;
    }
    try {
      res.status(201).json(await backend.createAlert(body));
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/alerts", async (_req, res, next) => {
    try {
      res.json(await backend.listAlerts());
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/elevenlabs/signed-url", async (_req, res, next) => {
    try {
      if (!config.elevenLabsApiKey || !config.elevenLabsAgentId) {
        res.status(500).json(apiError("CONFIG_ERROR", "ElevenLabs credentials not configured"));
        return;
      }
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(config.elevenLabsAgentId)}`,
        {
          headers: {
            "xi-api-key": config.elevenLabsApiKey,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        res.status(502).json(apiError("UPSTREAM_ERROR", `ElevenLabs API error: ${response.status}`, { details: errorText }));
        return;
      }
      const data = (await response.json()) as { signed_url?: string };
      if (!data.signed_url) {
        res.status(502).json(apiError("UPSTREAM_ERROR", "Missing signed_url in ElevenLabs response"));
        return;
      }
      res.json({ signedUrl: data.signed_url });
    } catch (err) {
      next(err);
    }
  });

  app.use((_req, res) => {
    res.status(404).json(apiError("NOT_FOUND", "Route not found"));
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof UpstreamError) {
      const mapped = mapUpstreamError(err);
      res.status(mapped.status).json(mapped.payload);
      return;
    }

    console.error(err instanceof Error ? err.message : "Unknown error");
    res.status(500).json(apiError("INTERNAL_ERROR", "Internal server error"));
  });

  return app;
}
