# HackYeah 2026: Guardian Agent

A personal safety system created for the HackYeah 2026 hackathon, featuring a fully functional Agentic AI voice assistant. It actively monitors real-time conversations for specific code phrases or emergency context. When a threat is detected, the AI autonomously triggers an alert, sending an SMS with the user's GPS location to their trusted contacts. The project is built on a scalable, three-tier microservice architecture using contract-first OpenAPI design.

### Demo
<video src="docs/GuardianAgentDemo.mp4" controls="controls" width="100%"></video>

## Architecture

```text
frontend (React, :5173)  -->  bff (Node/TS, :4000)  -->  backend (Python/FastAPI, :8000)
```

| Folder      | Role                                   | Stack                    |
|-------------|----------------------------------------|--------------------------|
| `backend/`  | Domain logic, data, integrations       | Python 3.11+, FastAPI    |
| `bff/`      | Backend-for-frontend: aggregation/auth | Node 20+, TypeScript, Express |
| `frontend/` | UI                                     | React, TypeScript, Vite  |
| `contracts/`| API contracts (OpenAPI) - source of truth | YAML                  |
| `docs/`     | Architecture + rules for humans & AI agents | Markdown            |

Each service has its own dependencies, `.env`, Dockerfile and tests. They talk **only** over HTTP, according to `contracts/`.

## Quick start (Setup)

Prerequisites: Python 3.11+, Node.js 20+, make (Docker optional).

```bash
make setup   # .env files + venv + npm install (first time only)
make dev     # starts backend, bff, and frontend concurrently in ONE terminal!
```

- Open app: **http://localhost:5173**
- Open recipient SMS phone: **http://localhost:5173/sms** (or `make sms` on port 3001)

> **⚠️ IMPORTANT:** To experience the real, fully working AI voice agent, you must obtain the API keys from the repository author (or create your own) and paste them into your `.env` file. Without them, the app works but falls back to a robotic, offline browser speech synthesizer.

Or using Docker: `make up`.

## Tests

`make test` runs all tests, `make lint` runs all static checks.

Full guide (prerequisites, env variables, Docker, smoke test, troubleshooting): [docs/SETUP.md](docs/SETUP.md).

## Rules (read before contributing - also for AI agents)

- [AGENTS.md](AGENTS.md) - entry point for agents
- [docs/SETUP.md](docs/SETUP.md) - setup, run, test
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/agents/skills/secrets.md](docs/agents/skills/secrets.md) - never share secrets
- [docs/agents/skills/api-contracts.md](docs/agents/skills/api-contracts.md) - contract-first API changes
- [docs/agents/skills/workflow.md](docs/agents/skills/workflow.md) - git/branching/definition of done