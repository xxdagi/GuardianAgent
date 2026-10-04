# Demo Script & Pitch Guide — Guardian Agent

HackYeah 2026 | Live Presentation & Demo Playbook

## Quick Start for Pitch

To start all services, ephemeral Cloudflare tunnel and generate the mobile QR code in a single command on Windows:

```powershell
.\start-pitch.ps1
```

To stop all services after the pitch:

```powershell
.\stop-pitch.ps1
```

---

## 1. Pitch Setup (Dual-Screen Setup)

- **Screen 1 (Presenter's Hand / Mobile):**
  - Smartphone connected via HTTPS tunnel running Guardian Agent as an installed PWA.
  - Earphone with microphone plugged in (isolates ambient hackathon noise).
  - Settings configured with:
    - Language: Polish (`pl`) or English (`en`).
    - Alert phrase: *"Czy nakarmiłaś kota?"* / *"Did you feed the cat?"*.
    - Emergency phrase: *"Zadzwoń do dziadka"* / *"Call grandpa"*.
    - Contact Phone: Teammate #2's phone number (verified in Twilio).
- **Screen 2 (Projector / Laptop):**
  - Web browser opened at `/dispatcher` displaying the live emergency incident map and real-time event feed.
- **Audience / Jury interaction:**
  - Teammate #2 stands next to the jury holding the receiving phone with sound turned on.

---

## 2. Live Demo Script (Step-by-Step, 3 Minutes)

### Act 1: The Problem & The Camouflage (0:00 - 1:00)
1. **Presenter:** "Imagine walking home alone late at night. You notice someone following you. Taking out your phone and desperately dialing emergency numbers or tapping panic buttons can escalate danger instantly if noticed. What do we naturally do? We fake a phone call."
2. **Action:** Presenter taps "Start Call" on the phone. The phone rings with "Mom" calling. Presenter answers.
3. **Presenter:** "Halo mamo, cześć! Wracam właśnie do domu."
4. **Mom (AI Agent via Google Gemini Flash + ElevenLabs voice):** "Cześć kochanie! Super, a którędy idziesz? Ciemno już na dworze."
5. **Presenter:** "Idę przez park, zaraz będę przy głównej ulicy."

### Act 2: Silent Alarm Trigger (1:00 - 1:45)
1. **Presenter:** Without breaking character, seamlessly integrates the secret alert code phrase:
   *"Mamo, a powiedz mi, czy nakarmiłaś dzisiaj kota przed wyjściem?"*
2. **What happens behind the scenes:**
   - **Frontend:** Instant keyword detector matches the code phrase + AI agent tool `trigger_alert` activates.
   - **GPS:** High-accuracy coordinates are bundled into a silent `POST /api/alerts` request.
   - **Mom:** Continues smoothly without pausing or revealing the alarm: *"Tak kochanie, nakarmiłam. Uważaj pod nogami i nie rozłączaj się."*
   - **Presenter's Phone:** Emits a single silent 200ms haptic vibration. The screen disguise remains unbroken.

### Act 3: Proof of Delivery & Dispatcher (1:45 - 2:30)
1. **Teammate #2 (Receiving Phone):** A loud SMS tone sounds. Teammate shows phone to jury:
   *"[Guardian Alert] Silent emergency signal received! Location: https://maps.google.com/?q=50.0647,19.9450"*.
2. **Laptop Projector (`/dispatcher`):**
   - The map centers on the presenter's coordinates.
   - A pulsing red incident marker appears with the exact time and transcript snippet.
3. **Presenter:** "My attacker heard nothing suspicious. But my trusted guardian has my exact live coordinates and knows I am in danger."

### Act 4: Level 2 & Wrap-up (2:30 - 3:00)
1. **Presenter:** "If the situation escalates further, Level 2 triggers an automated synthetic phone call to the contact, or one tap on the discreet SOS button opens native emergency dialing."
2. **Call to Action:** "Guardian Agent turns passive anxiety into active, AI-guided protection that stays invisible to threats."

---

## 3. Fallback & Redundancy Checklist

| Risk | Live Fallback Plan |
|------|--------------------|
| **Loud venue noise drowns microphone** | Presenter uses in-line headset mic. If speech recognition drops, secretly **long-press the Mom avatar for 2s** (hidden manual trigger fires the same alert). |
| **External network / telecom failure** | Backend relies strictly on `ALERT_PROVIDER=mock` (instant visual drop on Dispatcher dashboard, zero telecom dependencies). |
| **Complete internet failure** | Play pre-recorded 60-second backup video (`docs/demo-backup.mp4`) showing the live phone + SMS delivery. |
| **GPS denied on phone** | Alert sends with `location: null` and fallback message: *"Location unavailable - urgent assistance requested"*. |
