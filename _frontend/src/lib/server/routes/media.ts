import { MEDIA_ROOT, THUMBNAIL_ROOT } from "$lib/constants"
import prisma from "../prisma"
import fs from "fs/promises"

export const markMediaAsDeleted = async (d: { mediaId: string }) => {
    await prisma.media.update({
        where: {
            id: d.mediaId
        },
        data: {
            deleted: true
        }
    })
}

export const permanentlyDeleteMedia = async (d: { mediaId: string }) => {
    await fs.rm(`${THUMBNAIL_ROOT}/${d.mediaId}.webp`, {force: true, recursive: false}) // TODO: Also delete old thumbnails? (should probably rework that)
    await fs.rm(`${THUMBNAIL_ROOT}/${d.mediaId}_seek.webm`, {force: true, recursive: false})
    await fs.rm(`${MEDIA_ROOT}/${d.mediaId}`, {force: true, recursive: false})

    await prisma.media.delete({
        where: {
            id: d.mediaId
        }
    })
}

export const renameNameOfMedia = async (d: {
    mediaId: string
    newName: string
}) => {
    await prisma.media.update({
        where: {
            id: d.mediaId
        },
        data: {
            name: d.newName
        }
    })
}

export const addTagsToMedias = async (d: {
    mediaIds: string[]
    tagIds: number[]
}) => {
    const { default: prisma } = await import("$lib/server/prisma")
    for (const tagId of d.tagIds) {
        for (const mediaId of d.mediaIds) {
            await prisma.media.update({
                where: {
                    id: mediaId
                },
                data: {
                    tags: {
                        connect: {
                            id: tagId
                        }
                    }
                }
            })
        }
    }
}

export const removeTagsFromMedias = async (d: {
    mediaIds: string[]
    tagIds: number[]
}) => {
    const { default: prisma } = await import("$lib/server/prisma")
    for (const tagId of d.tagIds) {
        for (const mediaId of d.mediaIds) {
            await prisma.media.update({
                where: {
                    id: mediaId
                },
                data: {
                    tags: {
                        disconnect: {
                            id: tagId
                        }
                    }
                }
            })
        }
    }
}
