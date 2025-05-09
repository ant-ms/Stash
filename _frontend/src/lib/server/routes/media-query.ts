import type { Media } from "@prisma/client"
import type { Cookies } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"
import { PAGE_SIZE } from "$lib/stores.svelte"

import { sortingMethods } from "../../../types"
import { protectEndpoint } from "../protect-endpoint"

export const media_query_from_database = async (
    d: {
        cluster: string
        tags: number[]
        offset: number
        favouritesOnly: boolean
        specialFilterAttribute: string | null
        seed: number
        activeSortingMethod: number
        countOfTags: number
        minResolution: number | null
        mediaType: "all" | "image" | "video"
    },
    cookies: Cookies
) => {
    await protectEndpoint(d.cluster, cookies)

    return (await prisma.$queryRawUnsafe(/*sql*/ `
        SELECT
            "Media".*,
            STRING_AGG ("Tags"."id"::text, ',') as tags
        FROM
            "Media"
            LEFT JOIN "_MediaToTags" ON "_MediaToTags"."A" = "Media"."id"
            LEFT JOIN "Tags" ON "_MediaToTags"."B" = "Tags"."id"
        WHERE
            "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${d.cluster}')
            AND "Media"."deleted" = false
            ${assembleTagsFilter(d.tags)}
            ${assembleFavouritesOnlyFilter(d.favouritesOnly)}
            ${assembleSpecialFilterAttributeFilter(d.specialFilterAttribute)}
            ${assembleMinResultionFilter(d.minResolution)}
            ${assembleMediaTypeFilter(d.mediaType)}
        GROUP BY
            "Media"."id"
        ${assembleCountOfTagsFilter(d.countOfTags)}
        ${await assembleOrderBy(d)}
        LIMIT ${PAGE_SIZE}
        OFFSET ${d.offset}
    `)) as (Media & { tags: string })[]
}

const assembleMinResultionFilter = (minResolution: number | null) => {
    if (!minResolution) return ""
    return /*sql*/ `
    AND (
        "Media"."width" >= ${minResolution}
        OR

        "Media"."height" >= ${minResolution}
    )
  `
}

const assembleTagsFilter = (tags: number[]) => {
    if (tags.length === 0) return ""
    return /*sql*/ `
      AND "Media"."id" IN (
        SELECT
          "_MediaToTags"."A"
        FROM
          "_MediaToTags"
        WHERE
          "_MediaToTags"."B" IN (${tags.join(",")})
      )
      `
}

const assembleFavouritesOnlyFilter = (favouritesOnly: boolean) => {
    if (!favouritesOnly) return ""
    return /*sql*/ `
      AND "Media"."favourited" = true
    `
}

const assembleSpecialFilterAttributeFilter = (
    specialFilterAttribute: string | null
) => {
    if (!specialFilterAttribute) return ""
    if (specialFilterAttribute == "show_unknown")
        return /*sql*/ `
        AND "Media"."specialFilterAttribute" IS NULL
      `
    return /*sql*/ `
      AND "Media"."specialFilterAttribute" = '${specialFilterAttribute}'
    `
}

const assembleOrderBy = async (d: {
    seed: number
    activeSortingMethod: number
}) => {
    if (sortingMethods[d.activeSortingMethod].icon === "mdiSort")
        await prisma.$executeRawUnsafe(/*sql*/ `
        SELECT setseed(${d.seed});
      `)
    return /*sql*/ `
      ORDER BY ${sortingMethods[d.activeSortingMethod].orderBy}
    `
}

const assembleCountOfTagsFilter = (countOfTags: number) => {
    if (countOfTags < 0) return ""
    return /*sql*/ `
        HAVING COUNT("Tags"."id") = ${countOfTags}
    `
}

const assembleMediaTypeFilter = (mediaType: "all" | "image" | "video") => {
    if (mediaType === "all") return ""
    return /*sql*/ `
        AND "Media"."type" LIKE '${mediaType}%'
    `
}
