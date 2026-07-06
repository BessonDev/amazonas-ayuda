#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

cd /app/packages/backend

pnpm exec prisma migrate deploy

pnpm exec prisma db seed

exec node dist/src/main
