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
        traverse: boolean
        includeTaggedTags: boolean
    },
    cookies: Cookies
) => {
    await protectEndpoint(d.cluster, cookies)

    const tagsFilterParts = generateTagsFilterParts(
        d.tags,
        d.traverse,
        d.includeTaggedTags
    )

    return (await prisma.$queryRawUnsafe(/*sql*/ `
        ${tagsFilterParts.cte}
        SELECT
            "Media"."id",
            "Media"."type",
            "Media"."name",
            "Media"."date",
            "Media"."createdDate",
            "Media"."height",
            "Media"."width",
            "Media"."source",
            "Media"."content_hash",
            "Media"."favourited",
            "Media"."groupedIntoNamesId",
            "Media"."specialFilterAttribute",
            "Media"."specialFilterAttributeGuess",
            "Media"."tagsGuess",
            "Media"."deleted",
            STRING_AGG ("Tags"."id"::text, ',') as tags
        FROM
            "Media"
            LEFT JOIN "_MediaToTags" ON "_MediaToTags"."A" = "Media"."id"
            LEFT JOIN "Tags" ON "_MediaToTags"."B" = "Tags"."id"
        WHERE
            "Media"."clustersId" = (SELECT id FROM "Clusters" WHERE "Clusters".name = '${d.cluster}')
            AND "Media"."deleted" = false
            ${tagsFilterParts.whereClause}
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

const generateTagsFilterParts = (
    tags: number[],
    traverse: boolean,
    includeTaggedTags: boolean
): { cte: string; whereClause: string } => {
    if (tags.length === 0) return { cte: "", whereClause: "" }
    const baseList = tags.join(",")

    // 1) If traverse: build a recursive CTE to get all descendant tags
    let cte = ""
    let tagSource = `(${baseList})`
    if (traverse) {
        cte = `
    WITH RECURSIVE tag_tree(id) AS (
      SELECT id FROM "Tags" WHERE id IN (${baseList})
      UNION ALL
      SELECT c.id
      FROM "Tags" c
      JOIN tag_tree t ON c."parentId" = t.id
    )`
        tagSource = `(SELECT id FROM tag_tree)`
    }

    // 2) Build the pivot‐table predicates:
    //    - B = tag.id in our set
    //    - if includeTaggedTags: A = tag.id in our set
    const predicates = [`"_MediaToTags"."B" IN ${tagSource}`]
    if (includeTaggedTags) {
        // Use subquery to find tags that are tagged with our target tags
        predicates.push(`"_MediaToTags"."B" IN (
            SELECT "_TagToTag"."A"
            FROM "_TagToTag"
            WHERE "_TagToTag"."B" IN (${baseList})
        )`)
    }
    const pivotWhere = predicates.join(" OR ")

    // 3) Return components separately
    return {
        cte: cte,
        whereClause: /*sql*/ `
    AND "Media"."id" IN (
      SELECT "_MediaToTags"."A"
      FROM "_MediaToTags"
      WHERE ${pivotWhere}
    )
    `
    }
}

// Keep this for backward compatibility
const assembleTagsFilter = (
    tags: number[],
    traverse: boolean,
    includeTaggedTags: boolean
): string => {
    const parts = generateTagsFilterParts(tags, traverse, includeTaggedTags)
    return parts.cte + parts.whereClause
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
