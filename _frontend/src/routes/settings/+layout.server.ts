import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => {
    const [filesInMedia, mediaInDatabase] = await Promise.all([
        fs.readdir("./media/", { withFileTypes: true }),
        prisma.media.count()
    ])

    return {
        duplicates_count: (
            (await prisma.$queryRaw`
                SELECT COUNT(DISTINCT content_hash)
                FROM "Media"
                WHERE content_hash != 'IGNORED'
                    AND content_hash != 'ERROR'
                    AND content_hash IS NOT NULL
            `) as any
        )[0].count as number,
        unimported_count: Math.abs(
            filesInMedia.filter(file => file.isFile()).length - mediaInDatabase
        ),
        trash_count: await prisma.media.count({
            where: {
                deleted: true
            }
        })
    }
}
