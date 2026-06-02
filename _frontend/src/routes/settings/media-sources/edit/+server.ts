import { error } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
    const { id, attribute, value } = await request.json()
    if (!id || !attribute) throw error(400)

    await prisma.mediaSource.update({
        where: { id },
        data: { [attribute]: value }
    })

    return new Response(null, { status: 200 })
}
