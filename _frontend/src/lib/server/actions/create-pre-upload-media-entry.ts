import prisma from "../prisma"

export const createPreUploadMediaEntry = async (p: {
    name: string
    type: string
    clusterName: string
    tagIds: number[]
}) => {
    const name = p.name.replace(/\.[^.]+$/, "")

    const { id: mediaId } = await prisma.media.create({
        data: {
            name,
            type: p.type,
            date: new Date(),
            height: 0,
            width: 0,
            cluster: {
                connect: {
                    name: p.clusterName
                }
            }
        }
    })

    for (const tagId of p.tagIds) {
        await prisma.tags.update({
            where: {
                id: tagId
            },
            data: {
                media: {
                    connect: {
                        id: mediaId
                    }
                }
            }
        })
    }

    return mediaId
}
