import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request, params }) => {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName) return new Response(null, { status: 400 })

    const mediaToUpdate = await prisma.media.findMany({
        where: {
            cluster: {
                name: params.cluster
            },
            tags: {
                hasSome: oldName.toLocaleLowerCase()
            }
        }
    })

    for (const i in mediaToUpdate) {
        const media = mediaToUpdate[i]
        await prisma.media.update({
            where: {
                id: media.id
            },
            data: {
                tags: [
                    ...(media.tags as string[]).filter(
                        tag => tag !== oldName.toLocaleLowerCase()
                    ),
                    newName.toLocaleLowerCase()
                ]
            }
        })
    }

    return new Response()
}
