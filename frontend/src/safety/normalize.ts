/**
 * Normalizes text for safety keyword detection:
 * - lowercase
 * - manual handling of Polish ł/Ł -> l
 * - removes Polish diacritics using Unicode NFD decomposition
 * - removes punctuation by replacing it with spaces (avoids joining adjacent words)
 * - reduces multiple whitespace characters to single spaces
 * - trims leading and trailing whitespace
 */
export function normalizeText(text: string): string {
  if (!text) {
    return "";
  }

  let normalized = text.toLowerCase();
  normalized = normalized.replace(/[łŁ]/g, "l");
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.replace(/[^a-z0-9\s]/g, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}
