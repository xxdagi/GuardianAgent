import pl from "./locales/pl.json";
import en from "./locales/en.json";
import type {
  ConversationScenario,
  Language,
  DefaultCallerOption,
  DefaultTopicOption,
} from "./types";

export type TranslationKey = keyof typeof pl;

export const translations = {
  pl,
  en,
};

export function getTranslation(
  lang: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = translations[lang][key] || translations.pl[key] || "";
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export const DEFAULT_CALLERS_PL: DefaultCallerOption[] = [
  { id: "mama", role: "Mama", callerName: "Mama", avatarText: "M" },
  { id: "chlopak", role: "Chłopak", callerName: "Piotrek ❤️", avatarText: "P" },
  { id: "brat", role: "Brat", callerName: "Kamil", avatarText: "K" },
  { id: "przyjaciolka", role: "Przyjaciółka", callerName: "Ania", avatarText: "A" },
];

export const DEFAULT_CALLERS_EN: DefaultCallerOption[] = [
  { id: "mama", role: "Mom", callerName: "Mom", avatarText: "M" },
  { id: "chlopak", role: "Boyfriend", callerName: "Piotrek ❤️", avatarText: "P" },
  { id: "brat", role: "Brother", callerName: "Brother", avatarText: "B" },
  { id: "przyjaciolka", role: "Best friend", callerName: "Ania", avatarText: "A" },
];

export const DEFAULT_TOPICS_PL: DefaultTopicOption[] = [
  {
    id: "day",
    title: "Jak minął ci dzień?",
    topics: "o samopoczucie, obiad, powrót do domu, czy nie jest zimno",
    greetingPl: "Cześć! Jak minął Ci dzisiejszy dzień? Gdzie teraz jesteś? Podgrzewam już obiad.",
    greetingEn: "Hi! How was your day? Where are you now? I'm already warming up dinner for you.",
  },
  {
    id: "work",
    title: "Jak w pracy?",
    topics: "o projekt w pracy, zmęczenie, plany na wieczór, wspólne gotowanie",
    greetingPl: "Hejka! Jak tam minął dzień w pracy? Skończyłeś już wszystko? Czekam na Ciebie z herbatą.",
    greetingEn: "Hey! How was work today? Are you on your way back? I just put the kettle on.",
  },
  {
    id: "school",
    title: "Jak w szkole / na uczelni?",
    topics: "o zajęcia, kolokwium, czy wracasz autobusem, klucze do mieszkania",
    greetingPl: "Siema! Jak poszło dzisiaj na zajęciach? Daleko masz jeszcze do domu? Czekam przy drzwiach.",
    greetingEn: "Hey! How did your classes go? Where are you right now? Let me know when you're outside.",
  },
];

export const DEFAULT_TOPICS_EN: DefaultTopicOption[] = [
  {
    id: "day",
    title: "How was your day?",
    topics: "well-being, dinner, coming home, weather",
    greetingPl: "Cześć! Jak minął Ci dzisiejszy dzień? Gdzie teraz jesteś? Podgrzewam już obiad.",
    greetingEn: "Hi! How was your day? Where are you now? I'm already warming up dinner for you.",
  },
  {
    id: "work",
    title: "How was work?",
    topics: "work project, commute, evening plans, dinner together",
    greetingPl: "Hejka! Jak tam minął dzień w pracy? Skończyłeś już wszystko? Czekam na Ciebie z herbatą.",
    greetingEn: "Hey! How was work today? Are you on your way back? I just put the kettle on.",
  },
  {
    id: "school",
    title: "How was school / university?",
    topics: "classes, exam results, bus ride, apartment keys",
    greetingPl: "Siema! Jak poszło dzisiaj na zajęciach? Daleko masz jeszcze do domu? Czekam przy drzwiach.",
    greetingEn: "Hey! How did your classes go? Where are you right now? Let me know when you're outside.",
  },
];

export function buildDefaultScenario(
  caller: DefaultCallerOption,
  topic: DefaultTopicOption,
  lang: Language
): ConversationScenario {
  return {
    id: `default_${caller.id}_${topic.id}`,
    title: topic.title,
    role: caller.role,
    callerName: caller.callerName,
    topics: topic.topics,
    isCustom: false,
    avatarText: caller.avatarText,
    initialGreeting: lang === "pl" ? topic.greetingPl : topic.greetingEn,
    deterrentResponse:
      lang === "pl"
        ? "Dobrze, to ja już zakładam buty i wychodzę przed klatkę, będę na dole za minutę!"
        : "Alright, I'm putting on my shoes and coming down to meet you outside right now!",
  };
}

export const DEFAULT_SCENARIOS_PL: ConversationScenario[] = [
  buildDefaultScenario(DEFAULT_CALLERS_PL[0], DEFAULT_TOPICS_PL[0], "pl"),
  buildDefaultScenario(DEFAULT_CALLERS_PL[1], DEFAULT_TOPICS_PL[1], "pl"),
  buildDefaultScenario(DEFAULT_CALLERS_PL[2], DEFAULT_TOPICS_PL[2], "pl"),
];

export const DEFAULT_SCENARIOS_EN: ConversationScenario[] = [
  buildDefaultScenario(DEFAULT_CALLERS_EN[0], DEFAULT_TOPICS_EN[0], "en"),
  buildDefaultScenario(DEFAULT_CALLERS_EN[1], DEFAULT_TOPICS_EN[1], "en"),
  buildDefaultScenario(DEFAULT_CALLERS_EN[2], DEFAULT_TOPICS_EN[2], "en"),
];
