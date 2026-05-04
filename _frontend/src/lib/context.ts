import { PersistedState } from "runed"

export const layout = new PersistedState(
    "layout",
    "desktop" as "desktop" | "mobile" | "tv"
)
