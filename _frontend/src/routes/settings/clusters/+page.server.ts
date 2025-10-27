import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent }) => {
    const { clusters } = await parent()

    const clusterStorageUsageImages = await prisma.media.groupBy({
        by: ["clustersId"],
        _sum: {
            sizeBytes: true
        },
        where: {
            type: {
                startsWith: "image"
            }
        }
    })
    const clusterStorageUsageVideos = await prisma.media.groupBy({
        by: ["clustersId"],
        _sum: {
            sizeBytes: true
        },
        where: {
            type: {
                startsWith: "video"
            }
        }
    })
    const mediaCountByClusterImages = await prisma.media.groupBy({
        by: ["clustersId"],
        _count: {
            id: true
        },
        where: {
            type: {
                startsWith: "image"
            }
        }
    })
    const mediaCountByClusterVideos = await prisma.media.groupBy({
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

    const totalStorage =
        clusterStorageUsageImages.reduce(
            (acc, c) => acc + Number(c._sum.sizeBytes || 0),
            0
        ) +
        clusterStorageUsageVideos.reduce(
            (acc, c) => acc + Number(c._sum.sizeBytes || 0),
            0
        )

    const clustersWithUsage = clusters.map(cluster => {
        const imageUsage = Number(
            clusterStorageUsageImages.find(c => c.clustersId === cluster.id)
                ?._sum.sizeBytes || 0
        )
        const videoUsage = Number(
            clusterStorageUsageVideos.find(c => c.clustersId === cluster.id)
                ?._sum.sizeBytes || 0
        )
        const percentage =
            totalStorage > 0
                ? ((imageUsage + videoUsage) / totalStorage) * 100
                : 0

        return {
            ...cluster,
            imageUsage,
            videoUsage,
            percentage
        }
    })

    return {
        clusters: clustersWithUsage,
        mediaCountByClusterImages,
        mediaCountByClusterVideos
    }
}
