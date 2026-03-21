
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
	$(COMPOSE) exec db psql -U myuser -d mydb

# Restart the container
db_restart: down up