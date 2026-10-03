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

export function getDefaultCallers(lang: Language): DefaultCallerOption[] {
  return [
    {
      id: "mama",
      role: getTranslation(lang, "callerMamaRole"),
      callerName: getTranslation(lang, "callerMamaName"),
      avatarText: "M",
    },
    {
      id: "chlopak",
      role: getTranslation(lang, "callerBoyfriendRole"),
      callerName: getTranslation(lang, "callerBoyfriendName"),
      avatarText: "P",
    },
    {
      id: "brat",
      role: getTranslation(lang, "callerBrotherRole"),
      callerName: getTranslation(lang, "callerBrotherName"),
      avatarText: lang === "pl" ? "K" : "B",
    },
    {
      id: "przyjaciolka",
      role: getTranslation(lang, "callerFriendRole"),
      callerName: getTranslation(lang, "callerFriendName"),
      avatarText: "A",
    },
  ];
}

export function getDefaultTopics(lang: Language): DefaultTopicOption[] {
  return [
    {
      id: "day",
      title: getTranslation(lang, "topicDayTitle"),
      topics: getTranslation(lang, "topicDayDesc"),
      greetingPl: getTranslation("pl", "topicDayGreeting"),
      greetingEn: getTranslation("en", "topicDayGreeting"),
    },
    {
      id: "work",
      title: getTranslation(lang, "topicWorkTitle"),
      topics: getTranslation(lang, "topicWorkDesc"),
      greetingPl: getTranslation("pl", "topicWorkGreeting"),
      greetingEn: getTranslation("en", "topicWorkGreeting"),
    },
    {
      id: "school",
      title: getTranslation(lang, "topicSchoolTitle"),
      topics: getTranslation(lang, "topicSchoolDesc"),
      greetingPl: getTranslation("pl", "topicSchoolGreeting"),
      greetingEn: getTranslation("en", "topicSchoolGreeting"),
    },
  ];
}

export const DEFAULT_CALLERS_PL: DefaultCallerOption[] = getDefaultCallers("pl");
export const DEFAULT_CALLERS_EN: DefaultCallerOption[] = getDefaultCallers("en");

export const DEFAULT_TOPICS_PL: DefaultTopicOption[] = getDefaultTopics("pl");
export const DEFAULT_TOPICS_EN: DefaultTopicOption[] = getDefaultTopics("en");

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
    deterrentResponse: getTranslation(lang, "defaultDeterrentResponse"),
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
