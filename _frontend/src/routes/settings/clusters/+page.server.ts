import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => ({
    clusterStorageUsage: await prisma.media.groupBy({
        by: ["clustersId"],
        _sum: {
            sizeBytes: true
        }
    }),
    mediaCountByCluster: await prisma.media.groupBy({
        by: ["clustersId"],
        _count: {
            id: true
        }
    })
})
