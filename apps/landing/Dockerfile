ARG NODE_VERSION=20-alpine

# ---------- Stage 1: prune monorepo to landing subset ----------
FROM node:${NODE_VERSION} AS pruner
WORKDIR /repo
RUN apk add --no-cache libc6-compat && corepack enable
COPY . .
RUN pnpm dlx turbo@^2 prune landing --docker

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
RUN pnpm turbo build --filter=landing

# ---------- Stage 3: runtime ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/landing/public ./apps/landing/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/landing/server.js"]
