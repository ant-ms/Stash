import type { PageServerLoad } from './$types'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load: PageServerLoad = async ({ parent, depends }) => {
    depends("tags")

    const parentData = await parent()

    const counters: { untagged_count: number } = (await prisma.$queryRaw`
        SELECT COUNT(*) AS untagged_count
        FROM "Media"
        WHERE "clustersId" = ${parentData.cluster.id}
        AND NOT EXISTS (
            SELECT 1
            FROM unnest("Media"."tags") AS t(tag)
            WHERE tag IN ('Solo', 'Two', 'Group')
        )
    ` as any)[0]

    const stories = await prisma.story.findMany({
        where: {
            cluster: parentData.cluster
        }
    })

    return {
        counters,
        stories
    }
}
