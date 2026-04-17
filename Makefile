.PHONY: docker-build docker-up docker-down docker-restart docker-logs

docker-build:
	docker-compose build --no-cache

docker-build-cache:
	docker-compose build

docker-up:
	docker-compose up -d
	@echo "Frontend:  http://localhost:3000"
	@echo "Backend:   http://backend:8080 (internal)"
	@echo "Database:  postgresql://postgres:5432 (internal)"

docker-down:
	docker-compose down

docker-restart: docker-down docker-up

docker-logs:
	docker-compose logs -f

docker-logs-backend:
	docker-compose logs -f backend

docker-logs-frontend:
	docker-compose logs -f frontend

docker-logs-db:
	docker-compose logs -f postgres
