FROM oven/bun:1 as builder

RUN apt-get update && \
    apt-get install -y ffmpeg exiftool && \
    rm -rf /var/lib/apt/lists/*
COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY schema.prisma .
RUN bunx prisma generate

COPY . .

CMD bun run index.ts
