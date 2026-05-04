import { type IconName } from "$lib/possibleIcons.svelte"

export const sortingMethods: Array<{
    icon: IconName
    orderBy?: string
    id?: string
    title: string
}> = [
    {
        icon: "mdiSortAlphabeticalAscending",
        orderBy: `"Media"."name" ASC, "Media"."id" ASC`,
        title: "Name (ascending)"
    },
    {
        icon: "mdiSortAlphabeticalDescending",
        orderBy: `"Media"."name" DESC, "Media"."id" DESC`,
        title: "Name (descending)"
    },
    {
        icon: "mdiSortCalendarAscending",
        orderBy: `"Media"."date" ASC, "Media"."name" ASC, "Media"."id" ASC`,
        title: "Date (ascending)"
    },
    {
        icon: "mdiSortCalendarDescending",
        orderBy: `"Media"."date" DESC, "Media"."name" DESC, "Media"."id" DESC`,
        title: "Date (descending)"
    },
    {
        icon: "mdiSortDescending",
        orderBy: `"Media"."sizeBytes" DESC, "Media"."name" DESC, "Media"."id" DESC`,
        title: "Size (descending)"
    },
    // TODO: Add a seed (so that no reload happens when I change a tag)
    {
        icon: "mdiSort",
        id: "Random",
        orderBy: `RANDOM()`,
        title: "Random"
    }
]

export const setMethods: Array<{
    title: "OR" | "AND"
    icon: IconName
}> = [
    {
        title: "OR",
        icon: "mdiSetAll"
    },
    {
        title: "AND",
        icon: "mdiSetCenter"
    }
]
