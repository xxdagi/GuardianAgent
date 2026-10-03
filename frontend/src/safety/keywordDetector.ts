import type { SafetySettings } from "../types/settings";
import { normalizeText } from "./normalize";

export interface DetectedKeyword {
  level: "alert" | "emergency";
  phrase: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesWholeWords(normalizedText: string, normalizedPhrase: string): boolean {
  if (!normalizedPhrase) {
    return false;
  }
  const escaped = escapeRegex(normalizedPhrase);
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
  if (regex.test(normalizedText)) {
    return true;
  }
  // Polish declensions of 'czerwony' (czerwona, czerwone, czerwoną, czerwonym, etc.)
  if (normalizedPhrase.startsWith("czerwon")) {
    const stemRegex = /(^|\s)czerwon[a-z0-9]*(\s|$)/;
    if (stemRegex.test(normalizedText)) {
      return true;
    }
  }
  return false;
}

/**
 * Pure function detecting secret trigger phrases in spoken/transcribed text.
 * Emergency level takes precedence over alert level.
 * Both text and target phrases are normalized before whole-word matching.
 */
export function detect(
  text: string,
  settings: SafetySettings,
): DetectedKeyword | null {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    return null;
  }

  // 1. Emergency phrases take precedence over alert phrases
  for (const phrase of settings.emergencyPhrases ?? []) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) {
      continue;
    }
    if (matchesWholeWords(normalizedText, normalizedPhrase)) {
      return { level: "emergency", phrase };
    }
  }

  // 2. Alert phrases
  for (const phrase of settings.alertPhrases ?? []) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) {
      continue;
    }
    if (matchesWholeWords(normalizedText, normalizedPhrase)) {
      return { level: "alert", phrase };
    }
  }

  return null;
}
