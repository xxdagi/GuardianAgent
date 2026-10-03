import React, { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import type { Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface KeywordsSectionProps {
  language: Language;
  theme: Theme;
  keywords: string[];
  onAddKeyword: (kw: string) => void;
  onRemoveKeyword: (kw: string) => void;
}

export const KeywordsSection: React.FC<KeywordsSectionProps> = ({
  language,
  theme,
  keywords,
  onAddKeyword,
  onRemoveKeyword,
}) => {
  const isDark = theme === "dark";
  const [newKeyword, setNewKeyword] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      onAddKeyword(newKeyword.trim());
      setNewKeyword("");
    }
  };

  return (
    <div
      className={`border-2 rounded-2xl p-4 mb-6 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
        isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
      }`}
    >
      <div className="flex items-center space-x-2 text-xs font-black mb-1 text-[#1c2b39] dark:text-[#c0d4ed]">
        <AlertTriangle className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
        <span>{getTranslation(language, "keywordsTitle")}</span>
      </div>
      <p className="text-[11px] mb-3 font-medium text-[#1c2b39]/75 dark:text-[#c0d4ed]/70">
        {getTranslation(language, "keywordsDesc")}
      </p>

      {/* Existing keywords chips */}
      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black border-2 border-[#9cadc0] bg-[#c0d4ed]/50 text-[#1c2b39] dark:text-[#c0d4ed] shadow-[0_1px_0_0_#9cadc0]"
            >
              "{kw}"
              <button
                onClick={() => onRemoveKeyword(kw)}
                className="ml-1.5 p-0.5 hover:text-red-500 rounded-full transition-colors"
                aria-label={`Usuń ${kw}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div
          className={`p-3 rounded-xl border-2 border-dashed mb-3 text-center text-xs font-semibold ${
            isDark
              ? "bg-[#0f1720] border-[#9cadc0]/40 text-[#c0d4ed]/70"
              : "bg-white/80 border-[#9cadc0]/40 text-[#1c2b39]/70"
          }`}
        >
          {getTranslation(language, "noKeywordsYet")}
        </div>
      )}

      {/* Add keyword form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder={getTranslation(language, "addKeywordPlaceholder")}
          className={`flex-1 border-2 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
            isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
          }`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#9cadc0] hover:bg-[#788a9e] text-xs font-black text-white rounded-xl flex items-center transition-all shadow-[0_2px_0_0_#788a9e] active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-1" /> {getTranslation(language, "addBtn")}
        </button>
      </form>
    </div>
  );
};
