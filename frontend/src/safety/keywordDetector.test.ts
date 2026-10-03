import { describe, expect, it } from "vitest";
import type { SafetySettings } from "../types/settings";
import { detect } from "./keywordDetector";

const baseSettings: SafetySettings = {
  language: "pl",
  contactName: "Ania",
  contactPhone: "+48123456789",
  alertPhrases: ["czy nakarmiłaś kota"],
  emergencyPhrases: ["zadzwoń do dziadka"],
  emergencyNumber: "+48987654321",
};

describe("keywordDetector (C4)", () => {
  it("matches uppercase and lowercase variants", () => {
    const result = detect("CZY NAKARMIŁAŚ KOTA?", baseSettings);
    expect(result).toEqual({
      level: "alert",
      phrase: "czy nakarmiłaś kota",
    });
  });

  it("matches Polish diacritics regardless of whether diacritics are used in transcript or settings", () => {
    // Transcript without diacritics
    const res1 = detect("czy nakarmilas kota", baseSettings);
    expect(res1).toEqual({
      level: "alert",
      phrase: "czy nakarmiłaś kota",
    });

    // Settings without diacritics, transcript with diacritics
    const settingsNoDiacritics: SafetySettings = {
      ...baseSettings,
      alertPhrases: ["nakarmilas kota"],
    };
    const res2 = detect("hej nakarmiłaś kota", settingsNoDiacritics);
    expect(res2).toEqual({
      level: "alert",
      phrase: "nakarmilas kota",
    });
  });

  it("handles Polish ł/Ł correctly", () => {
    const res1 = detect("ZADZWOŃ DO DZIADKA", baseSettings);
    expect(res1).toEqual({
      level: "emergency",
      phrase: "zadzwoń do dziadka",
    });

    const res2 = detect("zadzwon do dziadka", baseSettings);
    expect(res2).toEqual({
      level: "emergency",
      phrase: "zadzwoń do dziadka",
    });
  });

  it("detects phrase inside a complex sentence", () => {
    const text =
      "Cześć mamo, wszystko w porządku, a powiedz mi czy nakarmiłaś kota dzisiaj rano?";
    const result = detect(text, baseSettings);
    expect(result).toEqual({
      level: "alert",
      phrase: "czy nakarmiłaś kota",
    });
  });

  it("prioritizes emergency over alert when both appear", () => {
    const text =
      "Czy nakarmiłaś kota, a przy okazji zadzwoń do dziadka natychmiast";
    const result = detect(text, baseSettings);
    expect(result).toEqual({
      level: "emergency",
      phrase: "zadzwoń do dziadka",
    });
  });

  it("does not match partial word fragments (no false positives)", () => {
    const settingsWithShortWords: SafetySettings = {
      ...baseSettings,
      alertPhrases: ["kot"],
    };

    expect(detect("Lubię jeść kotlety schabowe", settingsWithShortWords)).toBeNull();
    expect(detect("Musimy to ukotwic w ziemi", settingsWithShortWords)).toBeNull();
    expect(detect("To jest mój mały kotek", settingsWithShortWords)).toBeNull();
    expect(detect("To jest mój mały kot!", settingsWithShortWords)).toEqual({
      level: "alert",
      phrase: "kot",
    });
  });

  it("returns null for empty or whitespace phrases in settings", () => {
    const emptySettings: SafetySettings = {
      ...baseSettings,
      alertPhrases: ["", "   "],
      emergencyPhrases: ["", "  \t "],
    };

    expect(detect("dowolny tekst użytkownika", emptySettings)).toBeNull();
  });

  it("detects English phrases correctly", () => {
    const enSettings: SafetySettings = {
      language: "en",
      contactName: "Mom",
      contactPhone: "+1234567890",
      alertPhrases: ["did you feed the cat"],
      emergencyPhrases: ["call grandpa"],
      emergencyNumber: "+1987654321",
    };

    expect(detect("Hey, did you feed the cat today?", enSettings)).toEqual({
      level: "alert",
      phrase: "did you feed the cat",
    });

    expect(detect("Please call grandpa immediately!", enSettings)).toEqual({
      level: "emergency",
      phrase: "call grandpa",
    });
  });

  it("matches phrases even when punctuation appears between words", () => {
    const res1 = detect("Czy, nakarmiłaś... kota?!", baseSettings);
    expect(res1).toEqual({
      level: "alert",
      phrase: "czy nakarmiłaś kota",
    });

    const res2 = detect("Zadzwoń - do - dziadka!", baseSettings);
    expect(res2).toEqual({
      level: "emergency",
      phrase: "zadzwoń do dziadka",
    });
  });

  it("preserves original phrase from settings in returned match", () => {
    const customSettings: SafetySettings = {
      ...baseSettings,
      emergencyPhrases: ["Zadzwoń DO Dziadka!"],
    };
    const res = detect("prosze zadzwon do dziadka", customSettings);
    expect(res).toEqual({
      level: "emergency",
      phrase: "Zadzwoń DO Dziadka!",
    });
  });

  it("detects 'czerwony' and its Polish declensions", () => {
    const settingsWithRed: SafetySettings = {
      ...baseSettings,
      alertPhrases: ["czerwony"],
    };

    expect(detect("czerwony", settingsWithRed)).toEqual({
      level: "alert",
      phrase: "czerwony",
    });

    expect(detect("widzę czerwony samochód", settingsWithRed)).toEqual({
      level: "alert",
      phrase: "czerwony",
    });

    expect(detect("mam na sobie czerwoną bluzę", settingsWithRed)).toEqual({
      level: "alert",
      phrase: "czerwony",
    });

    expect(detect("to jest czerwone auto", settingsWithRed)).toEqual({
      level: "alert",
      phrase: "czerwony",
    });
  });
});
