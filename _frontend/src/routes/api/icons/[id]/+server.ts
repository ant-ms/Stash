import { json } from "@sveltejs/kit"
import prisma from "$lib/server/prisma"
import type { RequestHandler } from "./$types"

export const PATCH: RequestHandler = async ({ params, request }) => {
    const { name, svgData } = await request.json()

    const icon = await prisma.customIcon.update({
        where: { id: +params.id },
        data: { name, svgData }
    })

    return json(icon)
}

export const DELETE: RequestHandler = async ({ params }) => {
    await prisma.customIcon.delete({
        where: { id: +params.id }
    })

    return new Response(null, { status: 204 })
}
