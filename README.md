# HackYeah 2026

Hackathon starter with three independent services.

```
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

## Quick start

Prerequisites: Python 3.11+, Node.js 20+, make (Docker optional).

```bash
make setup   # .env files + venv + npm install (first time only)

# terminal 1
cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000
# terminal 2
cd bff && npm run dev
# terminal 3
cd frontend && npm run dev
```

Or: `make up` (Docker). Open http://localhost:5173.

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