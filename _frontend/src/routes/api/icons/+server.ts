import { json } from "@sveltejs/kit"
import prisma from "$lib/server/prisma"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async () => {
    const icons = await prisma.customIcon.findMany()
    return json(icons)
}

export const POST: RequestHandler = async ({ request }) => {
    const { name, svgData } = await request.json()

    if (!name || !svgData) {
        return new Response("Missing name or svgData", { status: 400 })
    }

    const icon = await prisma.customIcon.create({
        data: { name, svgData }
    })

    return json(icon)
}
