import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import { updateMediaMetadataOfFile } from "./updateMediaMetadataFromFile";

export const execute = async (job: Job) => {
  const CONCURRENCY_LIMIT = 200;
  const allMedia = await prisma.media.findMany();
  const total = allMedia.length;

  let completed = 0;
  let index = 0;

  const workers = Array.from({ length: CONCURRENCY_LIMIT }).map(async () => {
    while (true) {
      let media;

      const currentIndex = index++;
      if (currentIndex >= total) break;
      media = allMedia[currentIndex];

      try {
        await updateMediaMetadataOfFile(media.id);
      } catch (error: any) {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            debugMessages: {
              push: [
                `Could not update metadata for media ID ${media.id}: ${error.message}`,
              ],
            },
          },
        });
      }

      completed++;
      const percentage = Math.floor((completed / total) * 100);
      await prisma.job.update({
        where: { id: job.id },
        data: {
          completionPercentage: percentage,
        },
      });
    }
  });

  await Promise.all(workers);
};
