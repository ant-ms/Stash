import type { Media } from "@prisma/client/wasm"
import { md5 } from "hash-wasm"
import { PressedKeys } from "runed"
import { untrack } from "svelte"
import { get } from "svelte/store"

import { page } from "$app/stores"
import query from "$lib/client/call"
import { mediaTypeFilter, PAGE_SIZE } from "$lib/stores.svelte"
import vars from "$lib/vars.svelte"

import type { TagExtended } from "./TagsController.svelte"

export type MediaType = Media & { tags: number[] }

class MediaController {
    private alreadyInitialized = false
    public init = () => {
        if (this.alreadyInitialized) {
            console.log("MediaController already initialized!")
            return
        }

        this.alreadyInitialized = true

        $effect(() => {
            if (!this.filters) {
            }
            console.group(
                "%cUpdating via effect",
                "color: grey; font-weight: normal"
            )
            this.updateMedia()
            console.groupEnd()
        })

        $effect(() => {
            this.updateMedia(vars.clusterName)
        })

        mediaTypeFilter.subscribe(() => this.updateMedia)

        const keys = new PressedKeys()
        keys.onKeys([","], goToPreviousMedia)
        keys.onKeys(["."], goToNextMedia)
    }

    public visibleMedium: MediaType | null = $state(null)
    public mediaOverride: MediaType[] | null = $state(null)
    public media: MediaType[] = $state([])
    public pages: { hash: string; media: Media[] }[] = $state([])

    public selectedTags: TagExtended[] = $state([])
    public filters = $state({
        specialFilterAttribute: null as string | null,
        favouritesOnly: false,
        countOfTags: -1,
        activeSortingMethod: 3,
        seed: Math.random(),
        minResolution: null as number | null,
        mediaType: "all" as "all" | "image" | "video",
        traverse: false,
        includeTaggedTags: false
    })
    private _filtersOverrides: typeof this.filters | null = null

    public updateMedia = async (
        newCluster: string | undefined = undefined,
        filters: typeof this.filters | null = null
    ) => {
        console.debug(
            `%cUpdating media with new cluster: ${newCluster} to ${get(page).params.cluster}`,
            "color: grey"
        )

        if (filters) this._filtersOverrides = filters

        this.setMedia(await this.loadMedia(0, newCluster))
    }

    // TODO: Change to event
    public setMedia = async (media: typeof this.media) => {
        this.media = media
        this.pages = await calculatePages(media)
    }

    public prefetchedQueryForTagId:
        | [number, ReturnType<typeof query<"media_query_from_database">>]
        | null = $state(null)
    public prefetchMediaForTag = async (tagId: number) => {
        if (
            this.prefetchedQueryForTagId &&
            this.prefetchedQueryForTagId[0] == tagId
        )
            return
        this.prefetchedQueryForTagId = [
            tagId,
            query("media_query_from_database", {
                cluster: get(page).params.cluster,
                tags: [tagId],
                offset: 0,
                ...(this._filtersOverrides || this.filters)
            })
        ]
    }

    public isCurrentlyLoadingNewMedia = false
    // TODO: Make easier to read / more organised
    private loadMedia = async (
        offset: number,
        cluster = get(page).params.cluster
    ) => {
        // TODO: This is ridiculous, there must be a better way
        if ([this.selectedTags, this.filters, this._filtersOverrides].length) {
        }

        if (this.isCurrentlyLoadingNewMedia) return []
        this.isCurrentlyLoadingNewMedia = true

        let dataPromise: ReturnType<
            typeof query<"media_query_from_database">
        > | null = null

        untrack(() => {
            if (
                this.prefetchedQueryForTagId &&
                this.selectedTags.length == 1 &&
                this.selectedTags[0].id == this.prefetchedQueryForTagId[0]
            ) {
                dataPromise = this.prefetchedQueryForTagId[1]
                this.prefetchedQueryForTagId = null
            }
        })

        if (dataPromise === null) {
            dataPromise = query("media_query_from_database", {
                cluster,
                tags: this.selectedTags.map(t => t.id),
                offset,
                ...(this._filtersOverrides || this.filters)
            })
        }

        const data = await dataPromise

        $effect.root(() => {
            this._filtersOverrides = null
            this.filters = this._filtersOverrides || this.filters
        })

        const processedData = data.map(m => ({
            ...m,
            tags: m.tags?.split(",").map(t => +t) || []
        })) satisfies MediaType[]
        this.isCurrentlyLoadingNewMedia = false
        return processedData
    }

    public async loadMoreMedia() {
        if (this.isCurrentlyLoadingNewMedia)
            this.isCurrentlyLoadingNewMedia = true

        this.setMedia(
            this.media.concat(await this.loadMedia(this.media.length))
        )

        this.isCurrentlyLoadingNewMedia = false
    }
}

const _mediaController = new MediaController()
export const mediaController = _mediaController

const calculatePages = async (media: MediaType[]) => {
    // TODO: scroll up when changes occur in pages that are not the last one (aka: when changed and not appended)

    if (!media.length) {
        return []
    }
    const pages: { hash: string; media: Media[] }[] = []

    // For each page
    for (
        let i = 0;
        i <
        Math.max(
            Math.ceil(media.length / PAGE_SIZE),
            _mediaController.pages.length
        );
        i++
    ) {
        const page = media.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
        if (!page.length) break

        const hash = await md5(page.map(m => [m.id, m.tags]).join())

        // If the page has changed, update it
        if (_mediaController.pages[i]?.hash != hash) {
            pages[i] = { hash, media: page }
        } else pages[i] = _mediaController.pages[i]
    }

    return pages
}

const goToPreviousMedia = async () => {
    if (!mediaController.visibleMedium) return

    const mediaPool = mediaController.mediaOverride || mediaController.media
    const mediaIndex = mediaPool.findIndex(
        m => m.id == mediaController.visibleMedium?.id
    )

    if (mediaIndex > 0)
        mediaController.visibleMedium = mediaPool[mediaIndex - 1]
}

const goToNextMedia = async () => {
    if (!mediaController.visibleMedium) return

    const mediaPool = mediaController.mediaOverride || mediaController.media
    const mediaIndex = mediaPool.findIndex(
        m => m.id == mediaController.visibleMedium?.id
    )

    if (mediaIndex < mediaPool.length - 1) {
        mediaController.visibleMedium = mediaPool[mediaIndex + 1]
    } else if (!mediaController.mediaOverride) {
        mediaController.loadMoreMedia().then(() => {
            if (mediaIndex < mediaController.media.length - 1) {
                mediaController.visibleMedium =
                    mediaController.media[mediaIndex + 1]
            }
        })
    }
}
