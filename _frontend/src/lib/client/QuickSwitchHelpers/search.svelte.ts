import Fuse from "fuse.js"

import { type IconName } from "$lib/possibleIcons.svelte"

export type ResultsType = {
    icon: IconName
    label: string
    action?: number | string
    submenu?: ResultsType
    onEnter?: (e: KeyboardEvent) => void
    iconOpacity?: number
}[]

let searcher: InstanceType<typeof Fuse<ResultsType[number]>> | null =
    $state(null)

export const updateSearcher = (data: ResultsType) => {
    searcher = new Fuse(data.flat(), {
        keys: ["label"]
    })
    return searcher
}

export const executeSearch = (query: string) => {
    console.log("executeSearch", searcher)
    if (!searcher) return []

    return searcher
        .search(query)
        .slice(0, 10)
        .map(i => i.item) as ResultsType
}
