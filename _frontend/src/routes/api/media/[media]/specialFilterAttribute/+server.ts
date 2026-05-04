import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const PUT: RequestHandler = async ({ request, params }) => {
    const { specialFilterAttribute } = await request.json()

    await prisma.media.update({
        where: {
            id: params.media
        },
        data: {
            specialFilterAttribute
        }
    })

    return new Response()
}
