<script lang="ts">
    import { ElementSize } from "runed"

    import { page } from "$app/state"
    import {
        mediaController,
        type MediaType
    } from "$lib/controllers/MediaController.svelte"
    import Popup from "$reusables/Popup.svelte"

    const minColumnWidth = 550
    const maxColumnWidth = 800

    let popupContent: HTMLElement = $state(null) as any
    let viewportWidth = new ElementSize(() => popupContent)
    let numberOfColumns = $derived.by(() => {
        return Math.max(
            Math.floor(viewportWidth.width / minColumnWidth),
            Math.min(
                Math.floor(viewportWidth.width / maxColumnWidth),
                mediaController.media.filter(m => m.type.startsWith("image"))
                    .length
            )
        )
    })

    let columnWidth = $derived(
        viewportWidth.width / numberOfColumns -
            (16 * (numberOfColumns - 1)) / numberOfColumns
    )
    let columns: MediaType[][] = $derived.by(() => {
        if (!numberOfColumns) return []
        let newColumns: MediaType[][] = Array.from(
            { length: numberOfColumns },
            () => []
        )
        let columnHeights = Array.from({ length: numberOfColumns }, () => 0)

        for (const medium of mediaController.media) {
            if (!medium.type.startsWith("image")) continue

            let column = columnHeights.indexOf(Math.min(...columnHeights))
            newColumns[column].push(medium)
            columnHeights[column] +=
                medium.height * (columnWidth / medium.width) + 16
        }
        return newColumns
    })
</script>

<!-- TODO: not a popup -->
<Popup hideHeader fullscreen>
    <main bind:this={popupContent}>
        {#each columns as column}
            <div class="column">
                {#each column.filter(m => m.type.startsWith("image")) as medium}
                    <img
                        src="{page.data.serverURL}/file/{medium.id}"
                        width={columnWidth}
                        height={medium.height * (columnWidth / medium.width)}
                        alt={medium.name}
                    />
                {/each}
            </div>
        {/each}
    </main>
</Popup>

<style lang="scss">
    main {
        display: flex;
        gap: 1rem;
        margin: 0.5rem;

        .column {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    }
</style>
