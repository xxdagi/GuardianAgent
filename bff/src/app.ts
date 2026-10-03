import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { backend, UpstreamError, type BackendItem } from "./backendClient.js";
import { config } from "./config.js";

// Types mirror contracts/bff.openapi.yaml (camelCase).
interface Item {
  id: string;
  name: string;
  createdAt: string;
}

const toItem = (i: BackendItem): Item => ({ id: i.id, name: i.name, createdAt: i.created_at });

const apiError = (code: string, message: string, details: unknown = {}) => ({
  error: { code, message, details },
});

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/items", async (_req, res, next) => {
    try {
      res.json((await backend.listItems()).map(toItem));
    } catch (e) {
      next(e);
    }
  });

  app.post("/api/items", async (req, res, next) => {
    const name = req.body?.name;
    if (typeof name !== "string" || name.length < 1 || name.length > 200) {
      res.status(400).json(apiError("VALIDATION_ERROR", "name must be 1-200 characters"));
      return;
    }
    try {
      res.status(201).json(toItem(await backend.createItem(name)));
    } catch (e) {
      next(e);
    }
  });

  app.use((_req, res) => {
    res.status(404).json(apiError("NOT_FOUND", "Route not found"));
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof UpstreamError) {
      res.status(502).json(apiError("UPSTREAM_ERROR", err.message, err.details));
      return;
    }
    console.error(err instanceof Error ? err.message : "Unknown error");
    res.status(500).json(apiError("INTERNAL_ERROR", "Internal server error"));
  });

  return app;
}
