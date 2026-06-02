import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
    const mediaSources = await prisma.mediaSource.findMany({
        orderBy: { id: "asc" }
    })
    return { mediaSources }
}
