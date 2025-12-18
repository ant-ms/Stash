import { persisted } from "svelte-local-storage-store"
import { writable, type Writable } from "svelte/store"

import type Controller from "../routes/Controller.svelte"

export let controller: Writable<Controller> = writable()

// Selections
export let selectedMediaIds: Writable<string[]> = writable([])

export let settings = persisted("settings", {
    mediaTouchAction: "zoom" as "zoom" | "navigate" | "seek",
    theme: "default" as "default" | "light" | "amoled"
})
