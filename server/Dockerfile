# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN npm ci

# Copy the rest and compile.
COPY tsconfig.json ./
COPY src ./src
COPY migrate.js ./

# Generate the Prisma client (imported by src/lib/prisma.ts) and compile.
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npx tsc

# ---- Runtime stage ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# migrate.js runs `npx prisma migrate deploy`, so the prisma CLI and the
# generated client are required at runtime; keep the full dependency tree.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrate.js ./migrate.js
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE 4001

# Apply migrations, then start the API.
CMD ["sh", "-c", "node migrate.js && node dist/src/index.js"]
