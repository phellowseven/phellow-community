# Main application Dockerfile - supports both development and production
# Usage:
#   Development: docker build --target development -t app:dev .
#   Production:  docker build --target production -t app:prod .

FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    tini \
    curl

# Install pnpm globally
RUN npm install -g pnpm@9.15.4

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
COPY project.inlang/ ./project.inlang/

# Install dependencies
RUN pnpm install --frozen-lockfile

#####################
# Development stage #
#####################
FROM base AS development

COPY drizzle.config.ts ./

# Set development environment
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 5173

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

###############
# Build stage #
###############
FROM base AS builder

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

####################
# Production stage #
####################
FROM node:22-alpine AS production

# Install system dependencies
RUN apk add --no-cache tini

WORKDIR /home/node/app

# Copy built application and production dependencies
COPY --from=builder /home/node/app/build ./build
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/index.js"]