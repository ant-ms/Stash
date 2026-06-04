import prisma from "../prisma"

export const createPostUploadJobs = async (mediaId: string, type: string) => {
    await prisma.job.create({
        data: {
            name: "updateMediaMetadataFromFile",
            data: JSON.stringify({ id: mediaId, initial: true }),
            priority: 15
        }
    })
}
