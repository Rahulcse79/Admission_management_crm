# ──────────────────────────────────────────────────
# Admission Management CRM - Makefile
# ──────────────────────────────────────────────────

.PHONY: help dev dev-backend dev-frontend build test lint clean docker-up docker-down seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ──────────────────────────────────
dev: ## Start all services in development mode
	docker compose up -d mongodb
	@echo "⏳ Waiting for MongoDB..."
	@sleep 3
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend &
	wait

dev-backend: ## Start Go backend in dev mode
	cd backend && go run cmd/server/main.go

dev-frontend: ## Start Next.js frontend in dev mode
	cd frontend && npm run dev

# ─── Build ────────────────────────────────────────
build: ## Build all services
	cd backend && go build -o bin/server cmd/server/main.go
	cd frontend && npm run build

build-backend: ## Build Go backend
	cd backend && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/server cmd/server/main.go

build-frontend: ## Build Next.js frontend
	cd frontend && npm run build

# ─── Testing ──────────────────────────────────────
test: ## Run all tests
	cd backend && go test ./... -v -cover

test-backend: ## Run backend tests
	cd backend && go test ./... -v -cover -race

lint: ## Lint all code
	cd backend && golangci-lint run ./...
	cd frontend && npm run lint

# ─── Docker ───────────────────────────────────────
docker-up: ## Start all services with Docker
	docker compose up --build -d

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

docker-clean: ## Clean Docker volumes
	docker compose down -v --remove-orphans

# ─── Database ─────────────────────────────────────
seed: ## Seed the database with initial data
	cd backend && go run cmd/seed/main.go

# ─── Utilities ────────────────────────────────────
clean: ## Clean build artifacts
	rm -rf backend/bin
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache
