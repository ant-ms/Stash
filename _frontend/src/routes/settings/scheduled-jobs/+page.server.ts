import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
    const countTotalImages = prisma.media.count({
        where: {
            type: {
                startsWith: "image"
            }
        }
    })

    const countTotalVideos = prisma.media.count({
        where: {
            type: {
                startsWith: "video"
            }
        }
    })

    return {
        aiTagMatching: {
            idsStillUnprocessed: prisma.media.findMany({
                where: {
                    type: {
                        startsWith: "image"
                    },
                    visualAiMatchingVersion: {
                        lt: 1
                    }
                },
                select: {
                    id: true
                }
            }),
            countProcessed: prisma.media.count({
                where: {
                    type: {
                        startsWith: "image"
                    },
                    visualAiMatchingVersion: {
                        gt: 0
                    }
                }
            }),
            countApplicable: countTotalImages,
            countScheduled: prisma.job.count({
                where: {
                    name: "attemptManualTagging"
                }
            })
        },

        gatherPerceivedLoudness: {
            idsStillUnprocessed: prisma.media.findMany({
                where: {
                    type: {
                        startsWith: "video"
                    },
                    suggestedVolumePercent: {
                        equals: null
                    }
                },
                select: {
                    id: true
                }
            }),
            countProcessed: prisma.media.count({
                where: {
                    type: {
                        startsWith: "video"
                    },
                    suggestedVolumePercent: {
                        not: {
                            equals: null
                        }
                    }
                }
            }),
            countApplicable: countTotalVideos,
            countScheduled: prisma.job.count({
                where: {
                    name: "gatherPerceivedLoudness"
                }
            })
        }
    }
}
