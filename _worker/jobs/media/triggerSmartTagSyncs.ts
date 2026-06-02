import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";

export const execute = async (job: Job) => {
  const smartTags = await prisma.smartTag.findMany({
    where: {
      mediaSource: { enabled: true }
    }
  });

  for (const smartTag of smartTags) {
    const existing = await prisma.job.findFirst({
      where: {
        name: "smartTagSync",
        status: { in: ["created", "running"] },
        data: { contains: `"smartTagId":${smartTag.id}` }
      }
    });

    if (!existing) {
      await prisma.job.create({
        data: {
          name: "smartTagSync",
          data: JSON.stringify({ smartTagId: smartTag.id }),
          priority: 0
        }
      });
    }
  }
};
