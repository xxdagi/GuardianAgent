# Guardian Agent

Voice-first personal safety companion disguised as a normal phone call.

<p align="center">
	<img width="1920" height="1080" alt="Prezentacja aplikacji" src="https://github.com/user-attachments/assets/0d053c5b-e4b5-4f44-aeb6-b699cae0a5fe" />
</p>

https://github.com/user-attachments/assets/04ee3599-1041-44ef-a688-323af70738d4


## What is Guardian Agent?

Guardian Agent is a voice-first personal safety application. To an outside observer, it looks and sounds like you are having a normal phone conversation. In reality, the AI agent is actively monitoring your speech for specific distress phrases. When triggered, it initiates a silent, hands-free emergency activation, capturing your GPS location and sending an immediate emergency alert to a live dispatcher dashboard.

## The Problem

In a genuine emergency or threatening situation:
- You may not be able to safely take out and unlock your phone.
- Reaching for a panic button or dialing emergency services can escalate the danger if noticed by an attacker.
- You need a discrete, passive way to call for help without breaking your cover.

*Disguising your plea for help as a casual phone call is a natural human defense mechanism.*

## Our Solution

1. **Voice input**: You speak naturally to an AI voice assistant (disguised as a contact, e.g., "Mom").
2. **Distress phrase detection**: The app continuously listens for pre-configured secret phrases (e.g., "Did you feed the cat?").
3. **Speech normalization**: Polish speech is handled accurately.
4. **Rolling transcript & Severity**: The conversation is transcribed and analyzed.
5. **GPS**: High-accuracy location is captured.
6. **Alert dispatch**: A silent HTTP POST is sent to the backend.
7. **Dispatcher dashboard**: The incident appears in real-time on a web-based command center.
8. **Voice feedback**: The AI naturally acknowledges the situation without breaking character.

## Why it is different

- **Voice-first safety interaction**: No fumbling with buttons; your voice is the trigger.
- **Hands-free activation**: Works even if your phone is in your pocket (with a headset).
- **Polish speech normalization**: Optimized for natural Polish emergency phrases.
- **Configurable distress phrases**: Customize what triggers the alarm.
- **Automatic location**: GPS coordinates are sent instantly.
- **Dispatcher workflow**: Professional web interface for monitoring incidents.
- **Immediate voice feedback**: The AI keeps you calm and confirms help is on the way (discreetly).
- **Cooldown**: Protection against repeated accidental triggers.

## Key Features

- Fake phone call interface with real-time AI voice conversation (ElevenLabs + Gemini).
- Silent distress phrase detection running in the background.
- Live GPS tracking attached to alerts.
- Real-time Dispatcher Dashboard (`/dispatcher`) showing incidents on a map.
- Mock SMS notifier for demo purposes.

## Architecture

```text
User
 ↓
Frontend / Voice Assistant
 ↓
Safety Pipeline
 ↓
BFF API
 ↓
Backend
 ↓
Dispatcher Dashboard
```

*Note: ElevenLabs is utilized in the Frontend/BFF layer for the Conversational AI.*

## Environment Configuration

Guardian Agent requires a single `.env` file located in the root directory. You can use the provided `.env.example` as a template.

Required variables:
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `PORT`
- `BACKEND_URL`
- `CORS_ORIGIN`
- `CORS_ORIGINS`
- `APP_ENV`

*Note: The `.env` file is local and must never be committed to the repository. ElevenLabs credentials must be configured locally for the voice features to function properly.*

## Demo / Pitch (Windows)

To run the full pitch environment on Windows, use the following command:

```powershell
.\start-pitch.ps1
```

This script automatically performs the following steps:
- Starts the required services (Backend, BFF, Frontend).
- Launches an ephemeral Cloudflare tunnel.
- Generates a temporary public HTTPS URL (which is required for microphone access on a mobile device).
- Generates a QR code for the phone.
- Displays the mobile app URL (PHONE URL).
- Displays the dispatcher dashboard URL (DISPATCHER URL).

To stop all pitch processes (including servers and the tunnel), run:

```powershell
.\stop-pitch.ps1
```

**Note:** The Cloudflare URL is ephemeral and will change every time the pitch environment is restarted.

### Instructions for the Jury

1. Clone the repository.
2. Configure the local `.env` file using `.env.example`.
3. Run `.\start-pitch.ps1`.
4. Scan the generated QR code with a mobile phone.
5. Open the dispatcher URL on your laptop.
6. Test the emergency voice flow (e.g., by saying the distress phrase into the phone).
7. Observe the incident appearing on the dispatcher dashboard.

## Development

- **backend**: Python (FastAPI)
- **BFF**: Node.js (Express, TypeScript)
- **frontend**: React (Vite, TypeScript)
- **Docker**: Supported via `docker-compose.yml` (`make up`).

## Project Structure

- `backend/` - Python API
- `bff/` - Backend-for-Frontend (Node.js)
- `frontend/` - React application
- `docs/` - Documentation & architecture

## Current Implementation Status

### Implemented
- AI Voice Agent integration (ElevenLabs).
- Background keyword detection (Polish/English).
- Alert dispatching to backend.
- Real-time Dispatcher Dashboard with Incident Map.
- Automated pitch environment (Cloudflare tunnel + QR).

### Pitch Goal
- Advanced reasoning for determining emergency severity dynamically.
- Integration with real emergency services (e112).
- Native iOS/Android apps (currently PWA/Web).
