# Setup, running and testing

## 1. Prerequisites

| Tool    | Version | Needed for                  |
|---------|---------|-----------------------------|
| Python  | 3.11+ (3.12 in Docker) | `backend/`   |
| Node.js | 20+ (22 in Docker), npm | `bff/`, `frontend/` |
| make    | any     | shortcuts (optional)        |
| Docker + Compose | any recent | `make up` (optional) |
| git     | any     | -                           |

Check: `python3 --version && node --version && npm --version`

On Fedora, if `python -m venv` fails: `sudo dnf install python3`.

## 2. First-time setup

One command from the repo root:

```bash
make setup
```

It copies `.env.example` to `.env` at root (if missing), creates `backend/.venv`, and installs Python and npm dependencies.

Guardian Agent supports a **single root `.env` file** at the root of the project! You don't need to edit multiple files — just configure everything in `.env` at the project root.

Manual equivalent:

```bash
cp .env.example .env

cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements-dev.txt && cd ..
cd bff && npm install && cd ..
cd frontend && npm install && cd ..
```

Create the venv only once. Afterwards just activate it: `. backend/.venv/bin/activate`.

> Never commit `.env` files. Put real secrets only in your local `.env`. See [secrets skill](agents/skills/secrets.md).

## 3. Environment variables (configured in single root `.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `ELEVENLABS_API_KEY` | `""` | ElevenLabs API key (**free tier, no credit card**: https://elevenlabs.io) |
| `ELEVENLABS_AGENT_ID` | `""` | ElevenLabs Conversational AI Agent ID for real-time voice conversation |
| `PORT` | `4000` | BFF listen port |
| `BACKEND_URL` | `http://localhost:8000` | Backend API URL for BFF proxy |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for BFF |
| `CORS_ORIGINS` | `http://localhost:4000` | Allowed origin for Backend |
| `APP_ENV` | `development` | Environment name |

> **⚠️ Note for teammates & testers:** 
> Without `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID`, the app will still start and run locally, but the voice assistant will fall back to a robotic-sounding browser speech synthesizer. **For the full, realistic Guardian Agent experience, ask the project author for their API keys** (or provide your own) and paste them into your `.env` file!

## 4. Run locally (3 terminals)

```bash
# 1) backend  -> http://localhost:8000  (docs: /docs)
cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 2) bff      -> http://localhost:4000
cd bff && npm run dev

# 3) frontend -> http://localhost:5173
cd frontend && npm run dev
```

Start order: backend, bff, frontend. Open http://localhost:5173.

## 5. Run with Docker

```bash
make setup   # or at least copy the .env files
make up      # docker compose up --build
```

Frontend: http://localhost:5173, BFF: http://localhost:4000, backend: http://localhost:8000.

## 6. Tests and checks

From the repo root:

| Command | What it does |
|---------|--------------|
| `make test` | all tests (backend, bff, frontend) |
| `make test-backend` | `pytest` |
| `make test-bff` | `vitest` |
| `make test-frontend` | `vitest` (no tests yet - passes) |
| `make lint` | `ruff` (backend), `tsc --noEmit` (bff, frontend) |

Directly in a service:

```bash
cd backend  && . .venv/bin/activate && pytest -v
cd bff      && npm test          # npm run typecheck
cd frontend && npm test          # npm run typecheck, npm run build
```

Backend tests use FastAPI `TestClient`, BFF tests use `supertest` with the backend client mocked. No running servers are needed for automated tests.

## 7. Manual smoke test

With backend and bff running:

```bash
curl localhost:8000/health
curl localhost:4000/health
curl -X POST localhost:4000/api/items -H 'Content-Type: application/json' -d '{"name":"test"}'
curl localhost:4000/api/items                       # camelCase: createdAt
curl -X POST localhost:4000/api/items -H 'Content-Type: application/json' -d '{"name":""}'   # 400 VALIDATION_ERROR
```

Then add an item in the UI at http://localhost:5173. Items are stored in memory and reset when the backend restarts.

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| `venv`/`ensurepip` hangs or breaks | `rm -rf backend/.venv` and run `make setup` again |
| `make test-backend`: `.venv/bin/activate` not found | run `make setup` |
| UI shows "Backend unreachable" / 502 | backend is not running or `BACKEND_URL` in `bff/.env` is wrong |
| UI cannot reach `/api` | bff not running on :4000 (or set `BFF_URL`) |
| Port already in use | stop the other process or change `PORT` / `--port` |
| `docker compose` complains about missing `.env` | run `make setup` |
| Changed an API | follow [api-contracts skill](agents/skills/api-contracts.md): edit `contracts/` first |
