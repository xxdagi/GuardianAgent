import { useState, useEffect } from "react";
import type {
  ConversationScenario,
  DefaultCallerOption,
  DefaultTopicOption,
  Language,
} from "../types";
import {
  DEFAULT_CALLERS_PL,
  DEFAULT_CALLERS_EN,
  DEFAULT_TOPICS_PL,
  DEFAULT_TOPICS_EN,
  buildDefaultScenario,
} from "../i18n";

const LOCAL_STORAGE_KEY = "guardian_agent_settings_v5";

export function useScenarios(language: Language) {
  const [defaultCallers, setDefaultCallers] = useState<DefaultCallerOption[]>(DEFAULT_CALLERS_PL);
  const [defaultTopics, setDefaultTopics] = useState<DefaultTopicOption[]>(DEFAULT_TOPICS_PL);
  const [selectedCaller, setSelectedCaller] = useState<DefaultCallerOption>(DEFAULT_CALLERS_PL[0]);
  const [selectedTopic, setSelectedTopic] = useState<DefaultTopicOption>(DEFAULT_TOPICS_PL[0]);
  const [customScenarios, setCustomScenarios] = useState<ConversationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario>(
    buildDefaultScenario(DEFAULT_CALLERS_PL[0], DEFAULT_TOPICS_PL[0], language)
  );

  // 1. Load saved scenarios from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customScenarios && Array.isArray(parsed.customScenarios)) {
          setCustomScenarios(parsed.customScenarios);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // 2. Persist custom scenarios to localStorage
  useEffect(() => {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      const payload = {
        ...parsed,
        customScenarios,
        selectedCallerId: selectedCaller.id,
        selectedTopicId: selectedTopic.id,
        selectedScenarioId: selectedScenario.id,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [customScenarios, selectedCaller, selectedTopic, selectedScenario]);

  // 3. Update default caller/topic options and scenario when language changes
  useEffect(() => {
    const callers = language === "pl" ? DEFAULT_CALLERS_PL : DEFAULT_CALLERS_EN;
    const topics = language === "pl" ? DEFAULT_TOPICS_PL : DEFAULT_TOPICS_EN;
    setDefaultCallers(callers);
    setDefaultTopics(topics);

    const callerMatch = callers.find((c) => c.id === selectedCaller.id) || callers[0];
    const topicMatch = topics.find((t) => t.id === selectedTopic.id) || topics[0];
    setSelectedCaller(callerMatch);
    setSelectedTopic(topicMatch);

    if (!selectedScenario.isCustom) {
      setSelectedScenario(buildDefaultScenario(callerMatch, topicMatch, language));
    }
  }, [language]);

  const selectDefaultCaller = (caller: DefaultCallerOption) => {
    setSelectedCaller(caller);
    const updated = buildDefaultScenario(caller, selectedTopic, language);
    setSelectedScenario(updated);
  };

  const selectDefaultTopic = (topic: DefaultTopicOption) => {
    setSelectedTopic(topic);
    const updated = buildDefaultScenario(selectedCaller, topic, language);
    setSelectedScenario(updated);
  };

  const selectCustomScenario = (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
  };

  const addCustomScenario = (scenario: ConversationScenario) => {
    setCustomScenarios((prev) => [scenario, ...prev]);
    setSelectedScenario(scenario);
  };

  const deleteCustomScenario = (id: string) => {
    setCustomScenarios((prev) => prev.filter((s) => s.id !== id));
    if (selectedScenario.id === id) {
      setSelectedScenario(buildDefaultScenario(selectedCaller, selectedTopic, language));
    }
  };

  return {
    defaultCallers,
    defaultTopics,
    selectedCaller,
    selectedTopic,
    customScenarios,
    selectedScenario,
    selectDefaultCaller,
    selectDefaultTopic,
    selectCustomScenario,
    addCustomScenario,
    deleteCustomScenario,
  };
}
