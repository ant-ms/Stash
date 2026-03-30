import prisma from "$lib/server/prisma"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
    const TRANSMISSION_ENDPOINT = await prisma.settingsKeyValuePairs.findUnique(
        {
            where: {
                key: "TRANSMISSION_ENDPOINT"
            }
        }
    )

    const TRANSMISSION_STASH_DATA_LOCATION =
        await prisma.settingsKeyValuePairs.findUnique({
            where: {
                key: "TRANSMISSION_STASH_DATA_LOCATION"
            }
        })

    const TRANSMISSION_STASH_TORRENT_LOCATION =
        await prisma.settingsKeyValuePairs.findUnique({
            where: {
                key: "TRANSMISSION_STASH_TORRENT_LOCATION"
            }
        })

    return {
        TRANSMISSION_ENDPOINT: TRANSMISSION_ENDPOINT?.value || "",
        TRANSMISSION_STASH_DATA_LOCATION:
            TRANSMISSION_STASH_DATA_LOCATION?.value || "",
        TRANSMISSION_STASH_TORRENT_LOCATION:
            TRANSMISSION_STASH_TORRENT_LOCATION?.value || ""
    }
}
