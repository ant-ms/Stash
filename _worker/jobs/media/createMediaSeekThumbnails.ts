import { Job } from "@prisma/client";
import prisma from "../../prisma";

const mediaRoot = "./media";
const thumbnailRoot = "./thumbnails";
import ffmpeg from "fluent-ffmpeg";

export const execute = async (job: Job) => {
  const { id } = await parse(job.data, job);

  await new Promise((resolve, reject) => {
    try {
      ffmpeg()
        .input(`${mediaRoot}/${id}`)
        .complexFilter([
          `scale=w=${250}:h=${250}:force_original_aspect_ratio=decrease,fps=1/10[v]`,
        ])
        .outputOptions(["-map", "[v]"])
        .output(`${thumbnailRoot}/${id}_seek.webm`)
        .on("progress", async (progress) => {
          await prisma.job.update({
            where: { id: job.id },
            data: {
              completionPercentage: progress.percent || -1,
            },
          });
        })
        .on("end", resolve)
        .on("error", async (error) => {
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: "failed",
              debugMessages: ["Could not generate thumbnail 2", error.message],
            },
          });
          reject(error);
        })
        .run();
    } catch (error: any) {
      reject(error);
    }
  }).catch(async (error) => {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Could not generate thumbnail", error.message],
      },
    });
  });
};

const parse = async (
  data: any,
  job: Job,
): Promise<{
  id: string;
}> => {
  const json = JSON.parse(data);

  if (!json.id) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data"] },
    });
    throw new Error();
  }

  const media = await prisma.media.findFirst({ where: { id: json.id } });

  if (!media) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  if (!media.type.startsWith("video")) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Can only process videos but got " + media.type],
      },
    });
    throw new Error();
  }

  return json;
};
