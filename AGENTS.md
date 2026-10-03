# Instructions for AI agents

Read these before changing anything. They are mandatory.

1. **Secrets** - [docs/agents/skills/secrets.md](docs/agents/skills/secrets.md)
2. **API contracts** - [docs/agents/skills/api-contracts.md](docs/agents/skills/api-contracts.md)
3. **Workflow** - [docs/agents/skills/workflow.md](docs/agents/skills/workflow.md)
4. **Architecture** - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
5. **Setup, run, test** - [docs/SETUP.md](docs/SETUP.md)

## Hard rules (summary)

- NEVER print, log, commit, paste or send secrets (API keys, tokens, passwords, `.env` contents).
- NEVER read `.env` files unless the user explicitly asks; use `.env.example` for variable names.
- Services are independent: `frontend` -> `bff` -> `backend`. No cross-folder imports. Frontend never calls `backend` directly.
- API changes are **contract-first**: edit `contracts/*.yaml` first, then code, then tests.
- Keep all code, comments, commits and docs in English.
- Keep changes small, runnable and tested (`make test`).
