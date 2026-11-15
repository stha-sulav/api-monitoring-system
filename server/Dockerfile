
# ==========================================
# Stage 1: Build
# ==========================================
FROM node:26-alpine3.23 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build


# ==========================================
# Stage 2: Production
# ==========================================
FROM node:26-alpine3.23 AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist

# Copy additional runtime assets if your application needs them.
# COPY --from=builder --chown=node:node /app/ui ./ui

RUN mkdir -p /app/logs && chown node:node /app/logs

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
