import { describe, it, expect } from "vitest";
import { SpeechService } from "../services/speech";

describe("SpeechService", () => {
  it("initializes without throwing in non-browser environments", () => {
    const service = new SpeechService();
    expect(service).toBeDefined();
    service.setKeywords(["Kot", " PIZZA "]);
  });
});
