<script lang="ts">
    type T = $$Generic<Record>

    interface Props {
        headers?:
            | (string | { title: string; sortableProperty: keyof T })[]
            | null
        data: T[]
        borderless?: boolean
        children?: import("svelte").Snippet<[any]>
    }

    let { headers = null, data, borderless = false, children }: Props = $props()
</script>

<!-- TODO: Allow sorting by passing parameter and then sorting by header -->

<table class:borderless>
    {#if headers}
        <thead>
            <tr>
                {#each headers as header}
                    {#if typeof header === "string"}
                        <th>{header}</th>
                    {:else}
                        <th>{header.title}</th>
                    {/if}
                {/each}
            </tr>
        </thead>
    {/if}
    <tbody>
        {#each data as entry, i}
            <tr>
                {@render children?.({ entry, i })}
            </tr>
        {/each}
    </tbody>
</table>

<style>
    tr {
        position: relative;
    }
</style>
