---
name: secrets
description: Rules for handling secrets. Use whenever touching config, env vars, credentials, logs, commits or external APIs.
---

# Skill: Secret handling

## Rules

1. **Never commit secrets.** `.env*` is git-ignored; only `.env.example` (placeholder values) is tracked.
2. **Never reveal secrets** in chat, code, comments, tests, fixtures, logs, error messages, screenshots or PR descriptions.
3. **Do not read `.env` files** unless the user explicitly requests it. Variable names live in `.env.example`.
4. **Never hardcode** keys/tokens/passwords/URLs with credentials. Read them from environment variables.
5. **Frontend is public.** Anything bundled into `frontend/` is visible to everyone. Only `VITE_*` non-sensitive values are allowed there. Secrets and third-party API keys live in `bff/` or `backend/` only.
6. **Do not log** request headers (`Authorization`, `Cookie`), tokens, or full env dumps.
7. **Use placeholders** in examples: `your-api-key-here`, `changeme`.
8. When adding a new variable: add it to the relevant `.env.example` with a dummy value and a comment, and document it in the README of that service if needed.

## If a secret leaks

Stop, tell the user immediately, and ask them to **rotate** the secret. Removing it from git history is not enough.

## Checklist before every commit

- [ ] `git diff --staged` contains no keys/tokens/passwords
- [ ] No new `.env` file staged
- [ ] No secrets in test data or logs
