import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
    clusterStorageUsageImages: await prisma.media.groupBy({
        by: ["clustersId"],
        _sum: {
            sizeBytes: true
        },
        where: {
            type: {
                startsWith: "image"
            }
        }
    }),
    clusterStorageUsageVideos: await prisma.media.groupBy({
        by: ["clustersId"],
        _sum: {
            sizeBytes: true
        },
        where: {
            type: {
                startsWith: "video"
            }
        }
    }),
    mediaCountByClusterImages: await prisma.media.groupBy({
        by: ["clustersId"],
        _count: {
            id: true
        },
        where: {
            type: {
                startsWith: "image"
            }
        }
    }),
    mediaCountByClusterVideos: await prisma.media.groupBy({
        by: ["clustersId"],
        _count: {
            id: true
        },
        where: {
            type: {
                startsWith: "video"
            }
        }
    })
})
