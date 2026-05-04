import { type IconName } from "$lib/possibleIcons.svelte"
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

    let serverURL =
        process.env.SERVER_URL ??
        (url.hostname == "stash.any.gay"
            ? "https://stash.any.gay"
            : "https://stash.hera.lan")
    console.log(new Date().toISOString(), "/+layout.server.ts2", url.pathname)

    const session = cookies.get("session") || ""

    return {
        userAgent: request.headers.get("user-agent") || "Unknown",
        clusters: await getClusters(session),
        customIcons: await prisma.customIcon.findMany(),
        serverURL,
        session
    }
}
