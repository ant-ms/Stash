<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate and beforeUpdate. Please migrate by hand. -->
<script lang="ts">
    // @ts-ignore
    /**
     * egjs-grid
     * Copyright (c) 2021-present NAVER Corp.
     * MIT license
     */
    import { GRID_EVENTS, JustifiedGrid as GridClass } from "@egjs/grid"
    import {
        afterUpdate,
        beforeUpdate,
        createEventDispatcher,
        onDestroy,
        onMount
    } from "svelte"

    const dispatch = createEventDispatcher()
    let container: any
    let grid: any
    let isFirstMount = false
    let attributes: any = {}
    export let startX = 0
    export let endX = 0

    function updateAttributes() {
        attributes = { ...$$props }

        const defaultOptions = GridClass.defaultOptions

        delete attributes["GridClass"]
        for (const name in defaultOptions) {
            delete attributes[name]
        }
    }

    beforeUpdate(() => {
        updateAttributes()
        if (!grid) {
            return
        }

        const propertyTypes = GridClass.propertyTypes
        for (const name in propertyTypes) {
            if (name in $$props) {
                grid[name] = $$props[name]
            }
        }
    })
    onMount(() => {
        const defaultOptions = GridClass.defaultOptions
        const options: any = {}

        for (const name in defaultOptions) {
            if (name in $$props) {
                options[name] = $$props[name]
            }
        }

        grid = new GridClass(container, options)

        GRID_EVENTS.forEach(name => {
            grid.on(name, (e: any) => {
                dispatch(name, e)
            })
        })
        grid.renderItems()

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries.at(0) as ResizeObserverEntry
            startX = entry.target.getBoundingClientRect().left
            endX = entry.target.getBoundingClientRect().right
        })

        resizeObserver.observe(container)

        // This callback cleans up the observer
        return () => resizeObserver.unobserve(container)
    })

    afterUpdate(async () => {
        if (isFirstMount) {
            isFirstMount = false
            return
        }
        const propertyTypes = GridClass.propertyTypes

        for (const name in propertyTypes) {
            if (name in $$props) {
                grid[name] = $$props[name]
            }
        }
        grid.syncElements()
    })
    onDestroy(() => {
        grid && grid.destroy()
    })
    export function getInstance() {
        return grid
    }
</script>

<div bind:this={container} {...attributes}>
    <slot />
</div>
