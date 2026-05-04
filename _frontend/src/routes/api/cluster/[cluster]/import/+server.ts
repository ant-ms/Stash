import fs from "fs/promises"

import { json } from "@sveltejs/kit"
import mime from "mime-types"

import { createPostUploadJobs } from "$lib/server/actions/create-post-upload-jobs"
import { createPreUploadMediaEntry } from "$lib/server/actions/create-pre-upload-media-entry"

import type { RequestHandler } from "./$types"

const importFolderPath = "./importables"

export const GET: RequestHandler = async () =>
    json(
        (await fs.readdir(importFolderPath, { withFileTypes: true }))
            .filter(f => f.isFile() && !f.name.startsWith("."))
            .map(f => f.name)
    )

export const POST: RequestHandler = async ({ params, request }) => {
    const {
        filename,
        selectedTags
    }: { filename: string; selectedTags: number[] } = await request.json()

    const type = mime.lookup(`${importFolderPath}/${filename}`) || "Unknown"

    const mediaId = await createPreUploadMediaEntry({
        name: filename,
        type,
        clusterName: params.cluster,
        tagIds: selectedTags
    })

    await fs.copyFile(`${importFolderPath}/${filename}`, `./media/${mediaId}`)
    await fs.rm(`${importFolderPath}/${filename}`)

    await createPostUploadJobs(mediaId, type)

    return new Response()
}
