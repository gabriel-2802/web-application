# PostgreSQL 16 Alpine with Hardening
FROM postgres:16-alpine

# Install additional dependencies
RUN apk add --no-cache curl

# NOTE: Do NOT chmod /var/lib/postgresql/data at build time —
# that directory is created at runtime by the entrypoint script.
# PostgreSQL's official entrypoint already sets correct permissions (700).

# Health check using pg_isready
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
    CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1

# Expose internal port (not published to host)
EXPOSE 5432

# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB are set in docker-compose.yml

# Start PostgreSQL
CMD ["postgres", "-c", "max_connections=100", "-c", "shared_buffers=256MB", "-c", "effective_cache_size=1GB"]
