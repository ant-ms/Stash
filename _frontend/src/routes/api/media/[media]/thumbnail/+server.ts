import fs from "fs/promises"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

const thumbnailRoot = "./thumbnails"

export const GET: RequestHandler = async ({ params }) => {
    try {
        return new Response(
            new Blob([
                new Uint8Array(
                    await fs.readFile(`${thumbnailRoot}/${params.media}.webp`)
                )
            ])
        )
    } catch (e: any) {
        console.error("Error generating thumbnail", e.message)

        // create thumbnail
        // TODO: this should be a await task
        await prisma.job.create({
            data: {
                name: "createMediaThumbnail",
                data: JSON.stringify({ id: params.media }),
                priority: 10
            }
        })

        return new Response("Thumbnail was unable to be found or generated!", {
            status: 500
        })
    }
}

export const POST: RequestHandler = async ({ request, params }) => {
    const data = await request.formData()
    const file = data.get("file") as File
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    await fs.rename(
        `${thumbnailRoot}/${params.media}.webp`,
        `${thumbnailRoot}/${params.media}.original.webp`
    )

    await fs.writeFile(`${thumbnailRoot}/${params.media}.webp`, fileBuffer)

    return new Response()
}
