import type { RequestHandler } from '@sveltejs/kit'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const PUT: RequestHandler = async ({ params, request }) => {
    const { name } = await request.json()

    await prisma.media.update({
        data: {
            tags: {
                push: name.toLocaleLowerCase()
            }
        },
        where: {
            id: params.media
        }
    })

    return new Response()

}