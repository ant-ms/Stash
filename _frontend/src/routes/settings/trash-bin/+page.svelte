<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import Grid from "$components/ImageGrid/Grid/Grid.svelte"
    import GridThumbnail from "$components/ImageGrid/GridThumbnail.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import query from "$lib/client/call"
    import type { MediaType } from "$lib/controllers/MediaController.svelte"
    import { prompts } from "$lib/controllers/PromptController.js"

    let { data } = $props()
</script>

<SettingsPageContent title="Trash Bin">
    {#snippet headerActions()}
        <Button
            card
            icon="mdiTrashCan"
            onclick={async () => {
                const mediaToDelete = data.mediaInTrash

                const confirm = await prompts.notify(
                    `Are you sure you want to delete ${mediaToDelete.length} media files?`
                )

                if (confirm) {
                    for (const media of mediaToDelete) {
                        await query("permanentlyDeleteMedia", {
                            mediaId: media.id
                        })
                    }
                }
            }}
        >
            Clear Trash
        </Button>
    {/snippet}

    <Grid
        autoResize={false}
        useResizeObserver={true}
        defaultDirection="start"
        gap={14}
        sizeRange={[150, 500]}
        useTransform={true}
    >
        {#each data.mediaInTrash as mediumData}
            {@const processedMedium: MediaType = {
                ...mediumData,
                tags: mediumData.tags_old.map((t: string) => +t) || [],
                specialFilterAttribute: mediumData.specialFilterAttribute,
                specialFilterAttributeGuess: mediumData.specialFilterAttributeGuess,
                tagsGuess: mediumData.tagsGuess,
            }}
            <GridThumbnail
                medium={processedMedium}
                disableActive
                disableIntersectionDetection
                disableZoom
            />
        {/each}
    </Grid>
</SettingsPageContent>

<style lang="scss">
</style>
