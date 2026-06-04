import fs from "fs/promises"

import { json } from "@sveltejs/kit"
import mime from "mime-types"

import prisma from "$lib/server/prisma"
import { createPostUploadJobs } from "$lib/server/actions/create-post-upload-jobs"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ params, request }) => {
    const { cluster } = await request.json()
    const id = params.filename

    if (!id || !cluster)
        return json({ error: "Missing parameters" }, { status: 400 })

    const type = mime.lookup(`./media/${id}`) || "Unknown"

    await prisma.media.create({
        data: {
            id,
            name: "Unknown",
            type,
            date: new Date(),
            height: 0,
            width: 0,
            cluster: {
                connect: {
                    id: cluster
                }
            }
        }
    })

    await createPostUploadJobs(id, type)

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
