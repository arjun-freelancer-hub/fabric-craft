# Multi-stage build for Backend

# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 3: Production
FROM node:24-alpine AS runner
WORKDIR /app

# Install OpenSSL and compatibility libraries for Prisma (required for Alpine/musl)
# Alpine 3.18+ uses OpenSSL 3.0, but we also need compatibility for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install module-alias for runtime path alias resolution (needed for @/* imports)
# This is more reliable than tsconfig-paths for production builds
RUN npm install module-alias

# Install ts-node and tsconfig-paths for running seed script in production
RUN npm install ts-node tsconfig-paths

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy seed script for database seeding
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts

# Copy built application
COPY --from=builder /app/dist ./dist

# Create package.json in dist for module-alias to resolve @/ paths
# Since we run from /app, @ should map to dist/ directory
RUN echo '{"_moduleAliases":{"@":"dist"}}' > ./package.json

# Copy tsconfig.json for path resolution (no longer needed, but keeping for reference)
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories for uploads and logs
RUN mkdir -p uploads logs

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application with module-alias for path alias resolution
CMD ["node", "-r", "module-alias/register", "dist/index.js"]
