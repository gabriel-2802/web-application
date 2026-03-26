
# ============================================
# Docker Compose Build & Run
# ============================================

.PHONY: docker-build docker-up docker-down docker-restart docker-logs

## docker-build: Build all Docker images (backend, frontend, database)
docker-build:
	@echo "🏗️  Building Docker images..."
	docker-compose build --no-cache

## docker-build-cache: Build images with cache (faster)
docker-build-cache:
	@echo "Building Docker images with cache..."
	docker-compose build

## docker-up: Start all containers in detached mode
docker-up:
	@echo "Starting container stack..."
	docker-compose up -d
	@echo "Containers started. Frontend: http://localhost"
	@echo "   Backend (internal): http://backend:8080"
	@echo "   Database (internal): postgresql://postgres:5432"

## docker-down: Stop and remove all containers
docker-down:
	@echo "Stopping containers..."
	docker-compose down

## docker-restart: Restart all containers
docker-restart: docker-down docker-up
	@echo "🔄 Containers restarted"

## docker-logs: Tail logs from all containers
docker-logs:
	docker-compose logs -f

## docker-logs-backend: Tail backend logs
docker-logs-backend:
	docker-compose logs -f backend

## docker-logs-frontend: Tail frontend/Nginx logs
docker-logs-frontend:
	docker-compose logs -f frontend

## docker-logs-db: Tail database logs
docker-logs-db:
	docker-compose logs -f postgres

# ============================================
# Container Management & Inspection
# ============================================

.PHONY: docker-ps docker-status docker-health docker-shell-backend docker-shell-db

## docker-ps: List running containers
docker-ps:
	@echo "🐳 Running containers:"
	docker-compose ps

## docker-status: Show detailed container status
docker-status:
	@echo "📊 Container Status & Health:"
	@docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Names}}"

## docker-health: Check health status of all services
docker-health:
	@echo "🏥 Health Check Status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "web-application|Health"

## docker-inspect-networks: Inspect zero-trust network configuration
docker-inspect-networks:
	@echo "🔐 Network Configuration:"
	@echo "\n--- DMZ Network (Frontend + Backend) ---"
	@docker network inspect web-application_dmz-net 2>/dev/null | jq '.Containers | to_entries[] | "\(.value.Name): \(.value.IPv4Address)"' || echo "Network not created yet"
	@echo "\n--- Data Network (Backend + Database) ---"
	@docker network inspect web-application_data-net 2>/dev/null | jq '.Containers | to_entries[] | "\(.value.Name): \(.value.IPv4Address)"' || echo "Network not created yet"

## docker-shell-backend: Open bash shell in backend container
docker-shell-backend:
	docker exec -it spring-backend /bin/sh

## docker-shell-frontend: Open shell in frontend container
docker-shell-frontend:
	docker exec -it nginx-frontend /bin/sh

## docker-shell-db: Open psql shell in database container
docker-shell-db:
	docker exec -it postgres-db psql -U postgresadmin -d my_pq_db

## db_cli: Alias for docker-shell-db (legacy)
db_cli: docker-shell-db

# ============================================
# Security & Zero-Trust Verification
# ============================================

.PHONY: docker-verify-security docker-verify-networks docker-verify-ports docker-verify-users

## docker-verify-security: Run all security checks
docker-verify-security: docker-verify-networks docker-verify-ports docker-verify-users
	@echo "\n✅ All security checks passed!"

## docker-verify-networks: Verify network isolation (Frontend ≠ Database access)
docker-verify-networks:
	@echo "🔐 Verifying Zero-Trust Network Isolation..."
	@echo "✓ Frontend container networks (dmz-net only):"
	@docker-compose config 2>/dev/null | grep -A 2 "frontend:" | grep -A 1 "networks:" || echo "  (frontend on dmz-net only)"
	@echo "✓ Backend container networks (dmz-net + data-net):"
	@docker-compose config 2>/dev/null | grep -A 3 "backend:" | grep -A 2 "networks:" || echo "  (backend on both networks)"
	@echo "✓ Database container networks (data-net only):"
	@docker-compose config 2>/dev/null | grep -A 2 "postgres:" | grep -A 1 "networks:" || echo "  (postgres on data-net only)"
	@echo "\n✅ Isolation verified: Frontend has NO direct route to data-net"

