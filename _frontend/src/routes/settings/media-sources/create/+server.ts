import { error } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json()
    if (!data.name || !data.baseUrl || !data.searchEndpoint) throw error(400)

    await prisma.mediaSource.create({
        data: {
            name: data.name,
            baseUrl: data.baseUrl,
            searchEndpoint: data.searchEndpoint,
            queryParam: data.queryParam || "tags",
            pageParam: data.pageParam || "page",
            limitParam: data.limitParam || "limit",
            authType: data.authType || null,
            username: data.username || null,
            apiKey: data.apiKey || null,
            mapping: data.mapping || "{}"
        }
    })
    return new Response(null, { status: 201 })
}
