# ==========================================
# STAGE 1: Build React Vite SPA
# ==========================================
FROM node:26-alpine AS builder

WORKDIR /app

# Install dependencies (utilize layer caching)
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Production Nginx Server
# ==========================================
FROM nginx:1.27-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

