<script lang="ts">
    import { onMount } from "svelte"

    import FuzzyTemplate from "$components/FuzzyTemplate.svelte"

    import {
        ImportablesImportSource,
        type ImportSource
    } from "./ImportSources.svelte"

    const { queue = $bindable() }: { queue: ImportSource[] } = $props()

    let data: string[] = $state([])

    onMount(async () => {
        data = (
            await fetch(`https://stash.hera.lan/api/cluster/-1/import`)
                .then(res => res.json())
                .then(d => d as string[])
        ).filter(d => !queue.map(q => q.filename).includes(d))
    })
</script>

{#if !data.length}
    <p>Loading...</p>
{:else}
    <FuzzyTemplate
        {data}
        searchAttributes={[""]}
        onselected={filename => {
            queue.push(new ImportablesImportSource(filename))
            const valuesInQueue = queue.map(q => q.filename)
            data = [...data].filter(d => !valuesInQueue.includes(d))
        }}
    >
        {#snippet children(result)}
            <span>{result}</span>
        {/snippet}
    </FuzzyTemplate>
{/if}
