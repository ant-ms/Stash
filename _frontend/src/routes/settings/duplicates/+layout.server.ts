import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => ({
    duplicates: (await prisma.$queryRaw`
    SELECT
        content_hash,
        ARRAY_AGG(id) AS media_ids
    FROM
        "Media"
    WHERE
        content_hash != 'IGNORED'
        AND content_hash != 'ERROR'
        AND content_hash IS NOT NULL
        AND "clustersId" != 3
    GROUP BY
        content_hash
    HAVING
        COUNT(*) > 1
    LIMIT 7
  `) as { content_hash: string; media_ids: string[] }[]
})
