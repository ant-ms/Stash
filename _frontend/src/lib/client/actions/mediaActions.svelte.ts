import {
    mediaController,
    type MediaType
} from "$lib/controllers/MediaController.svelte"
import { prompts } from "$lib/controllers/PromptController"

import type { Media } from "../../../generated/prisma/browser"
import query from "../call"

export const setSpecialFilterAttribute = (
    medium: MediaType,
    newValue: string | null
) => {
    const oldValue = medium.specialFilterAttribute
    medium.specialFilterAttribute = newValue === null ? undefined : newValue
    fetch(`/api/media/${medium?.id}/specialFilterAttribute`, {
        method: "PUT",
        body: JSON.stringify({
            specialFilterAttribute: newValue
        })
    }).catch(err => {
        console.error(err)
        medium.specialFilterAttribute = oldValue
    })
}

export const renameMediaName = async (
    element = mediaController.visibleMedium,
    suggestedName?: string
) => {
    if (!element) return

    const newName = await prompts.text(
        "Enter new name",
        suggestedName || element?.name
    )
    if (newName) {
        element.name = newName
        await query("renameNameOfMedia", {
            mediaId: element.id,
            newName
        })
    }
}
export const renameGroupName = async (
    groupId: number,
    suggestedName?: string
) => {
    const newGroupName = await prompts.text(
        "Enter new name for this group",
        suggestedName
    )
    if (newGroupName) {
        await query("renameGroup", {
            groupId,
            newGroupName
        })
    }
    return newGroupName
}
