#!/bin/sh
set -e

# Always reconstruct DATABASE_URL from individual variables if DB_HOST is set
# This ensures Docker networking overrides work correctly
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_NAME" ]; then
    export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-3306}/${DB_NAME}"
    echo "Constructed DATABASE_URL: mysql://${DB_USER}:***@${DB_HOST}:${DB_PORT:-3306}/${DB_NAME}"
fi

# Run Prisma generate to ensure client is up to date
echo "Generating Prisma Client..."
npx prisma generate

# Execute the main command (module-alias is already included in CMD)
exec "$@"
