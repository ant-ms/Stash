import prisma from "../prisma"

export const createPostUploadJobs = async (mediaId: string, type: string) => {
    await prisma.job.create({
        data: {
            name: "updateMediaMetadataFromFile",
            data: JSON.stringify({ id: mediaId, initial: true }),
            priority: 15
        }
    })

    await prisma.job.create({
        data: {
            name: "createMediaThumbnail",
            data: JSON.stringify({ id: mediaId }),
            priority: 10,
            waitFor: "updateMediaMetadataFromFile"
        }
    })

    if (type.startsWith("video")) {
        await prisma.job.create({
            data: {
                name: "createMediaSeekThumbnails",
                data: JSON.stringify({ id: mediaId }),
                waitFor: "updateMediaMetadataFromFile"
            }
        })
    }

    // if (type.startsWith("image")) {
    //     await prisma.job.create({
    //         data: {
    //             name: "attemptManualTagging",
    //             data: JSON.stringify({ id: mediaId }),
    //             waitFor: "updateMediaMetadataFromFile"
    //         }
    //     })
    // }
}
