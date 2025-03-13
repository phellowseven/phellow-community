# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
# Copy source files and build the application
COPY . .
RUN npm install  --legacy-peer-deps
RUN npm run build

# /Builder stage

# Final stage
FROM node:20-alpine

# RUN apk add --no-cache tini

WORKDIR /dist

# Copy built files from the builder stage
COPY --from=builder /app/build /dist
COPY --from=builder /app/package.json /dist/package.json
COPY --from=builder /app/node_modules /dist/node_modules

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/dist"]