import type { possibleIcons } from "$lib/possibleIcons"
import prisma from "$lib/server/prisma"

import type { LayoutServerLoad } from "./$types"

export const ssr = true

const getClusters = async (token: string) => {
    const currentUser = await prisma.credentials.findFirst({
        where: {
            Session: {
                some: {
                    token
                }
            }
        },
        select: {
            permittedClusters: {
                select: {
                    id: true
                }
            }
        }
    })

    if (!currentUser) return []

    return await prisma.clusters.findMany({
        where: {
            id: {
                in: currentUser.permittedClusters.map(c => c.id)
            }
        },
        orderBy: {
            sortOrder: "asc"
        }
    })
}

export const load: LayoutServerLoad = async ({ request, url, cookies }) => {
    console.log(new Date().toISOString(), "/+layout.server.ts1", url.pathname)

    let serverURL = "https://stash.hera.lan"
    if (url.hostname == "stash.any.gay") serverURL = "https://stash.any.gay"
    console.log(new Date().toISOString(), "/+layout.server.ts2", url.pathname)

    const session = cookies.get("session") || ""

    return {
        userAgent: request.headers.get("user-agent") || "Unknown",
        clusters: await getClusters(session),
        serverURL,
        session
    }
}
