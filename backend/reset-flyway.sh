#!/bin/bash

# Reset Flyway History and Database
# This allows V1 migration to run again with the corrected schema

echo "================================================"
echo "🔄 RESETTING DATABASE FOR FRESH MIGRATION"
echo "================================================"
echo ""

# Check if using Docker or local PostgreSQL
if command -v docker &> /dev/null; then
    echo "Docker found - using Docker PostgreSQL..."

    # If you have a postgres container named 'postgres'
    docker exec -it postgres psql -U admin -d my_pq_db << 'EOF'
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
EOF

elif command -v psql &> /dev/null; then
    echo "PostgreSQL CLI found - resetting locally..."

    export PGPASSWORD="admin"
    psql -h localhost -U admin -d my_pq_db << 'EOF'
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
EOF

else
    echo "❌ PostgreSQL CLI not found"
    echo ""
    echo "Manual solution - Run in pgAdmin or DBeaver:"
    echo "   DROP TABLE IF EXISTS flyway_schema_history CASCADE;"
    echo ""
    exit 1
fi

echo ""
echo "✅ Flyway history cleared!"
echo ""
echo "Now run:"
echo "   cd /Users/gabrielcarauleanu/Desktop/web-application/backend"
echo "   mvn spring-boot:run"
echo ""
echo "Flyway will re-apply V1 migration with the corrected role_name column"
echo "================================================"

