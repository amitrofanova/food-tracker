# ---- Stage 1: install monorepo deps (shared cache) ----
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN yarn install --frozen-lockfile --network-timeout 600000

# ---- Stage 2: Build Vue client ----
FROM deps AS client-builder

COPY client ./client
RUN yarn workspace food-tracker-client build-only

# ---- Stage 3: Build server ----
FROM deps AS server-builder

# prisma generate needs DATABASE_URL to parse prisma.config.ts
# A dummy value is fine — no real DB connection during generation
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5433/dummy

COPY server ./server
RUN yarn workspace server build

# ---- Stage 4: Production runtime ----
FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN yarn install --production --frozen-lockfile --network-timeout 600000 \
  && yarn cache clean

# Compiled server (dist/server.js expects ../public)
COPY --from=server-builder /app/server/dist ./dist

# Built Vue SPA — Fastify serves this as static files
COPY --from=client-builder /app/client/dist ./public

# Prisma schema and migrations (needed for `prisma migrate deploy`)
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/prisma.config.ts ./prisma.config.ts

EXPOSE 3001

# Run pending migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
