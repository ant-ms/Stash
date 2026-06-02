import { Job } from "../../src/generated/prisma/client";
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
    include: { tag: true, mediaSource: true },
  });
  if (!smartTag) throw new Error("SmartTag not found");
  return smartTag;
};

const setSyncStatus = async (id: number, status: string, error?: string) => {
  await prisma.smartTag.update({
    where: { id },
    data: { status, lastError: error || null, ...(status === "idle" && { lastSyncAt: new Date() }) },
  });
};

const isAlreadyProcessed = async (mediaSourceId: number, sourceId: string) => {
  const ref = await prisma.mediaSourceReference.findUnique({
    where: { mediaSourceId_sourceMediaId: { mediaSourceId, sourceMediaId: sourceId } },
  });
  return !!ref;
};

const ensurePoolTag = async (poolId: string, parentTagId: number, smartTag: any) => {
  const existing = await prisma.smartTag.findFirst({
    where: { mediaSourceId: smartTag.mediaSourceId, query: poolId, isPool: true, tag: { parentId: parentTagId } },
    include: { tag: true },
  });

  const parentTag = await prisma.tags.findUnique({ where: { id: parentTagId } });

  if (existing) {
    if (existing.tag.tag === `${parentTag?.tag} - Pool ${poolId}`) {
      const source = getSource(smartTag.mediaSource);
      const poolName = await source.resolvePoolName(poolId);
      if (poolName !== poolId) {
        await prisma.tags.update({
          where: { id: existing.tagId },
          data: { tag: `${parentTag?.tag} - Pool: ${poolName}` }
        });
      }
    }
    return existing.tagId;
  }
  
  const source = getSource(smartTag.mediaSource);
  const poolName = await source.resolvePoolName(poolId);

  const newTag = await prisma.tags.create({
    data: {
      tag: `${parentTag?.tag} - Pool: ${poolName}`,
      parentId: parentTagId,
      smartTag: { create: { mediaSourceId: smartTag.mediaSourceId, query: poolId, isPool: true } },
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

const getClusterIdForMedia = async (smartTag: any) => {
  if (smartTag.tag.clusters && smartTag.tag.clusters.length > 0) {
    return smartTag.tag.clusters[0].id;
  }
  const cluster = await prisma.clusters.findFirst({ orderBy: { id: "asc" } });
  if (cluster) return cluster.id;

  const newCluster = await prisma.clusters.create({
    data: { name: "Default", icon: "fa-solid fa-folder", type: "normal" },
  });
  return newCluster.id;
};

const createLocalMedia = async (remoteMedia: SourceMedia, smartTag: any, tagsToAssign: number[]) => {
  let media = remoteMedia.md5
    ? await prisma.media.findFirst({ where: { content_hash: remoteMedia.md5 } })
    : null;

  const isNew = !media;

  if (!media) {
    media = await prisma.media.create({
      data: {
        name: `${smartTag.mediaSource.name} - ${remoteMedia.sourceId}`,
        type: getMediaType(remoteMedia.ext),
        width: remoteMedia.width,
        height: remoteMedia.height,
        content_hash: remoteMedia.md5 || null,
        clustersId: await getClusterIdForMedia(smartTag),
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

const processMedia = async (remoteMedia: SourceMedia, smartTag: any) => {
  if (await isAlreadyProcessed(smartTag.mediaSourceId, remoteMedia.sourceId)) return;

  const tagsToAssign = await resolveTagsToAssign(remoteMedia, smartTag);
  await createLocalMedia(remoteMedia, smartTag, tagsToAssign);
};

export const execute = async (job: Job) => {
  const smartTagId = getSmartTagId(job.data);
  const smartTag = await fetchSmartTag(smartTagId);

  if (smartTag.isPool && smartTag.tag.tag.match(/ - Pool \d+$/)) {
    const source = getSource(smartTag.mediaSource);
    const poolName = await source.resolvePoolName(smartTag.query);
    if (poolName !== smartTag.query) {
      const newTagName = smartTag.tag.tag.replace(/ - Pool \d+$/, ` - Pool: ${poolName}`);
      await prisma.tags.update({
        where: { id: smartTag.tagId },
        data: { tag: newTagName }
      });
      smartTag.tag.tag = newTagName;
    }
  }

  await setSyncStatus(smartTagId, "syncing");

  try {
    const source = getSource(smartTag.mediaSource);
    const mediaList = await source.fetchMedia(smartTag.query, { isPool: smartTag.isPool });

    mediaList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const remoteMedia of mediaList) {
      await processMedia(remoteMedia, smartTag);
    }

    await setSyncStatus(smartTagId, "idle");
  } catch (error: any) {
    await setSyncStatus(smartTagId, "error", error.message);
    throw error;
  }
};
