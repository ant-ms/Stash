import type { Cookies } from "@sveltejs/kit"

import prisma from "../prisma"
import { protectEndpoint } from "../protect-endpoint"

export const tags_query_from_database = async (
    d: {
        cluster: string | null
        mediaTypeFilter: string
        favouritesOnly: boolean
    },
    cookies: Cookies
) => {
    await protectEndpoint(d.cluster || "", cookies)

    const typeFilter = d.mediaTypeFilter
        ? /*sql*/ `
        AND "Media"."type" LIKE '${d.mediaTypeFilter}%'
    `
        : ""

    const favouriteFilter = d.favouritesOnly
        ? /*sql*/ `
        AND "Media"."favourited" = true
    `
        : ""

    return (await prisma.$queryRawUnsafe(/*sql*/ `
        WITH RECURSIVE
            TagHierarchy AS (
                -- Base case: start with all tags
                SELECT
                    "id",
                    "parentId"
                FROM
                    "Tags"
                UNION ALL
                -- Recursive case: find children of the current tag
                SELECT
                    "Tags"."id",
                    "Tags"."parentId"
                FROM
                    "Tags"
                    INNER JOIN TagHierarchy ON "Tags"."parentId" = TagHierarchy."id"
            ),
            TagsWithMedia AS (
                -- Find tags with media associated
                SELECT
                    "Tags"."id" AS tag_id,
                    COUNT(DISTINCT "Media"."id")::INTEGER AS media_count
                FROM
                    "Tags"
                LEFT JOIN "_MediaToTags" ON "_MediaToTags"."B" = "Tags"."id"
                LEFT JOIN "Media" ON "_MediaToTags"."A" = "Media"."id"
                ${
                    d.cluster
                        ? `WHERE
                    "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${d.cluster}')`
                        : ""
                }
                GROUP BY
                    "Tags"."id"
            ),
            TagsWithCluster AS (
                -- Find tags associated with the current cluster
                SELECT
                    "Tags"."id" AS tag_id
                FROM
                    "Tags"
                INNER JOIN "_ClustersToTags" ON "_ClustersToTags"."B" = "Tags"."id"
                ${
                    d.cluster
                        ? `WHERE
                    "_ClustersToTags"."A" = (SELECT id FROM "Clusters" WHERE "Clusters"."name" = '${d.cluster}')`
                        : ""
                }
            ),
            AllRelatedTags AS (
                -- Get all tags related to the TagsWithCluster (including parent tags)
                SELECT
                    th1."id"
                FROM
                    TagHierarchy th1
                INNER JOIN TagsWithCluster twc ON th1."id" = twc.tag_id
                UNION
                -- Include parents of the related tags
                SELECT
                    th2."parentId" AS "id"
                FROM
                    TagHierarchy th2
                WHERE
                    th2."id" IN (SELECT tag_id FROM TagsWithCluster)
            )
        SELECT
            "Tags".*,
            COALESCE(TagsWithMedia.media_count, 0) AS count
        FROM
            "Tags"
        LEFT JOIN TagsWithMedia ON "Tags"."id" = TagsWithMedia.tag_id
        WHERE "Tags"."id" IN (SELECT "id" FROM AllRelatedTags);
    `)) as any
}

export const tag_update_icon = async (d: { tagId: number; newIcon: string }) =>
    await prisma.tags.update({
        where: {
            id: d.tagId
        },
        data: {
            icon: d.newIcon
        }
    })

export const TagUpdateDescription = async (d: {
    tagId: number
    description: string
}) => {
    await prisma.tags.update({
        where: {
            id: d.tagId
        },
        data: {
            description: d.description
        }
    })
}

export const TagUpdateName = async (d: { tagId: number; newName: string }) => {
    await prisma.tags.update({
        where: {
            id: d.tagId
        },
        data: {
            tag: d.newName
        }
    })
}

export const TagCreate = async (d: {
    name: string
    parentTagId: number | null
    clusterId: number
}) =>
    await prisma.tags.create({
        data: {
            tag: d.name,
            parentId: d.parentTagId,
            clusters: {
                connect: {
                    id: d.clusterId
                }
            }
        },
        select: {
            id: true
        }
    })

export const TagDelete = async (d: { tagId: number }) => {
    await prisma.tags.delete({
        where: {
            id: d.tagId
        }
    })
}

export const createTagToTagReference = async (d: {
    tagId: number
    tagToReferenceId: number
}) =>
    await prisma.tags.update({
        where: {
            id: d.tagId
        },
        data: {
            tagged: {
                connect: {
                    id: d.tagToReferenceId
                }
            }
        }
    })

export const changeClustersOfTag = async (d: {
    tagId: number
    clusterIds: number[]
}) => {
    await prisma.tags.update({
        where: {
            id: d.tagId
        },
        data: {
            clusters: {
                set: await prisma.clusters.findMany({
                    where: {
                        id: {
                            in: d.clusterIds
                        }
                    }
                })
            }
        }
    })
}
