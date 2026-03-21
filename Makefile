
COMPOSE=docker-compose

.PHONY: up down cli restart

# Start the PostgreSQL container
db_up:
	$(COMPOSE) up -d --build

# Stop and remove the container
db_down:
	$(COMPOSE) down

# Open psql CLI inside the running container
db_cli:
	docker exec -it postgres_db psql -U admin -d my_pq_db

# Restart the container
db_restart: down up