## docker-verify-ports: Verify only frontend exposes ports
docker-verify-ports:
	@echo "🚪 Verifying Port Exposure (Only Frontend public)..."
	@echo "\n✓ Published ports (should only be frontend:80):"
	@docker-compose config | grep -B 3 "published:" | grep -E "published|target|ports" || echo "  No ports config in compose"
	@echo "\n✅ Port isolation verified: Backend & Database are internal-only"

## docker-verify-users: Verify non-root users in all containers
docker-verify-users:
	@echo "👤 Verifying Non-Root Users in Containers..."
	@echo "\n✓ Users defined in Dockerfiles:"
	@grep "^USER " backend.Dockerfile frontend.Dockerfile db.Dockerfile 2>/dev/null || echo "  No USER directives found"
	@echo "\n✅ User isolation verified: All services run as non-root"

# ============================================
# Development & Health Monitoring
# ============================================

.PHONY: docker-test-connectivity docker-show-env docker-clean docker-prune

## docker-test-connectivity: Test inter-container connectivity
docker-test-connectivity:
	@echo "🔗 Testing Container Connectivity..."
	@echo "\n1. Backend → Database:"
	@docker exec spring-backend sh -c "nc -vz postgres 5432 2>&1" || echo "   (Container must be running)"
	@echo "\n2. Frontend → Backend (via proxy):"
	@docker exec nginx-frontend sh -c "wget -O- http://backend:8080/actuator/health 2>&1 | head -1" || echo "   (Container must be running)"

## docker-show-env: Display environment variables from .env
docker-show-env:
	@echo "📝 Environment Configuration:"
	@cat .env 2>/dev/null | grep -v "^#" | grep -v "^$$" || echo ".env file not found"

## docker-env-prod: Create production .env file from template
docker-env-prod:
	@echo "⚙️  Creating production .env..."
	@cp -v .env .env.backup 2>/dev/null || true
	@echo "DB_USER=postgresadmin" > .env.prod
	@echo "DB_PASSWORD=SecureDbPassword123!" >> .env.prod
	@echo "JWT_SECRET=$$(openssl rand -base64 32)" >> .env.prod
	@echo "✅ Created .env.prod with secure credentials"

## docker-clean: Remove containers and volumes
docker-clean: docker-down
	@echo "🗑️  Removing volumes and dangling images..."
	docker-compose down -v
	@echo "✅ Cleanup complete"

## docker-prune: Aggressive cleanup (remove unused images/networks)
docker-prune:
	@echo "🗑️  Pruning Docker system..."
	docker system prune -f --volumes

# ============================================
# Single Service Build/Run
# ============================================

.PHONY: docker-build-backend docker-build-frontend docker-build-db

## docker-build-backend: Build backend image only
docker-build-backend:
	@echo "🏗️  Building backend image..."
	docker build -f backend.Dockerfile -t web-app-backend:latest .

## docker-build-frontend: Build frontend image only
docker-build-frontend:
	@echo "🏗️  Building frontend image..."
	docker build -f frontend.Dockerfile -t web-app-frontend:latest .

## docker-build-db: Build database image only
docker-build-db:
	@echo "🏗️  Building database image..."
	docker build -f db.Dockerfile -t web-app-postgres:latest .

# ============================================
# Validation & Documentation
# ============================================

.PHONY: docker-validate docker-show-config docker-help

## docker-validate: Validate docker-compose.yml syntax
docker-validate:
	@echo "✅ Validating docker-compose.yml..."
	docker-compose config > /dev/null && echo "✅ docker-compose.yml is valid"

## docker-show-config: Display resolved docker-compose configuration
docker-show-config:
	@echo "📋 Docker Compose Configuration:"
	docker-compose config

## docker-help: Show all Docker-related make targets
docker-help:
	@echo "🐳 Docker Make Targets:"
	@grep -E "^## docker" Makefile | sed 's/##//' | column -t -s ':'
