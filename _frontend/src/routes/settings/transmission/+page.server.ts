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

    return {
        TRANSMISSION_ENDPOINT: TRANSMISSION_ENDPOINT?.value || "",
        TRANSMISSION_STASH_DATA_LOCATION:
            TRANSMISSION_STASH_DATA_LOCATION?.value || ""
    }
}
