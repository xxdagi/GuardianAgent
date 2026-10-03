---
name: api-contracts
description: Contract-first API rules between frontend, bff and backend. Use whenever adding or changing an endpoint, request/response shape or error format.
---

# Skill: API contracts

## Sources of truth

| Contract | File | Producer | Consumer |
|----------|------|----------|----------|
| Backend API | [`contracts/backend.openapi.yaml`](../../../contracts/backend.openapi.yaml) | `backend/` | `bff/` |
| BFF API | [`contracts/bff.openapi.yaml`](../../../contracts/bff.openapi.yaml) | `bff/` | `frontend/` |

## Rules

1. **Contract first.** Change the YAML, then implement, then test. Code and contract must never diverge in the same PR.
2. **Call direction is fixed:** `frontend -> bff -> backend`. The frontend never calls `backend` directly.
3. **No cross-service imports.** Each service defines its own types matching the contract.
4. **Backward compatible by default.** Add optional fields; do not remove/rename fields or change types without telling the team and bumping `info.version`.
5. **Versioning:** backend paths are prefixed `/api/v1`; BFF paths `/api`.
6. **JSON only**, `snake_case` in backend, `camelCase` in BFF/frontend. The BFF maps between them.
7. **Unified error format** (all services):
   ```json
   { "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details": {} } }
   ```
   Codes: `VALIDATION_ERROR` (400/422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `UPSTREAM_ERROR` (502), `INTERNAL_ERROR` (500).
8. **Every service exposes `GET /health`** returning `{ "status": "ok" }`.
9. Dates: ISO 8601 UTC strings. IDs: strings.
10. Validate input at the edge (Pydantic in backend, runtime checks in BFF).
11. Every endpoint needs at least one test.

## Adding an endpoint - checklist

- [ ] Updated `contracts/*.yaml` (path, schemas, error responses)
- [ ] Implemented in producer + test
- [ ] Updated consumer client (`bff/src/backendClient.ts` or `frontend/src/api.ts`) + test
- [ ] `make test` passes
