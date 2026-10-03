import React, { useState } from "react";
import { Phone, CheckCircle2 } from "lucide-react";
import type { EmergencyContact, Language, Theme } from "../../types";
import { getTranslation } from "../../i18n";

interface EmergencyContactSectionProps {
  language: Language;
  theme: Theme;
  contact: EmergencyContact;
  onUpdateContact: (c: EmergencyContact) => void;
}

export const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  language,
  theme,
  contact,
  onUpdateContact,
}) => {
  const isDark = theme === "dark";
  const [contactName, setContactName] = useState(contact.name);
  const [contactPhone, setContactPhone] = useState(contact.phone);
  const [contactSaved, setContactSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContact({ name: contactName, phone: contactPhone });
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  return (
    <div
      className={`border-2 rounded-2xl p-4 mb-6 transition-all shadow-[0_2px_0_0_#c0d4ed] ${
        isDark ? "bg-[#18222e] border-[#9cadc0]/60" : "bg-[#f0f5fc]/70 border-[#9cadc0]/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-xs font-black text-[#1c2b39] dark:text-[#c0d4ed]">
          <Phone className="w-4 h-4 text-[#9cadc0] dark:text-[#c0d4ed]" />
          <span>{getTranslation(language, "contactTitle")}</span>
        </div>
        {contactSaved && (
          <span className="text-xs text-[#9cadc0] dark:text-[#c0d4ed] font-black flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {getTranslation(language, "contactSaved")}
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold block mb-1 text-[#1c2b39]/80 dark:text-[#c0d4ed]/80">
              {getTranslation(language, "contactName")}
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="np. Tomek"
              className={`w-full border-2 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold block mb-1 text-[#1c2b39]/80 dark:text-[#c0d4ed]/80">
              {getTranslation(language, "contactPhone")}
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+48 600 000 000"
              className={`w-full border-2 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#9cadc0] ${
                isDark ? "bg-[#0f1720] border-[#9cadc0]/50 text-[#c0d4ed]" : "bg-white border-[#9cadc0]/50 text-[#1c2b39]"
              }`}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-xs rounded-xl font-black transition-all bg-[#9cadc0] hover:bg-[#788a9e] text-white shadow-[0_2px_0_0_#788a9e] active:translate-y-0.5"
        >
          {getTranslation(language, "saveContactBtn")}
        </button>
      </form>
    </div>
  );
};
