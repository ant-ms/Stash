<script lang="ts">
    import { onMount } from "svelte"

    import FuzzyTemplate from "$components/FuzzyTemplate.svelte"
    import query from "$lib/client/call"

    import {
        TransmissionImportSource,
        type ImportSource
    } from "./ImportSources.svelte"

    const { queue = $bindable() }: { queue: ImportSource[] } = $props()

    let data: {
        files: { bytesCompleted: number; length: number; name: string }[]
        id: number
        name: string
        status: number
        downloadDir: string
    }[] = $state([])

    onMount(async () => {
        data = await query("getAllCompletedTorrents", {})
    })
</script>

{#if !data.length}
    <p>Loading...</p>
{:else}
    <FuzzyTemplate
        {data}
        searchAttributes={["name"]}
        onselected={torrent => {
            queue.push(
                new TransmissionImportSource(
                    torrent.id,
                    torrent.files[0].name,
                    torrent.downloadDir
                )
            )
            const valuesInQueue = queue.map(q => q.filename)
            data = [...data].filter(
                d => !valuesInQueue.includes(d.files[0].name)
            )
        }}
    >
        {#snippet children(result)}
            <span>{result.files[0].name}</span>
        {/snippet}
    </FuzzyTemplate>
{/if}
