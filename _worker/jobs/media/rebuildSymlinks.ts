import { rm, mkdir, symlink } from "fs/promises";
import { join } from "path";
import { type Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";

const hierarchyRoot = "./hierarchy";
const mediaRoot = "./media";

export const execute = async (_job: Job) => {
  // Remove old hierarchy
  await rm(hierarchyRoot, { recursive: true, force: true });
  await mkdir(hierarchyRoot, { recursive: true });

  const rows = await prisma.$queryRaw<
    {
      tagId: number;
      tagName: string;
      mediaId: string;
      mediaName: string;
      mediaType: string;
    }[]
  >`
    SELECT t.id AS "tagId", t.tag AS "tagName", m.id AS "mediaId", m.name AS "mediaName", m.type AS "mediaType"
    FROM "Tags" t
    LEFT JOIN "_MediaToTags" tm ON t.id = tm."B"
    RIGHT JOIN "Media" m ON tm."A" = m.id
    WHERE t."parentId" = 45
  `;

  for (const row of rows) {
    if (!row.mediaType?.startsWith("video")) continue;

    const dirPath = join(hierarchyRoot, `${row.tagName}_${row.tagId}`);
    await mkdir(dirPath, { recursive: true });

    const symlinkPath = join(dirPath, `${row.mediaName}_${row.mediaId}.mp4`);
    const targetPath = join(mediaRoot, row.mediaId);
    await symlink(targetPath, symlinkPath);
  }

  console.log("Symlinks rebuilt successfully");
};
