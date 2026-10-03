# Day 1 Tasks - Guardian Agent

Context and decisions: [../PROJECT_PLAN.md](../PROJECT_PLAN.md). Read it first (10 min).

Goal of day 1: **a working end-to-end demo on a real phone.** You have a fake call with "Mom" (OpenAI Realtime voice, PL/EN). When you say a code phrase, the trusted contact silently gets an SMS with a Google Maps link, and the call continues.

Times are relative to the start of coding (H+0) and are estimates. Do tasks **in order** - each one builds on the previous one. Tick the boxes as you go.

Rules for everyone (from [AGENTS.md](../../AGENTS.md)):
- Branch per task group: `feat/<service>-<topic>`, small PRs, merge often.
- Contract first: any API change -> `contracts/*.yaml` first, tell the team.
- No secrets in code, commits or chat. New env vars go to `.env.example` with placeholder values. The OpenAI ephemeral key (`ek_...`) is also a secret - never log it.
- `make test` green before every merge.

---

## Team kickoff (all 3) - H+0 to H+0:45

- [ ] Everyone: `make setup`, `make test` green, apps start locally (see [SETUP.md](../SETUP.md)).
- [ ] Read the decisions log ([PROJECT_PLAN section 7](../PROJECT_PLAN.md#7-decisions-log)) - OpenAI Realtime, PL/EN, Mom, Guardian Agent.
- [ ] Agree on the `SafetySettings` type, the `useSafetyMonitor` hook and the `api.ts` signatures ([PROJECT_PLAN sections 5.4 and 6](../PROJECT_PLAN.md#54-shared-frontend-type-agreed-at-h0-owned-by-person-a)).
- [ ] Pick the default code phrases in both languages (natural-sounding, rare in normal speech, 3+ words).
- [ ] OpenAI: one person creates/uses the project API key, **sets a monthly spend limit**, and shares the key privately (password manager / direct message - never in git or a group chat log).
- [ ] Person C writes the contracts (task C1) while A and B start; all 3 review the contract PR (~15 min).

---

## Person A - Call Experience (frontend UI + Realtime WebRTC client)

Owns: `frontend/src/` (except `safety/` and `api.ts`). Branches: `feat/frontend-call-ui`, `feat/frontend-realtime`.

### A1. App shell and phone layout - H+0:45 -> H+1:30
- [ ] Remove the starter `ItemsPage` usage from `App.tsx` (leave `api.ts` alone - C owns it).
- [ ] Mobile-first layout: full-height portrait view (`100dvh`), max width ~430 px centered on desktop (phone frame look), dark theme like a native call app.
- [ ] Simple screen switch with `useState` (no router library): `setup` -> `home` -> `incoming` -> `call`.
- [ ] `frontend/src/i18n.ts`: tiny `{ pl: {...}, en: {...} }` dictionary + `t(key)` helper for UI labels.
- **Done when:** you can click through placeholder screens in both languages on a phone-sized viewport.

### A2. Settings screen - H+1:30 -> H+2:15
- [ ] `frontend/src/types/settings.ts` with the agreed `SafetySettings` type + defaults per language.
- [ ] Form: language (PL/EN), contact name, contact phone (hint: must be verified in the Twilio trial), alert phrases, emergency phrases (comma separated), emergency number (hint: "teammate's number, not 112").
- [ ] `useSettings()` hook: load/save in `localStorage`. The first launch goes to setup, later launches go to home.
- **Done when:** settings survive a page reload.

### A3. Home + incoming call + active call UI - H+2:15 -> H+3:15
- [ ] Home: big "Start call" button (the user gesture that unlocks mic + audio playback).
- [ ] Incoming call screen: "Mom" / "Mama", avatar, accept/decline, optional ringtone + vibration.
- [ ] Active call screen: avatar, name, running timer (mm:ss), fake buttons (mute, speaker, keypad), red hang-up button, small **SOS** button (`tel:` + emergency number).
- [ ] Connection states: "connecting...", "connected", "call failed - retry".
- **Done when:** the flow looks like a real phone call. Take a screenshot for the pitch.

### A4. Realtime WebRTC hook - H+3:15 -> H+5:15
Docs: [Realtime WebRTC guide](https://platform.openai.com/docs/guides/realtime-webrtc), [conversations guide](https://platform.openai.com/docs/guides/realtime-conversations). No SDK needed - use plain browser APIs (ask the team before adding `@openai/agents`).
- [ ] `frontend/src/realtime/useRealtimeCall.ts`:
  1. `createRealtimeSession(...)` from `api.ts` -> `clientSecret`.
  2. `new RTCPeerConnection()`, add the mic track from `getUserMedia({ audio: true })`.
  3. `pc.ontrack` -> attach the remote stream to a hidden `<audio autoplay>` element (Mom's voice).
  4. Data channel `oai-events`; parse incoming JSON events.
  5. `createOffer` -> `setLocalDescription` -> `POST https://api.openai.com/v1/realtime/calls` with `Authorization: Bearer <clientSecret>` and `Content-Type: application/sdp` -> `setRemoteDescription(answer)`.
  6. When the data channel opens, send `response.create` so Mom greets first ("Halo, kochanie?" / "Hi sweetie!").
- [ ] Hang up: send `session.close` (or close the data channel), stop the mic tracks, close the peer connection. Also clean up on unmount.
- [ ] Mute button = `track.enabled = false`.
- [ ] Until C3/B4 are merged: test with a temporary key pasted into a dev-only input (never commit it), or pair with B.
- **Done when:** you can talk with Mom in both languages from the call screen.

### A5. Forward events to the safety module - H+5:15 -> H+6:15 (needs C4)
- [ ] Event dispatcher in `useRealtimeCall`:
  - user input transcription events (delta + completed; check exact event names in the docs) -> `handleUserTranscript(text, isFinal)`,
  - completed function call `trigger_alert` (name + JSON args, `call_id`) -> `handleToolCall(name, args)`, then send `conversation.item.create` with `{ type: "function_call_output", call_id, output: "{\"ok\":true}" }` and `response.create` so Mom carries on casually.
- [ ] Create `sessionId` with `crypto.randomUUID()` when the call starts and pass it to the session request and to `useSafetyMonitor`.
- [ ] `?debug` query flag: overlay with the live transcript and the last event types (handy for the demo too).
- **Done when:** saying a code phrase on the laptop sends a real alert (M2).

### A6. Discreet feedback + demo trigger - H+6:15 -> H+7:15
- [ ] On a `lastAlert` change: `navigator.vibrate(200)` and an almost invisible hint (e.g. the timer dot changes color). **No popups.**
- [ ] Hidden manual trigger for the jury: long press (2 s) on the avatar -> `triggerManually("alert")`.
- **Done when:** both triggers work and nothing that looks like an alarm appears.

### A7. Phone testing + polish - H+7:15 -> end of day
- [ ] Test on the demo phone through C's HTTPS tunnel: autoplay of Mom's voice, speaker vs earpiece, safe areas.
- [ ] Handle errors: mic denied, session creation failed (502), connection drop -> "call failed - retry".

---

## Person B - AI Agent & Alert Delivery (backend, Python/FastAPI)

Owns: `backend/`. Branches: `feat/backend-realtime`, `feat/backend-alerts`.

### B1. Config and structure - H+0:45 -> H+1:15
- [x] Split `app/main.py` into `app/routes/`, `app/services/`, `app/models.py` (keep the error handlers and `/health`).
- [x] Extend `app/config.py` and `backend/.env.example` with placeholders:
  `OPENAI_API_KEY=`, `OPENAI_REALTIME_MODEL=`, `OPENAI_REALTIME_VOICE=`,
  `ALERT_PROVIDER=mock` (`mock|telegram`), `TELEGRAM_BOT_TOKEN=`, `TELEGRAM_CHAT_ID=`. (No Twilio/SMSAPI credentials required).
- [x] Add `httpx` to `requirements.txt` (for OpenAI REST & optional Telegram).
- [x] **Done when:** `make test-backend` and `make lint` are green.

### B2. Alerts endpoint with mock notifier - H+1:15 -> H+2:15 (needs C1)
- [ ] Pydantic models in `backend/app/models.py` matching the alert schemas.
- [ ] `Notifier` protocol (`send_sms`, `place_call`) + `MockNotifier` in `app/services/notifier.py`:
  - Builds simulated SMS text with Google Maps link: `maps_url = f"https://maps.google.com/?q={lat:.6f},{lon:.6f}"` (or location unavailable fallback).
  - Records the dispatched alert in in-memory storage for the Live Dispatcher Feed.
  - Returns delivery status (`channel: "mock"`, `status: "sent"`). Never logs full phone numbers.
- [ ] `POST /api/v1/alerts`: receives alert payload, calls notifier, stores in memory, returns 201 with delivery info.
- [ ] `GET /api/v1/alerts`: returns list of alerts (newest first) for the Live Dispatcher Dashboard.
- [ ] Tests in `test_api.py`: valid alert -> 201; no location -> 201 with fallback text; invalid payload -> 422 unified error.
- **Done when:** `pytest` passes; C can consume `GET /api/v1/alerts` and `POST /api/v1/alerts`.

### B3. Live Alerts Feed Polish & Optional Telegram Provider - H+2:15 -> H+3:30
- [ ] Verify `GET /api/v1/alerts` contains all fields needed by the dispatcher (timestamp, trigger phrase, transcript snippet, map coordinates).
- [ ] Implement `TelegramNotifier` as an optional push fallback if `ALERT_PROVIDER=telegram` (simple HTTP POST via `httpx`, PDF section 6).
- [ ] Provider factory returning `MockNotifier` (default) or `TelegramNotifier`.
- [ ] Tests with `httpx` mocked for Telegram provider.
- **Done when:** manual `curl` to `POST /api/v1/alerts` returns 201 and immediately shows up in `GET /api/v1/alerts`.

### B4. Realtime session endpoint - H+3:30 -> H+5:00 (needs C1)
- [ ] `POST /api/v1/realtime/session`: calls `POST https://api.openai.com/v1/realtime/client_secrets` with the server API key and a session config:
  - `model`, `voice` from env,
  - `instructions` = Mom prompt (B5) in the chosen language, with the code phrases,
  - `tools` = `[trigger_alert]` with JSON schema `{ level: "alert" | "emergency", reason: string }`,
  - input audio transcription enabled (transcribe model + language hint `pl`/`en`),
  - server-side turn detection (VAD).
  Check the exact field names against the current docs (GA vs beta shapes differ).
- [ ] Return `client_secret`, `expires_at`, `model`. Never log the key or the secret. OpenAI error/timeout -> 502 `UPSTREAM_ERROR`.
- [ ] Optional: pass the `OpenAI-Safety-Identifier` header with a hash of `session_id`.
- [ ] Tests with `httpx` mocked: success, validation error, upstream error.
- **Done when:** A can open a WebRTC call using the secret from this endpoint (through the BFF).

### B5. Mom prompt (PL + EN) - H+5:00 -> H+6:30
- [ ] `app/services/prompts.py`: templates per language. Content:
  - you are the user's mom on a phone call; warm, casual, **1-2 short spoken sentences**, no lists/emojis; ask simple questions to keep them talking (where are you, how far from home, what did you eat today);
  - never say you are an AI, never mention safety, alerts or tools;
  - if the user says any of the code phrases `{phrases}` (or clearly says they are in danger), call `trigger_alert` with the right level, then **continue the normal conversation as if nothing happened**;
  - always answer in `{language}`.
- [ ] Test by talking (with A): natural tone, no false tool calls in normal chat, the tool fires on the code phrases in both languages.
- **Done when:** 5 test conversations per language feel natural and the code phrases trigger reliably.

### B6. Hardening - H+6:30 -> end of day
- [ ] Pair with C on M2 integration (the contract wins in any mismatch).
- [ ] In-memory rate limits: realtime sessions (e.g. max 10/min overall) and alerts (max 1 per level per 30 s per `session_id`).
- [ ] Update `docs/SETUP.md`: how to configure OpenAI + `ALERT_PROVIDER` (variable names only).

---

## Person C - Contracts, BFF & Safety Pipeline

Owns: `contracts/`, `bff/`, `frontend/src/safety/`, `frontend/src/api.ts`, Docker/tunnel. Branches: `feat/contracts-v2`, `feat/bff-realtime-alerts`, `feat/frontend-safety`.

### C1. Contracts - H+0:15 -> H+1:00 (blocks everyone - do first)
- [ ] `contracts/backend.openapi.yaml`: `POST /api/v1/realtime/session`, `POST /api/v1/alerts`, `GET /api/v1/alerts` + schemas (snake_case), based on [PROJECT_PLAN section 5](../PROJECT_PLAN.md#5-proposed-api-draft---person-c-turns-this-into-contractsyaml-at-h0).
- [ ] `contracts/bff.openapi.yaml`: the same under `/api/...` in camelCase, with `400` / `502` errors.
- [ ] Bump `info.version` to `0.2.0`. Decide whether to drop `items` (if yes, remove its code + tests too).
- [ ] PR -> quick review by A and B -> merge -> announce.

### C2. BFF routes - H+1:00 -> H+2:45
- [ ] `bff/src/backendClient.ts`: `createRealtimeSession`, `createAlert`, `listAlerts` with snake_case <-> camelCase mapping.
- [ ] `bff/src/app.ts`: `POST /api/realtime/session`, `POST /api/alerts`, `GET /api/alerts`. Runtime validation (language enum, phrases arrays, phone format, lat/lon ranges, `level` / `source` enums) -> `400 VALIDATION_ERROR`; backend down -> `502 UPSTREAM_ERROR`. Do not log the `clientSecret`.
- [ ] Tests with `supertest` and a mocked backend client (each route + validation + upstream error).
- **Done when:** `make test-bff` is green and `curl` through the BFF works against B's backend.

### C3. Frontend API client - H+2:45 -> H+3:15
- [ ] `frontend/src/api.ts`: typed `createRealtimeSession(req)`, `createAlert(req)`, `listAlerts()` matching the BFF contract, unified error handling.
- [ ] Tell A it's ready.

### C4. Safety module - H+3:15 -> H+6:00
- [ ] `frontend/src/safety/normalize.ts`: lowercase, strip Polish diacritics (`normalize('NFD')` + manual `ł -> l`), remove punctuation, collapse spaces.
- [ ] `frontend/src/safety/keywordDetector.ts`: pure `detect(text, settings) -> { level, phrase } | null`; emergency beats alert. Keep a short rolling buffer of recent transcript text, because a phrase can be split across deltas.
- [ ] Unit tests (vitest): diacritics, casing, phrase inside a sentence, phrase split across two deltas, no false positive on partial words, emergency priority, PL and EN.
- [ ] `frontend/src/safety/useGeolocation.ts`: `watchPosition` with `{ enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }`, latest value in `useRef`, `clearWatch` on unmount, `gpsStatus`. Start it when the call starts ([localisation.md](../localisation.md) steps 2-4).
- [ ] `frontend/src/safety/useSafetyMonitor.ts`:
  - `handleUserTranscript` -> detector -> alert (`source: "keyword"`),
  - `handleToolCall("trigger_alert", args)` -> validate args -> alert (`source: "agent"`),
  - `triggerManually(level)` -> alert (`source: "manual"`),
  - one `dispatchAlert()` with a **cooldown per level (~30 s)** shared by all sources, so there are no duplicates; it attaches the location from the ref (or `null`), the transcript snippet and the settings, and calls `createAlert`,
  - exposes `lastAlert`, `gpsStatus`.
- **Done when:** detector tests are green and the hook works on the laptop with fake transcripts / fake tool calls.

### C5. End-to-end integration (with A and B) - H+6:00 -> H+7:30
- [ ] Run all 3 services with the real OpenAI + provider: start call -> talk with Mom -> code phrase -> SMS/Telegram arrives with the correct map pin. Test layer 1 and layer 2 separately (debug overlay).
- [ ] Fix mismatches (the contract is the source of truth).
- [ ] `docker compose up --build` still works (new env vars passed through).
- **Done when:** M2 is reached.

### C6. Real phone over HTTPS - H+7:30 -> H+9:00
- [ ] Expose the frontend: `cloudflared tunnel --url http://localhost:5173` (or `ngrok http 5173`). If Vite blocks the host, add it to `server.allowedHosts` in `vite.config.ts` (coordinate with A).
- [ ] Verify on the demo phone, on the **venue Wi-Fi and a mobile hotspot**: mic, GPS, WebRTC audio both ways, alert with an accurate location.
- [ ] Document it in `docs/SETUP.md` ("Testing on a phone").

### C7. Demo script + day 2 prep - H+9:00 -> end of day
- [ ] `docs/DEMO.md`: demo phone setup, code phrases (PL + EN), who holds the receiving phone, fallbacks (manual trigger, Telegram, backup video).
- [ ] Record a backup video of the working flow.
- [ ] Draft the dispatcher dashboard for day 2 (`GET /api/alerts` polling + map) - stretch.

---

## End-of-day checklist (all 3) - M3

- [ ] Full flow works on the demo phone over HTTPS, in Polish and in English.
- [ ] Code phrase -> trusted contact gets an SMS (or Telegram message) with a correct Google Maps link in < 5 s; emergency phrase also rings the contact (if Twilio).
- [ ] Mom keeps talking normally after the alert - no mention of it.
- [ ] Hidden manual trigger works.
- [ ] All branches merged to `main`, `make test` green, `docker compose up --build` works.
- [ ] No secrets in git (`git log -p | grep -iE "sk-|ek_|token"` sanity check); `.env.example` files updated.
- [ ] Check OpenAI usage/spend in the dashboard.
- [ ] 10-minute retro: what's left for day 2 (stretch goals, pitch deck, rehearsal).
