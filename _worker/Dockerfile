FROM oven/bun:1 as builder

RUN apt-get update && \
    apt-get install -y ffmpeg exiftool python3 curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*
COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

COPY _worker/package.json _worker/bun.lock ./
RUN bun install --frozen-lockfile
COPY schema.prisma .
RUN bunx prisma generate

COPY _worker/ .

CMD bun run index.ts
