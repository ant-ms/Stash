import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

const mediaRoot = "./media"

export const GET: RequestHandler = async ({ params }) => {
    const { id, name, type } = await prisma.media.findUniqueOrThrow({
        where: { id: params.media }
    })

    const fileBuffer = await fs.readFile(`${mediaRoot}/${id}`)

    return new Response(new Blob([new Uint8Array(fileBuffer)]), {
        headers: {
            "Content-Type": type,
            "Content-Disposition": `attachment; filename="${name}"`
        }
    })
}
