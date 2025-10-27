export const SUBJECT_TYPES = [
    { value: null, icon: "mdiAllInclusive" },
    { value: "solo", icon: "mdiAccount" },
    { value: "two", icon: "mdiAccountMultiple" },
    { value: "three", icon: "mdiAccountGroup" },
    { value: "group", icon: "mdiAccountMultiplePlus" },
    { value: "show_unknown", icon: "mdiAccountQuestion" }
] as const

// TODO: Make everything use these
export const MEDIA_ROOT = "./media";
export const THUMBNAIL_ROOT = "./thumbnails";
