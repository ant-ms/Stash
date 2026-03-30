<script lang="ts">
    import { onMount } from "svelte"

    import Icon from "$components/elements/Icon.svelte"
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
        console.log(data)
    })
</script>

{#if !data.length}
    <p>Loading...</p>
{:else}
    <FuzzyTemplate
        {data}
        searchAttributes={["name"]}
        onselected={async torrent => {
            const newSource = new TransmissionImportSource(
                torrent.id,
                torrent.files.map(f => f.name),
                torrent.downloadDir,
                torrent.name
            )

            await newSource.select()
            if (newSource.selected.length === 0) {
                return
            }

            queue.push(newSource)
            const valuesInQueue = queue.map(q => q.filename)
            data = [...data].filter(
                d => !valuesInQueue.includes(d.files[0].name)
            )
        }}
    >
        {#snippet children(result)}
            {#if result.files.length == 1}
                <div class="transmission-row">
                    <Icon name="mdiFileVideo" />
                    <span>{result.files[0].name}</span>
                </div>
            {:else}
                <div class="transmission-row">
                    <Icon name="mdiFolderPlay" />
                    <span>{result.name}</span>
                    <span>{result.files.length}</span>
                </div>
            {/if}
        {/snippet}
    </FuzzyTemplate>
{/if}

<style>
    .transmission-row {
        display: grid;
        grid-template-columns: 30px 310px 1px;

        span:nth-child(2) {
            /*background: #333;
            border-radius: 5px;
            padding: 3px;*/
        }
    }
</style>
