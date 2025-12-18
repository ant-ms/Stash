import { page } from "$app/state"
import query from "$lib/client/call"
import assembleTagHierarchyMap from "$lib/helpers/assembleTagHierarchyMap"
import type { possibleIcons } from "$lib/possibleIcons"
import vars from "$lib/vars.svelte"

import { mediaController } from "./MediaController.svelte"
import { prompts } from "./PromptController"

export type TagBase = {
    id: number
    tag: string
    icon: keyof typeof possibleIcons | null
    collapsed: boolean
    parentId: number | null
    count: number
    description?: string
}

export type TagExtended = TagBase & {
    children: TagExtended[]
    indirectCount: number
    indirectIcon: keyof typeof possibleIcons | null
}

export class TagsController {
    private alreadyInitialized = false

    public tagMap: Record<number, TagExtended> = $state({})

    public init = () => {
        if (this.alreadyInitialized) {
            console.log("TagsController already initialized!")
            return
        }

        this.alreadyInitialized = true
        // this.updateTags()

        $effect(() => {
            console.log(
                "updating with ",
                vars.clusterName,
                mediaController.filters.favouritesOnly,
                vars.mediaTypeFilter
            )
            this.updateTags()
        })
    }

    public updateTags = async () => {
        const data: TagBase[] = await query("tags_query_from_database", {
            cluster: vars.clusterName || null,
            favouritesOnly: mediaController.filters.favouritesOnly,
            mediaTypeFilter: vars.mediaTypeFilter
        })

        const tmpTagMap = assembleTagHierarchyMap(data)

        // Step 3: Calculate indirect counts
        const calculateIndirectCounts = (tag: TagExtended) => {
            tag.children.forEach(child => {
                calculateIndirectCounts(child)
                tag.indirectCount += child.count + child.indirectCount
            })
        }
        data.forEach(tag => {
            if (tag.parentId === null) {
                calculateIndirectCounts(tmpTagMap[tag.id])
            }
        })

        this.tagMap = tmpTagMap
    }

    public toggleTag = (tag: TagBase, callback: (collapsed: boolean) => {}) => {
        callback(!tag.collapsed)

        fetch(`/api/tags/${tag.id}`, {
            method: "PATCH",
            body: JSON.stringify({ collapsed: !tag.collapsed })
        }).then(async res => {
            if (!res.ok) {
                console.error("Failed to toggle tag: ", await res.text())
                callback(tag.collapsed)
            }
        })
    }

    public createTag = async (parentTag: TagExtended | null = null) => {
        const name = await prompts.text("Enter the name of the new tag")
        if (!name) return

        // TODO: Icon

        await fetch(`/api/cluster/${page.params.cluster}/tags`, {
            method: "POST",
            body: JSON.stringify({
                name,
                parentId: parentTag ? parentTag.id : null
            })
        }).then(async res => {
            if (!res.ok) {
                console.error("Failed to create tag: ", await res.text())
            }
        })

        // this.updateTags()
    }
}

// const tagsController = new TagsController()

export default new TagsController()
