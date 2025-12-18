import { json } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

// TODO: Do we still use this?

export const GET: RequestHandler = async () => {
    const data = await prisma.clusters.findMany({
        include: {
            stories: true
        }
    })

    return json(data)
}
