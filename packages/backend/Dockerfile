FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY packages/backend/ packages/backend/

RUN cd packages/shared && npx tsc
RUN cd packages/backend && npx prisma generate && npx nest build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json packages/backend/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

EXPOSE 4000
CMD ["node", "packages/backend/dist/src/main"]
