FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY packages/frontend/ packages/frontend/

RUN cd packages/shared && npx tsc
RUN cd packages/frontend && pnpm next build
RUN echo "=== BUILDER STANDALONE ===" && ls -la packages/frontend/.next/standalone/ 2>/dev/null || echo "(no standalone/)"

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY --from=builder /app/packages/frontend/.next/standalone ./
RUN echo "=== STANDALONE CONTENTS ===" && ls -la && ls -laR .next/ 2>/dev/null || echo "(no .next/)"
COPY --from=builder /app/packages/frontend/.next/static ./.next/static
COPY --from=builder /app/packages/frontend/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
