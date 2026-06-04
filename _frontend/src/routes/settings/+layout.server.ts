import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => {
    const [filesInMedia, mediaRecords] = await Promise.all([
        fs.readdir("./media/", { withFileTypes: true }),
        prisma.media.findMany({ select: { id: true } })
    ])

    const mediaIdSet = new Set(mediaRecords.map(record => record.id))

    return {
        duplicates_count: (
            (await prisma.$queryRaw`
                SELECT COUNT(DISTINCT content_hash)
                FROM "Media"
                WHERE content_hash != 'IGNORED'
                    AND content_hash != 'ERROR'
                    AND content_hash IS NOT NULL
                    AND "clustersId" != 3
            `) as any
        )[0].count as number,
        unimported_count: filesInMedia
            .filter(file => file.isFile())
            .filter(file => !mediaIdSet.has(file.name.split(".")[0]))
            .length,
        trash_count: await prisma.media.count({
            where: {
                deleted: true
            }
        })
    }
}
