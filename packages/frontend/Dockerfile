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
RUN echo "=== BUILDER STANDALONE ===" && ls -la packages/frontend/.next/standalone/ 2>/dev/null; echo "--- standalone/packages/frontend ---" && ls -la packages/frontend/.next/standalone/packages/frontend/ 2>/dev/null; echo "--- packages/frontend/.next ---" && ls -la packages/frontend/.next/standalone/packages/frontend/.next/ 2>/dev/null

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY --from=builder /app/packages/frontend/.next/standalone ./
RUN echo "=== RUNNER ROOT ===" && ls -la; echo "--- packages/frontend ---" && ls -la packages/frontend/ 2>/dev/null; echo "--- packages/frontend/.next ---" && ls -la packages/frontend/.next/ 2>/dev/null; echo "--- looking for server.js ---" && find . -name "server.js" -not -path "*/node_modules/*" 2>/dev/null

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
