#!/bin/sh
set -e
npx prisma migrate deploy || npx prisma db push
npx tsx prisma/seed.ts
exec node dist/index.js
