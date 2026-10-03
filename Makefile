.PHONY: setup up test test-backend test-bff test-frontend lint

# First-time setup: env files + dependencies for all services.
setup:
	cp -n backend/.env.example backend/.env || true
	cp -n bff/.env.example bff/.env || true
	cp -n frontend/.env.example frontend/.env || true
	cd backend && ([ -d .venv ] || python3 -m venv .venv) && . .venv/bin/activate && pip install -r requirements-dev.txt
	cd bff && npm install
	cd frontend && npm install

up:
	docker compose up --build

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
