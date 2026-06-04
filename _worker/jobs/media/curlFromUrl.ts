import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const mediaRoot = "./media";

export const execute = async (job: Job) => {
  const { id, url } = await parse(job.data, job);

  const media = await prisma.media.findUniqueOrThrow({ where: { id } });

  const destPath = path.join(mediaRoot, id);

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
  if (contentType && contentType.includes("text/html")) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["URL returned an HTML page instead of a media file."],
      },
    });
    throw new Error("Cannot import an HTML page as media.");
  }

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

  // Queue post-upload jobs
  await prisma.job.create({
    data: {
      name: "updateMediaMetadataFromFile",
      data: JSON.stringify({ id, initial: true }),
      priority: 15,
    },
  });
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
