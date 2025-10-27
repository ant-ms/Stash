import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load = (async ({ cookies }) => {
    const mediaInTrash = await prisma.media.findMany({
        where: {
            deleted: true
        }
    })

    return {
        mediaInTrash
    }
}) satisfies PageServerLoad
