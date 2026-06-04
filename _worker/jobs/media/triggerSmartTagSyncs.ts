import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";

export const execute = async (job: Job) => {
  const smartTags = await prisma.smartTag.findMany({
    where: {
      mediaSource: { enabled: true },
    },
  });

  const now = new Date();
  const todayDay = now.getDate();

  for (const smartTag of smartTags) {
    let shouldSync = true;

    if (smartTag.isPool) {
      const latestMedia = await prisma.media.findFirst({
        where: { tags: { some: { id: smartTag.tagId } } },
        orderBy: { date: "desc" },
        select: { date: true },
      });

      if (latestMedia) {
        const monthsSinceLatest =
          (now.getTime() - latestMedia.date.getTime()) /
          (1000 * 60 * 60 * 24 * 30);

        if (monthsSinceLatest > 2) {
          const targetDay = (smartTag.id % 28) + 1;
          if (targetDay !== todayDay) {
            shouldSync = false;
          }
        }
      } else if (smartTag.lastSyncAt) {
        const monthsSinceSync =
          (now.getTime() - smartTag.lastSyncAt.getTime()) /
          (1000 * 60 * 60 * 24 * 30);
        if (monthsSinceSync > 2) {
          const targetDay = (smartTag.id % 28) + 1;
          if (targetDay !== todayDay) {
            shouldSync = false;
          }
        }
      }
    }

    if (!shouldSync) continue;

    const existing = await prisma.job.findFirst({
      where: {
        name: "smartTagSync",
        status: { in: ["created", "running"] },
        data: { contains: `"smartTagId":${smartTag.id}` },
      },
    });

    if (!existing) {
      await prisma.job.create({
        data: {
          name: "smartTagSync",
          data: JSON.stringify({ smartTagId: smartTag.id }),
          priority: 0,
        },
      });
    }
  }
};
