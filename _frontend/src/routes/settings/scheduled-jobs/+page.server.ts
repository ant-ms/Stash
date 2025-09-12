import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"
import fs from "fs/promises"

export const load: PageServerLoad = async () => {
    const countTotalMedia = prisma.media.count()

    const countTotalImages = prisma.media.count({
        where: {
            type: {
                startsWith: "image"
            }
        }
    })

    const countTotalVideos = prisma.media.count({
        where: {
            type: {
                startsWith: "video"
            }
        }
    })

    return {
        aiTagMatching: {
            idsStillUnprocessed: prisma.media.findMany({
                where: {
                    type: {
                        startsWith: "image"
                    },
                    visualAiMatchingVersion: {
                        lt: 1
                    }
                },
                select: {
                    id: true
                }
            }),
            countProcessed: prisma.media.count({
                where: {
                    type: {
                        startsWith: "image"
                    },
                    visualAiMatchingVersion: {
                        gt: 0
                    }
                }
            }),
            countApplicable: countTotalImages,
            countScheduled: prisma.job.count({
                where: {
                    name: "attemptManualTagging"
                }
            })
        },

        gatherPerceivedLoudness: {
            idsStillUnprocessed: prisma.media.findMany({
                where: {
                    type: {
                        startsWith: "video"
                    },
                    suggestedVolumePercent: {
                        equals: null
                    }
                },
                select: {
                    id: true
                }
            }),
            countProcessed: prisma.media.count({
                where: {
                    type: {
                        startsWith: "video"
                    },
                    suggestedVolumePercent: {
                        not: {
                            equals: null
                        }
                    }
                }
            }),
            countApplicable: countTotalVideos,
            countScheduled: prisma.job.count({
                where: {
                    name: "gatherPerceivedLoudness"
                }
            })
        },

        createMediaThumbnail: {
            idsStillUnprocessed: new Promise(async resolve => {
                const thumbnails = (await fs.readdir("./thumbnails")).filter(file => file.endsWith(".webp"));
                const thumbnailIds = new Set(thumbnails.map(id => id.replace(".webp", "")));

                const allMedia = await prisma.media.findMany({
                    select: { id: true }
                });

                const mediaIdsWithoutThumbnails = allMedia
                    .map(m => m.id)
                    .filter(id => !thumbnailIds.has(id));

                resolve(mediaIdsWithoutThumbnails);
            }) as Promise<string[]>,
            countApplicable: countTotalMedia,
            countScheduled: prisma.job.count({
                where: {
                    name: "createMediaThumbnail"
                }
            })
        }
    }
}
