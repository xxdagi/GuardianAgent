# Day 2 Tasks - Guardian Agent

Context and decisions: [../PROJECT_PLAN.md](../PROJECT_PLAN.md) and [day-1.md](day-1.md).

Goal of Day 2: **Deliver a winning pitch and presentation with a polished, bulletproof live demo** (Live Dispatcher Dashboard on the projector, backup video, refined pitch deck, and strict code freeze).

Total Hackathon Duration: 22 h. Day 2 covers **H+11 to H+22** (11 hours).

---

## Timeline Overview

| Time Window | Focus | Output |
|-------------|-------|--------|
| **H+11 -> H+14** (3h) | **Feature Polish & Dispatcher Dashboard** | Live map screen for jury projector (`GET /api/alerts`) |
| **H+14 -> H+16** (2h) | **UI Polish, Audio Tuning & PWA** | Realistic mobile phone dialer styling, install prompt, sound feedback |
| **H+16 -> H+18** (2h) | **Pitch Deck & Storytelling** | 5-minute slide deck with problem, solution, tech stack, roadmap |
| **H+18 -> H+20** (2h) | **Code Freeze, Video Recording & Dry Runs** | 3 rehearsal passes, 60s backup demo video recorded |
| **H+20 -> H+22** (2h) | **Submission & Buffer** | Platform project submission, repo cleanup, zero secrets check |

---

## Area Breakdown for Day 2

### Person A - Call Experience & Mobile Polish

Owns: `frontend/src/` (mobile call experience, audio UX, PWA).

#### A9. Visual & Haptic Immersion (H+11 -> H+12:30)
- [ ] Add subtle call audio wave animation / pulsing halo when Mom is speaking.
- [ ] Refine incoming call ringtone and vibration sequence using Web Audio API / vibration API.
- [ ] Add realistic in-call keypad dial tones (DTMF sounds) if user clicks the keypad button.
- [ ] Polish Dark Mode aesthetics: realistic iOS/Android phone call screen styling (blurred translucent background, large call buttons).

#### A10. Mobile Web App / PWA Manifest (H+12:30 -> H+14:00)
- [ ] Add `manifest.json` with app icons, `display: standalone`, `theme_color: #121212`, `orientation: portrait`.
- [ ] Test "Add to Home Screen" on demo phone so the browser address bar is completely hidden during the live pitch.
- [ ] Ensure full screen layout uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

#### A11. Demo Flow Support & Rehearsals (H+14:00 -> H+20:00)
- [ ] Pair with Person C on live demo choreography.
- [ ] Verify instant fallback triggers (long press avatar for silent manual alert).
- [ ] Participate in 3 live rehearsals with the pitch speaker.

---

### Person B - Backend Reliability, Live Dispatcher & Continuous Tracking

Owns: `backend/`.

#### B7. Dispatcher Feed & Live Coordinates Endpoint (H+11 -> H+13:00)
- [ ] Ensure `GET /api/v1/alerts` supports sorting (latest first) and returns full metadata:
  - `id`, `session_id`, `created_at`, `level`, `source`, `trigger_phrase`, `transcript_snippet`, `location` (`latitude`, `longitude`, `accuracy`), `deliveries`.
- [ ] Add endpoint `POST /api/v1/alerts/{id}/location` to support breadcrumb tracking (updates coordinates every 10s if call stays active).
- [ ] Add tests in `backend/tests/test_api.py` for new routes and contract compliance.

#### B8. Error Resilience & Rate Limit Fine-Tuning (H+13:00 -> H+14:30)
- [ ] Add graceful fallback if OpenAI Realtime transiently disconnects (auto-recovery / reconnect).
- [ ] Protect Twilio / SMSAPI budget: ensure emergency deduplication window prevents spamming SMS credits.
- [ ] Verify mock provider can be toggled on-the-fly via `ALERT_PROVIDER=mock` if venue Wi-Fi blocks external telephony.

#### B9. Pitch Preparation & Technical Narrative (H+14:30 -> H+20:00)
- [ ] Draft architecture slide points: why WebRTC + ephemeral keys; latency advantage vs standard STT->LLM->TTS pipes; dual-layer safety detection.
- [ ] Support recording backup demo video (acting as backend monitor / logs verifier).

---

### Person C - Dispatcher Dashboard UI, Presentation & Submission

Owns: `contracts/`, `bff/`, Dispatcher Dashboard (`frontend/src/dispatcher/`), Project Submission.

#### C8. Dispatcher Dashboard for Jury (H+11 -> H+14:00)
- [ ] Add a dedicated web route `/dispatcher` (intended for laptop / secondary screen):
  - Live feed polling `GET /api/alerts` every 3-5 seconds.
  - Interactive map (Leaflet / OpenStreetMap or Google Maps embed) showing incident markers.
  - Incident card showing trigger phrase, timestamp, battery/GPS accuracy, and audio transcript snippet.
  - Audio/visual flashing badge when a new alert lands.
- **Done when:** On one screen you talk into the phone; on the laptop screen the incident pin appears in real-time.

#### C9. Pitch Deck & Presentation Structure (H+14:00 -> H+17:00)
- [ ] Prepare slide deck (Canva / Google Slides / Markdown presentation):
  1. **Hook & Problem:** Walking alone at night, fake phone call disguise, why manual SOS buttons fail.
  2. **Solution (Guardian Agent):** Voice-native disguise with "Mom", natural secret code phrases, silent dual-layer alert.
  3. **Live Demo:** The interactive simulation (Phone + Dispatcher screen).
  4. **Architecture & Innovation:** OpenAI Realtime over WebRTC, sub-second latency, ephemeral key security, pluggable dispatch (SMS / Twilio voice / Telegram).
  5. **Business & Impact:** B2C subscription, university campuses, city safety partnerships, native mobile app roadmap.
- [ ] Save deck as PDF backup on local disk.

#### C10. Backup Demo Video & Final Rehearsals (H+17:00 -> H+19:30)
- [ ] Record a clean 60-second screen-and-audio recording of the working demo:
  - Phone UI: accepting Mom's call, talking in Polish/English.
  - Saying the code phrase naturally.
  - Receiving phone getting the SMS with map link.
  - Dispatcher screen showing the live incident pin.
- [ ] Place video file in `docs/demo-backup.mp4` or upload to unlisted YouTube / Google Drive.

#### C11. Submission & Code Freeze (H+19:30 -> H+22:00)
- [ ] **Hard Code Freeze at H+20.** No new features, only emergency bug fixes.
- [ ] Run `make lint` and `make test` across all services.
- [ ] Verify `.env.example` has all needed keys with placeholder values.
- [ ] Prepare HackYeah platform project description, links, team info, and screenshots.
- [ ] Submit before deadline!
