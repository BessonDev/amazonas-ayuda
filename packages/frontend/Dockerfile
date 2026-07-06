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

RUN echo "=== BUILDER: .next/ ===" && ls -la packages/frontend/.next/ && \
    echo "--- static dir ---" && ls -la packages/frontend/.next/static/ 2>&1 && \
    echo "--- standalone/ ===" && ls -la packages/frontend/.next/standalone/packages/frontend/ 2>&1 && \
    echo "--- public/ ---" && ls -la packages/frontend/public/ 2>&1 && \
    echo "--- find static files ---" && find packages/frontend/.next -name '*.css' -type f 2>/dev/null | head -5

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY --from=builder /app/packages/frontend/.next/standalone ./
COPY --from=builder /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

RUN echo "=== RUNNER: .next/ ===" && ls -la packages/frontend/.next/ && \
    echo "--- static dir ---" && ls -la packages/frontend/.next/static/ 2>&1 && \
    echo "--- public ---" && ls -la packages/frontend/public/ 2>&1

EXPOSE 3000
ENV PORT=3000
CMD ["node", "packages/frontend/server.js"]
