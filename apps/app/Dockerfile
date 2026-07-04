ARG NODE_VERSION=20-alpine

# ---------- Stage 1: prune monorepo to app subset ----------
FROM node:${NODE_VERSION} AS pruner
WORKDIR /repo
RUN apk add --no-cache libc6-compat && corepack enable
COPY . .
RUN pnpm dlx turbo@^2 prune app --docker

# ---------- Stage 2: install + build ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /repo
RUN apk add --no-cache libc6-compat && corepack enable
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /repo/out/full/ .
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV SKIP_ENV_VALIDATION=1
RUN pnpm turbo build --filter=app

# ---------- Stage 3: runtime ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/app/.next/static ./apps/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/app/public ./apps/app/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/app/server.js"]
