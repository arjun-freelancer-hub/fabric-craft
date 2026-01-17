#!/bin/sh
# Helper script to run seed with proper DATABASE_URL construction
# This ensures DATABASE_URL uses the Docker service name (mysql) instead of localhost

# Construct DATABASE_URL from environment variables if they exist
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_NAME" ]; then
    export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-3306}/${DB_NAME}"
    echo "Using DATABASE_URL with host: ${DB_HOST}"
fi

# Run the seed script
exec npx ts-node -r tsconfig-paths/register prisma/seed.ts
