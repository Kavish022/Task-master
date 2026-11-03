# ==========================================
# STAGE 1: Build TypeScript & Generate Prisma Client
# ==========================================
FROM node:26-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm ci

# Generate Prisma Client for Linux Alpine
RUN npx prisma generate

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# ==========================================
# STAGE 2: Production Runtime
# ==========================================
FROM node:26-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Run as non-root user for container security
USER node

# Copy production node_modules (including Prisma Client) and built code
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

CMD ["node", "dist/server.js"]

