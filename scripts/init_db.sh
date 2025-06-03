#!/bin/bash
set -e

# Wait for PostgreSQL to start
until PGPASSWORD=soundparty psql -h "db" -U "soundparty" -d "soundparty" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing schema"

# Execute schema and test data
PGPASSWORD=soundparty psql -h "db" -U "soundparty" -d "soundparty" -f /app/migrations/init.sql

>&2 echo "Database initialization completed" 