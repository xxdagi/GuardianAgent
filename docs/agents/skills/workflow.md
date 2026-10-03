---
name: workflow
description: Git workflow, code conventions and definition of done for the hackathon.
---

# Skill: Workflow

- Branch from `main`: `feat/<service>-<topic>`, `fix/<service>-<topic>`. Small PRs, merge often.
- Commits: imperative, English, prefixed by scope: `backend: add items endpoint`.
- One person/agent per service folder at a time to avoid conflicts. Changes in `contracts/` must be announced to the team.
- Languages: Python (`ruff`, `pytest`, type hints), TypeScript strict mode (`eslint`-friendly, no `any`).
- No new heavy dependencies without need - hackathon speed, but keep it runnable.

## Definition of done

- [ ] Contract updated (if API touched)
- [ ] Tests added and `make test` green
- [ ] `docker compose up --build` still works
- [ ] No secrets in diff (see [secrets](secrets.md))
- [ ] Docs updated if setup/behavior changed
