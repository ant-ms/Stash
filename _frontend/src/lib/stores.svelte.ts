import { persisted } from "svelte-local-storage-store"
import { writable, type Writable } from "svelte/store"

import QuickActionsCast from "$components/Popups/ActionBars/Cast.svelte"

import type Controller from "../routes/Controller.svelte"

export let controller: Writable<Controller> = writable()

// Constants
export const PAGE_SIZE = 200

// Page Data
export let collapsedTags: Writable<string[]> = writable([])

// Navigation and Layout
export const actionBars = {
    Cast: QuickActionsCast
}
export let actionBar: Writable<keyof typeof actionBars | null> = writable(null)
export let windowControlsSpacerVisible = writable(false)

export let uploadPopupOpen = writable(false)

export let imageSuffixParameter: Writable<String> = writable("")

// Selections
export let selectedMediaIds: Writable<string[]> = writable([])

// Media Filters
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")

// Elements
export let videoElement: Writable<HTMLVideoElement | null> = writable(null)

export let settings = persisted("settings", {
    mediaTouchAction: "zoom" as "zoom" | "navigate" | "seek",
    theme: "default" as "default" | "light" | "amoled"
})

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)
