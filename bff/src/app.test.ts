import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";
import { backend } from "./backendClient.js";

describe("bff", () => {
  it("health", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.body).toEqual({ status: "ok" });
  });

  it("maps backend items to camelCase", async () => {
    vi.spyOn(backend, "listItems").mockResolvedValue([
      { id: "1", name: "a", created_at: "2026-01-01T00:00:00Z" },
    ]);
    const res = await request(createApp()).get("/api/items");
    expect(res.body).toEqual([{ id: "1", name: "a", createdAt: "2026-01-01T00:00:00Z" }]);
  });

  it("validates input", async () => {
    const res = await request(createApp()).post("/api/items").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
