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

RUN pnpm deploy --filter=@donaciones/backend /prod

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

COPY --from=builder /prod .

EXPOSE 4000
CMD ["node", "packages/backend/dist/src/main"]
