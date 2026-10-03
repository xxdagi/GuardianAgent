export type Language = "pl" | "en";
export type Theme = "dark" | "light";

export interface ConversationScenario {
  id: string;
  title: string;
  role: string;
  callerName: string;
  topics: string;
  isCustom: boolean;
  avatarText: string;
  initialGreeting: string;
  deterrentResponse: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface AlertPayload {
  contactName: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  triggerKeyword: string;
  transcriptSnippet: string;
  timestamp: string;
}

export type CallState = "idle" | "incoming" | "connected" | "ended";
export type ActiveView = "home" | "settings" | "conversations" | "add_conversation" | "incoming" | "connected" | "sms";

export interface DefaultCallerOption {
  id: string;
  role: string;
  callerName: string;
  avatarText: string;
}

export interface DefaultTopicOption {
  id: string;
  title: string;
  topics: string;
  greetingPl: string;
  greetingEn: string;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  keyword: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  recipient: string;
  success: boolean;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
  keywords: string[];
  callDelaySeconds: number;
  contact: EmergencyContact;
  selectedScenarioId: string;
  customScenarios: ConversationScenario[];
}
