# Stage 1 — install deps + build
FROM node:24-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MEILISEARCH_HOST
ARG NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
ARG NEXT_REVALIDATE_SECRET

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_MEILISEARCH_HOST=$NEXT_PUBLIC_MEILISEARCH_HOST \
    NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=$NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY \
    NEXT_REVALIDATE_SECRET=$NEXT_REVALIDATE_SECRET \
    NEXT_TELEMETRY_DISABLED=1

COPY frontend-web/package.json frontend-web/package-lock.json ./
RUN npm ci

COPY frontend-web/ .
RUN npm run build

# Stage 2 — minimal runtime image
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
