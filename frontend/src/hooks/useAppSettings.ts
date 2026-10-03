import { useState, useEffect } from "react";
import type { Language, Theme, EmergencyContact } from "../types";

const LOCAL_STORAGE_KEY = "guardian_agent_settings_v5";

export function useAppSettings() {
  const [language, setLanguage] = useState<Language>("pl");
  const [theme, setTheme] = useState<Theme>("dark");
  const [callDelaySeconds, setCallDelaySeconds] = useState<number>(10);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [contact, setContact] = useState<EmergencyContact>({
    name: "",
    phone: "",
  });

  // 1. Load initial settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.callDelaySeconds) setCallDelaySeconds(parsed.callDelaySeconds);
        if (parsed.keywords && Array.isArray(parsed.keywords)) setKeywords(parsed.keywords);
        if (parsed.contact) setContact(parsed.contact);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // 2. Persist settings to localStorage
  useEffect(() => {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      const payload = {
        ...parsed,
        language,
        theme,
        callDelaySeconds,
        keywords,
        contact,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [language, theme, callDelaySeconds, keywords, contact]);

  // 3. Sync dark mode class with document root for Tailwind CSS and CSS variables
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const updateContact = (newContact: EmergencyContact) => {
    setContact({
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
    });
  };

  return {
    language,
    setLanguage,
    theme,
    setTheme,
    callDelaySeconds,
    setCallDelaySeconds,
    keywords,
    addKeyword,
    removeKeyword,
    contact,
    updateContact,
  };
}
