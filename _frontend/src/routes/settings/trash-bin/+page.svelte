<script lang="ts">
    import GridThumbnail from "$components/ImageGrid/GridThumbnail.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import Grid from "$components/ImageGrid/Grid/Grid.svelte"
    import Button from "$components/elements/Button.svelte"
    import { prompts } from "$lib/controllers/PromptController.js"
    import query from "$lib/client/call"

    let { data } = $props()
</script>

<SettingsPageContent title="Trash Bin">

    {#snippet headerActions()}
        <Button
            card
            icon="mdiTrashCan"
            onclick={async () => {
                const mediaToDelete = data.mediaInTrash

                const confirm = await prompts.notify(`Are you sure you want to delete ${mediaToDelete.length} media files?`)

                if (confirm) {
                    for (const media of mediaToDelete) {
                        await query("permanentlyDeleteMedia", { mediaId: media.id })
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
        {#each data.mediaInTrash as medium}
            <GridThumbnail {medium} disableActive disableIntersectionDetection disableZoom />
        {/each}
    </Grid>
</SettingsPageContent>

<style lang="scss">
</style>
