# Stage 1: Builder
FROM node:20-alpine3.20 as builder
WORKDIR /app

RUN npm install -g pnpm
# Copy root workspace manifest and single source-of-truth lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY _frontend/package.json ./_frontend/package.json
RUN pnpm install --frozen-lockfile --filter @stash/frontend

COPY schema.prisma .
RUN pnpx prisma generate

COPY _frontend/static ./_frontend/static
COPY _frontend/tsconfig.json _frontend/mdi-svelte.d.ts ./_frontend/
COPY _frontend/*.config.js ./_frontend/
COPY _frontend/.*rc* ./_frontend/
COPY _frontend/src ./_frontend/src

WORKDIR /app/_frontend
RUN pnpm run build && CI=true pnpm prune --prod

# Stage 2: Final stage with optimized production image
FROM node:20-alpine3.20

WORKDIR /app/_frontend
COPY --from=builder /app/_frontend ./

ENV NODE_ENV=production
CMD BODY_SIZE_LIMIT="Infinity" node build
