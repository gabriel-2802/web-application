# PostgreSQL 16 Alpine with Hardening
FROM postgres:16-alpine

# Install additional dependencies
RUN apk add --no-cache curl

# Create non-root database user (PostgreSQL default user is postgres)
# Ensure data directory permissions are restricted
RUN chmod 700 /var/lib/postgresql/data

# Health check using pg_isready
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
    CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1

# Expose internal port (not published to host)
EXPOSE 5432

# Use environment variables (passed via docker-compose)
# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB are set in docker-compose.yml

# Start PostgreSQL
CMD ["postgres", "-c", "max_connections=100", "-c", "shared_buffers=256MB", "-c", "effective_cache_size=1GB"]
