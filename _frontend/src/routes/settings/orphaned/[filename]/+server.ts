import fs from "fs/promises"

import { json } from "@sveltejs/kit"
import mime from "mime-types"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ params, request }) => {
    const { cluster } = await request.json()
    const id = params.filename

    if (!id || !cluster)
        return json({ error: "Missing parameters" }, { status: 400 })

    await prisma.media.create({
        data: {
            id,
            name: "Unknown",
            type: mime.lookup(`./media/${id}`) || "Unknown",
            date: new Date(),
            height: 0,
            width: 0,
            cluster: {
                connect: {
                    id: cluster
                }
            },
            tags: [] as string[]
        }
    })

    await prisma.job.create({
        data: {
            name: "updateMediaMetadataFromFile",
            data: JSON.stringify({ id: id, initial: true }),
            priority: 15
        }
    })

    await prisma.job.create({
        data: {
            name: "createMediaThumbnail",
            data: JSON.stringify({ id: id }),
            priority: 10
        }
    })

    return new Response()
}

export const DELETE: RequestHandler = async ({ params }) => {
    const media = await prisma.media.findUnique({
        where: {
            id: params.filename
        }
    })

    if (media) {
        return json({ error: "Media found, won't delete" }, { status: 404 })
    }

    await fs.rm(`./media/${params.filename}`)

    return new Response(null, { status: 204 })
}
