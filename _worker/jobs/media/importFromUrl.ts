import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const mediaRoot = "./media";

export const execute = async (job: Job) => {
  const { id, url } = await parse(job.data, job);

  const media = await prisma.media.findUniqueOrThrow({ where: { id } });

  const destPath = path.join(mediaRoot, id);

  // Try yt-dlp first
  const ytdlpPath = process.env.YTDLP_PATH ?? "yt-dlp";
  const tmpId = randomUUID();
  const tmpTemplate = `/tmp/${tmpId}.%(ext)s`;

  let downloadedViaYtDlp = false;

  try {
    const ytdlp = Bun.spawn(
      [ytdlpPath, "-o", tmpTemplate, "--no-playlist", url],
      { stdout: "pipe", stderr: "pipe" }
    );
    const exitCode = await ytdlp.exited;

    if (exitCode === 0) {
      // Find the file that was downloaded
      const tmpDir = "/tmp";
      const tmpFiles = await fs.readdir(tmpDir);
      const downloaded = tmpFiles.find((f) => f.startsWith(tmpId));

      if (downloaded) {
        await fs.rename(path.join(tmpDir, downloaded), destPath);
        downloadedViaYtDlp = true;

        // Detect type from extension
        const ext = path.extname(downloaded).toLowerCase().slice(1);
        const typeMap: Record<string, string> = {
          mp4: "video/mp4",
          mkv: "video/x-matroska",
          webm: "video/webm",
          mov: "video/quicktime",
          avi: "video/x-msvideo",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        const detectedType = typeMap[ext] ?? media.type;

        if (detectedType !== media.type) {
          await prisma.media.update({
            where: { id },
            data: { type: detectedType },
          });
          media.type = detectedType;
        }
      }
    }
  } catch {
    // yt-dlp not available or failed — fall through to direct fetch
  }

  if (!downloadedViaYtDlp) {
    // Fall back to direct HTTP fetch
    const res = await fetch(url);
    if (!res.ok) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "failed",
          debugMessages: [`HTTP fetch failed: ${res.status} ${res.statusText}`],
        },
      });
      throw new Error(`HTTP fetch failed: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType !== media.type) {
      const baseType = contentType.split(";")[0].trim();
      await prisma.media.update({
        where: { id },
        data: { type: baseType },
      });
      media.type = baseType;
    }

    const fileHandle = await fs.open(destPath, "w");
    try {
      // @ts-ignore — Bun/Node body is a ReadableStream
      await pipeline(Readable.fromWeb(res.body as any), fileHandle.createWriteStream());
    } finally {
      await fileHandle.close();
    }
  }

  // Queue post-upload jobs (matching createPostUploadJobs in the frontend)
  await prisma.job.create({
    data: {
      name: "updateMediaMetadataFromFile",
      data: JSON.stringify({ id, initial: true }),
      priority: 15,
    },
  });

  await prisma.job.create({
    data: {
      name: "createMediaThumbnail",
      data: JSON.stringify({ id }),
      priority: 10,
      waitFor: "updateMediaMetadataFromFile",
    },
  });

  if (media.type.startsWith("video")) {
    await prisma.job.create({
      data: {
        name: "createMediaSeekThumbnails",
        data: JSON.stringify({ id }),
        waitFor: "updateMediaMetadataFromFile",
      },
    });
    await prisma.job.create({
      data: {
        name: "gatherPerceivedLoudness",
        data: JSON.stringify({ id }),
        waitFor: "updateMediaMetadataFromFile",
      },
    });
  }
};

const parse = async (
  data: any,
  job: Job
): Promise<{ id: string; url: string }> => {
  let json: any;
  try {
    json = JSON.parse(data);
  } catch {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data (JSON parse failed)"] },
    });
    throw new Error("Invalid job data");
  }

  if (!json.id || typeof json.id !== "string") {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data: missing id"] },
    });
    throw new Error("Invalid job data: missing id");
  }

  if (!json.url || typeof json.url !== "string") {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data: missing url"] },
    });
    throw new Error("Invalid job data: missing url");
  }

  if (!(await prisma.media.findFirst({ where: { id: json.id } }))) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error("No media with given id");
  }

  return { id: json.id, url: json.url };
};
