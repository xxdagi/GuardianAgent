export type Language = "pl" | "en";

export interface SafetySettings {
  language: Language;
  contactName: string;
  contactPhone: string;
  alertPhrases: string[];
  emergencyPhrases: string[];
  emergencyNumber: string;
}
