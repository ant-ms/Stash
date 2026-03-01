<script lang="ts">
    import Table from "$components/elements/Table.svelte"
    import GridThumbnail from "$components/ImageGrid/GridThumbnail.svelte"
    import type { MediaType } from "$lib/controllers/MediaController.svelte"

    interface Props {
        media: Array<MediaType & { disabled?: Boolean; expanded?: Boolean }>
    }

    let { media }: Props = $props()

    const formatBytes = (bytes: number | null | undefined, decimals = 2) => {
        if (!bytes) return "0 Bytes"
        if (typeof bytes === "bigint") bytes = Number(bytes)

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }
</script>

<Table headers={["", "Name", "Size", "Bitrate"]} data={media}>
    {#snippet children({ entry })}
        <td
            style="width: 100px; height: 100px; position: relative; display: block;"
        >
            <GridThumbnail
                medium={entry}
                disableIntersectionDetection
                rigidAspectRatio
            />
        </td>
        <td class="name">
            {entry.name}
        </td>
        <td>
            {formatBytes(entry.sizeBytes)}
        </td>
        <td>
            {formatBytes(entry.sizeBytes / entry.duration)}
        </td>
    {/snippet}
</Table>

<style lang="scss">
    td {
        padding: 0.5rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--border-color-1);

        &.name {
            font-weight: 500;
        }
    }
</style>
