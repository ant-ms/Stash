FROM node:22-alpine3.20 AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY _frontend/package.json ./_frontend/package.json
RUN pnpm install --frozen-lockfile --filter @stash/frontend

COPY schema.prisma ./_frontend/schema.prisma
RUN cd _frontend && pnpm prisma generate

COPY _frontend/static ./_frontend/static
COPY _frontend/tsconfig.json _frontend/mdi-svelte.d.ts ./_frontend/
COPY _frontend/*.config.js ./_frontend/
COPY _frontend/.*rc* ./_frontend/
COPY _frontend/src ./_frontend/src

WORKDIR /app/_frontend
RUN pnpm run build

WORKDIR /app
RUN pnpm deploy --prod --offline --filter @stash/frontend /deploy

RUN cp -r _frontend/node_modules/.prisma /deploy/node_modules/ || true

FROM node:22-alpine3.20

WORKDIR /app

COPY --from=builder /deploy ./

ENV NODE_ENV=production
CMD BODY_SIZE_LIMIT="Infinity" node build
