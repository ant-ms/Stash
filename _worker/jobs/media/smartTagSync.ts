import { Job, SmartTag } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import { getSource } from "../../lib/sources";
import { SourceMedia } from "../../lib/sources/types";

const getSmartTagId = (jobData: string): number => {
  try {
    return JSON.parse(jobData).smartTagId;
  } catch {
    throw new Error("Invalid job data: missing smartTagId");
  }
};

const fetchSmartTag = async (id: number) => {
  const smartTag = await prisma.smartTag.findUnique({
    where: { id },
    include: {
      tag: {
        include: {
          clusters: true,
        },
      },
      mediaSource: true,
    },
  });
  if (!smartTag) throw new Error("SmartTag not found");
  return smartTag;
};

const setSyncStatus = async (id: number, status: string, error?: string) => {
  await prisma.smartTag.update({
    where: { id },
    data: {
      status,
      lastError: error || null,
      ...(status === "idle" && { lastSyncAt: new Date() }),
    },
  });
};

const isAlreadyProcessed = async (mediaSourceId: number, sourceId: string) => {
  const ref = await prisma.mediaSourceReference.findUnique({
    where: {
      mediaSourceId_sourceMediaId: { mediaSourceId, sourceMediaId: sourceId },
    },
  });
  return !!ref;
};

const ensurePoolTag = async (
  poolId: string,
  parentTagId: number,
  smartTag: Awaited<ReturnType<typeof fetchSmartTag>>,
) => {
  const existing = await prisma.smartTag.findFirst({
    where: {
      mediaSourceId: smartTag.mediaSourceId,
      query: poolId,
      isPool: true,
      tag: { parentId: parentTagId },
    },
    include: { tag: true },
  });

  if (existing) {
    if (existing.tag.tag.includes(" - Pool")) {
      const source = getSource(smartTag.mediaSource);
      const poolName = await source.resolvePoolName(poolId);
      if (poolName !== existing.tag.tag) {
        await prisma.tags.update({
          where: { id: existing.tagId },
          data: { tag: poolName },
        });
      }
    }
    return existing.tagId;
  }

  const source = getSource(smartTag.mediaSource);
  const poolName = await source.resolvePoolName(poolId);

  const newTag = await prisma.tags.create({
    data: {
      tag: poolName,
      parentId: parentTagId,
      clusters: {
        connect: smartTag.tag.clusters.map((c: any) => ({ id: c.id })),
      },
      smartTag: {
        create: {
          mediaSourceId: smartTag.mediaSourceId,
          query: poolId,
          isPool: true,
        },
      },
    },
  });

  return newTag.id;
};

const resolveTagsToAssign = async (remoteMedia: SourceMedia, smartTag: any) => {
  if (smartTag.isPool || !remoteMedia.pools?.length) return [smartTag.tagId];

  const tagIds = [];
  for (const poolId of remoteMedia.pools) {
    tagIds.push(await ensurePoolTag(poolId, smartTag.tagId, smartTag));
  }
  return tagIds;
};

const getMediaType = (ext: string): string => {
  const typeMap: Record<string, string> = {
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    webm: "video/webm",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return typeMap[ext.toLowerCase()] || "image/jpeg";
};

const createLocalMedia = async (
  remoteMedia: SourceMedia,
  smartTag: ReturnType<typeof fetchSmartTag>,
  tagsToAssign: number[],
) => {
  let media = remoteMedia.md5
    ? await prisma.media.findFirst({ where: { content_hash: remoteMedia.md5 } })
    : null;

  const isNew = !media;

  if (!media) {
    // TODO: This should be made more reliable
    const clustersId = (await smartTag).tag.clusters[0].id;

    media = await prisma.media.create({
      data: {
        name: `${smartTag.mediaSource.name} - ${remoteMedia.sourceId}`,
        type: getMediaType(remoteMedia.ext),
        width: remoteMedia.width,
        height: remoteMedia.height,
        content_hash: remoteMedia.md5 || null,
        clustersId,
      },
    });
  }

  await prisma.media.update({
    where: { id: media.id },
    data: { tags: { connect: tagsToAssign.map((id) => ({ id })) } },
  });

  await prisma.mediaSourceReference.create({
    data: {
      mediaId: media.id,
      mediaSourceId: smartTag.mediaSourceId,
      sourceMediaId: remoteMedia.sourceId,
    },
  });

  if (isNew) {
    await prisma.job.create({
      data: {
        name: "curlFromUrl",
        data: JSON.stringify({ id: media.id, url: remoteMedia.url }),
        priority: 5,
      },
    });
  }
};

export const execute = async (job: Job) => {
  const smartTagId = getSmartTagId(job.data);
  const smartTag = await fetchSmartTag(smartTagId);

  if (smartTag.isPool && smartTag.tag.tag.includes(" - Pool")) {
    const source = getSource(smartTag.mediaSource);
    const poolName = await source.resolvePoolName(smartTag.query);
    if (poolName !== smartTag.tag.tag) {
      await prisma.tags.update({
        where: { id: smartTag.tagId },
        data: { tag: poolName },
      });
      smartTag.tag.tag = poolName;
    }
  }

  await setSyncStatus(smartTagId, "syncing");

  try {
    const source = getSource(smartTag.mediaSource);

    let mapping: any = {};
    try {
      mapping = JSON.parse(smartTag.mediaSource.mapping);
    } catch {}

    let page = mapping.pageStart ?? 1;
    let keepFetching = true;

    while (keepFetching) {
      const mediaList = await source.fetchMedia(smartTag.query, {
        isPool: smartTag.isPool,
        page,
      });
      if (mediaList.length === 0) break;

      let anyNewProcessed = false;

      // Process sequentially to maintain order and detect if we already have them
      for (const remoteMedia of mediaList) {
        if (
          !(await isAlreadyProcessed(
            smartTag.mediaSourceId,
            remoteMedia.sourceId,
          ))
        ) {
          anyNewProcessed = true;
          const tagsToAssign = await resolveTagsToAssign(remoteMedia, smartTag);
          await createLocalMedia(remoteMedia, smartTag, tagsToAssign);
        }
      }

      if (!anyNewProcessed) {
        keepFetching = false;
      } else {
        page += 1;
        await new Promise((r) => setTimeout(r, 1000)); // Be nice to APIs
      }
    }

    await setSyncStatus(smartTagId, "idle");
  } catch (error: any) {
    await setSyncStatus(smartTagId, "error", error.message);
    throw error;
  }
};
