# OIDC Mock Server Dockerfile
# Provides OAuth2/OIDC authentication mocking for development

FROM node:22-alpine

# Install tini for proper signal handling
RUN apk add --no-cache tini \
    && addgroup -g 1001 -S nodejs \
    && adduser -S mockuser -u 1001

WORKDIR /app

# Copy package files
COPY samples/oidc-mock-server/package.json ./
COPY samples/oidc-mock-server/server.mjs ./

# Install dependencies
RUN npm install

# Set environment
ENV NODE_ENV=development

EXPOSE 8080

# Switch to non-root user
USER mockuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/.well-known/openid_configuration || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.mjs"]