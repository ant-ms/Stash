import type { TagExtended } from "$lib/controllers/TagsController.svelte"
import assembleTagHierarchyMap from "$lib/helpers/assembleTagHierarchyMap"
import prisma from "$lib/server/prisma"
import { tags_query_from_database } from "$lib/server/routes/tags"

import type { PageServerLoad } from "./$types"

export const load = (async ({ cookies }) => {
    const data = await tags_query_from_database(
        {
            cluster: null,
            favouritesOnly: false,
            durationMin: 0,
            durationMax: 60
        },
        cookies
    )

    const tmpTagMap = assembleTagHierarchyMap(data)

    const smartTags = await prisma.smartTag.findMany({
        include: { mediaSource: true }
    })

    const tags: (TagExtended & { tagBeforePrefix: string; smartTag?: any })[] =
        []

    const addTags = (tag: TagExtended, prefix: string | null = null) => {
        const tagBeforePrefix = prefix ? `${prefix}/${tag.tag}` : tag.tag

        const smartTag = smartTags.find(st => st.tagId === tag.id)
        tags.push({ ...tag, tagBeforePrefix, smartTag })

        tag.children.forEach(c => addTags(c, tagBeforePrefix))
    }

    Object.values(tmpTagMap)
        .filter(t => !t.parentId)
        .forEach(tag => addTags(tag))

    const tagClusterMappings = (
        await prisma.clusters.findMany({
            select: {
                id: true,
                Tags: {
                    select: {
                        id: true
                    }
                }
            }
        })
    ).reduce(
        (acc, cluster) => {
            cluster.Tags.forEach(
                tag =>
                    (acc[tag.id] = acc[tag.id]
                        ? [...acc[tag.id], cluster.id]
                        : [cluster.id])
            )
            return acc
        },
        {} as Record<number, number[]>
    )

    const tagToTagMappings = await prisma.tags.findMany({
        select: {
            id: true,
            tagged: true
        }
    })

    const mediaSources = await prisma.mediaSource.findMany({
        orderBy: { id: "asc" }
    })

    return {
        tags,
        tagClusterMappings,
        tagToTagMappings,
        mediaSources
    }
}) satisfies PageServerLoad
