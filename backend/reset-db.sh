#!/bin/bash

echo "================================================"
echo "🔧 COMPLETE DATABASE RESET & SETUP"
echo "================================================"
echo ""

# Try to reset using available tools
if command -v docker &> /dev/null; then
    echo "Using Docker to reset database..."

    # Find and stop postgres container
    POSTGRES_CONTAINER=$(docker ps -a --filter "name=postgres" --format "{{.Names}}" | head -1)

    if [ -z "$POSTGRES_CONTAINER" ]; then
        echo "⚠️  PostgreSQL container not found"
        echo "Please ensure PostgreSQL is running in Docker"
        exit 1
    fi

    echo "Resetting database in container: $POSTGRES_CONTAINER"

    # Drop and recreate database
    docker exec -it "$POSTGRES_CONTAINER" psql -U admin -c "DROP DATABASE IF EXISTS my_pq_db;"
    docker exec -it "$POSTGRES_CONTAINER" psql -U admin -c "CREATE DATABASE my_pq_db;"

    echo "✅ Database reset in Docker"

elif command -v psql &> /dev/null; then
    echo "Using local PostgreSQL to reset database..."

    export PGPASSWORD="admin"

    # Drop and recreate
    psql -h localhost -U admin -c "DROP DATABASE IF EXISTS my_pq_db;" 2>/dev/null
    psql -h localhost -U admin -c "CREATE DATABASE my_pq_db;" 2>/dev/null

    echo "✅ Database reset locally"

else
    echo "❌ Neither Docker nor PostgreSQL CLI found"
    echo ""
    echo "Manual reset - use pgAdmin or DBeaver:"
    echo "   1. Right-click database 'my_pq_db'"
    echo "   2. Select 'Delete/Drop'"
    echo "   3. Create new database 'my_pq_db'"
    echo ""
    echo "Then run: mvn spring-boot:run"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ DATABASE RESET COMPLETE"
echo "================================================"
echo ""
echo "Next step: Run the application"
echo ""
echo "   cd /Users/gabrielcarauleanu/Desktop/web-application/backend"
echo "   mvn spring-boot:run"
echo ""
echo "Expected output:"
echo "   ✅ Flyway applies V1 migration"
echo "   ✅ Roles inserted (ROLE_ADMIN, ROLE_WRITER, ROLE_VIEWER)"
echo "   ✅ Flyway applies V2 migration"
echo "   ✅ Application starts successfully"
echo ""
echo "================================================"

