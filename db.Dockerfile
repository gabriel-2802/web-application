FROM postgres:16-alpine

RUN apk add --no-cache curl

# health check using pg_isready
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
    CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1

# expose internal port
EXPOSE 5432

# start PostgreSQL
CMD ["postgres", "-c", "max_connections=100", "-c", "shared_buffers=256MB", "-c", "effective_cache_size=1GB"]
