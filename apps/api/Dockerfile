# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/api/package.json ./package.json
RUN npm install --omit=dev=false
COPY apps/api/prisma ./prisma
RUN npx prisma generate

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api/ .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && mkdir -p uploads/placeholders
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
