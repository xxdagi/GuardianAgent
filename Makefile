.PHONY: setup up dev test test-backend test-bff test-frontend lint sms

# First-time setup: env file + dependencies for all services.
setup:
	cp -n .env.example .env || true
	cd backend && ([ -d .venv ] || python3 -m venv .venv) && . .venv/bin/activate && pip install -r requirements-dev.txt
	cd bff && npm install
	cd frontend && npm install

up:
	docker compose up --build

# Run all 3 services locally in parallel with live reload in one terminal (instant start, no Docker overhead)
dev:
	@echo "Starting backend, bff, and frontend..."
	@(trap 'kill 0' SIGINT; \
	  (cd backend && . .venv/bin/activate && uvicorn app.main:app --port 8000 --reload) & \
	  (cd bff && npm run dev) & \
	  (cd frontend && npm run dev) & \
	  wait)

test: test-backend test-bff test-frontend

test-backend:
	cd backend && . .venv/bin/activate && pytest

test-bff:
	cd bff && npm test

test-frontend:
	cd frontend && npm test

lint:
	cd backend && . .venv/bin/activate && ruff check .
	cd bff && npm run typecheck
	cd frontend && npm run typecheck

# Mock SMS receiver screen on http://localhost:3001
sms:
	cd frontend && npm run sms
