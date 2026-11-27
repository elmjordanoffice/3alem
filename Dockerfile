# syntax=docker/dockerfile:1.7
#
# Aalim production image: the web app, and with another command the worker,
# migrations or the seed. Includes headless Chromium for PDF export.
#
#   docker build -t aalim .
#   docker run --env-file .env.production -p 3000:3000 aalim               # web
#   docker run --env-file .env.production aalim npm run worker             # worker (needs REDIS_URL)
#   docker run --env-file .env.production aalim npx prisma migrate deploy  # migrations
#   docker run --env-file .env.production aalim npm run db:seed            # framework, once
#
# Set MIGRATE_ON_START=1 to run migrations each time the web container starts
# (handy on a single server; on a platform, use its release command instead).
# See docs/deploy.md.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# OpenSSL for Prisma's migration engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1. Every dependency, for the build.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 2. Build, then drop development-only packages.
FROM base AS build
# Placeholders so modules load while Next collects page data. Nothing connects at build
# time (port 1 refuses at once if anything tried); real values are set at runtime.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:1/build" \
    DATABASE_APP_URL="postgresql://build:build@127.0.0.1:1/build"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev --no-audit --no-fund \
 && rm -rf .next/cache

# 3. Runtime.
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=build /app/node_modules ./node_modules
# Headless Chromium (the version this playwright-core expects) and its system libraries, for PDF export.
RUN npx playwright-core install --with-deps --only-shell chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/messages ./messages
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json /app/prisma.config.ts /app/next.config.ts /app/tsconfig.json ./
COPY docker-entrypoint.sh /usr/local/bin/aalim-entrypoint
RUN chmod +x /usr/local/bin/aalim-entrypoint && mkdir -p .mail && chown node:node /app /app/.mail

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
ENTRYPOINT ["aalim-entrypoint"]
CMD ["sh", "-c", "exec node_modules/.bin/next start -p \"${PORT:-3000}\""]
