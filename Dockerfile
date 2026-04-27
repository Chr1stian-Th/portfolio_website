# syntax=docker/dockerfile:1.6
# =============================================================================
#  Multi-stage Dockerfile for the personal portfolio site.
#
#  Stage 1: build the Vite bundle with Node.
#  Stage 2: serve the static output with nginx (small, fast, cache-friendly).
#
#  Build:    docker build -t portfolio .
#  Run:      docker run --rm -p 8080:80 portfolio
#  Visit:    http://localhost:8080
# =============================================================================

# ─── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first so this layer caches when only source changes.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest and build.
COPY . .
RUN npm run build

# ─── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Replace the default site with our SPA-aware config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Drop the built bundle into nginx's web root.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
