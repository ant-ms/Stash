<script lang="ts">
    import type { Media } from "@prisma/client/wasm"

    import Grid from "$components/ImageGrid/Grid/Grid.svelte"
    import { mediaController } from "$lib/controllers/MediaController.svelte"

    import GridThumbnail from "./GridThumbnail.svelte"
    import GroupPopup from "./GroupPopup.svelte"

    interface Props {
        media: Array<Media & { disabled?: Boolean; expanded?: Boolean }>
    }

    let { media }: Props = $props()

    const getProcessedMedia = $state((oldMedia: typeof media) => {
        let alreadyProcessedGroupedInto: number[] = []
        let newMedia: typeof media = []
        for (let i = 0; i < media.length; i++) {
            const element = oldMedia[i]
            if (element.groupedIntoNamesId != null) {
                if (
                    !alreadyProcessedGroupedInto.includes(
                        element.groupedIntoNamesId
                    )
                ) {
                    alreadyProcessedGroupedInto.push(element.groupedIntoNamesId)
                    newMedia.push(element)
                }
            } else {
                newMedia.push(element)
            }
        }
        return newMedia
    })

    const getSortedMatchingMedia = (medium: (typeof media)[0]) => {
        return medium.groupedIntoNamesId == null
            ? [medium]
            : media
                  .filter(
                      m => m.groupedIntoNamesId == medium.groupedIntoNamesId
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
    }

    let showGroupPopup = $state(false)
    let groupPopupMedia: Media[] = $state([])
    let startX = $state(0)
    let endX = $state(0)
</script>

<Grid
    autoResize={false}
    useResizeObserver={true}
    defaultDirection="start"
    gap={14}
    sizeRange={[150, 500]}
    useTransform={true}
    bind:startX
    bind:endX
>
    {#each getProcessedMedia(media) as medium}
        {#if medium.groupedIntoNamesId == null}
            <GridThumbnail {medium} />
        {:else}
            <GridThumbnail
                medium={getSortedMatchingMedia(medium).shift() as any}
                onclick={() => {
                    const popupMedia = getSortedMatchingMedia(medium)
                    mediaController.mediaOverride = popupMedia
                    groupPopupMedia = popupMedia
                    showGroupPopup = true
                }}
                isParent
            />
        {/if}
    {/each}
</Grid>

{#if showGroupPopup}
    <GroupPopup
        onclose={() => {
            showGroupPopup = false
            mediaController.mediaOverride = null
        }}
        {startX}
        {endX}
    >
        <Grid
            autoResize={false}
            useResizeObserver={true}
            defaultDirection="start"
            gap={14}
            sizeRange={[150, 500]}
            useTransform={true}
        >
            {#each groupPopupMedia as medium}
                <GridThumbnail {medium} disableIntersectionDetection />
            {/each}
        </Grid>
    </GroupPopup>
{/if}
