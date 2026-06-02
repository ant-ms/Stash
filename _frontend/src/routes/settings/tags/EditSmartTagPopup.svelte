<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import queryRpc from "$lib/client/call.js"
    import Popup from "$reusables/Popup.svelte"

    interface Props {
        tagId: number
        initialSmartTag?: any
        mediaSources: any[]
        close: () => void
    }

    let { tagId, initialSmartTag, mediaSources, close }: Props = $props()

    let enabled = $state(!!initialSmartTag)
    let selectedSourceId = $state(
        initialSmartTag?.mediaSourceId ||
            (mediaSources.length > 0 ? mediaSources[0].id : null)
    )
    let query = $state(initialSmartTag?.query || "")
    let isPool = $state(initialSmartTag?.isPool || false)

    const save = async () => {
        if (!enabled) {
            if (initialSmartTag) {
                await queryRpc("SmartTagDelete", { tagId })
                invalidateAll()
            }
            close()
            return
        }

        if (!selectedSourceId || !query) {
            window.alert("Please provide a media source and query.")
            return
        }

        await queryRpc("SmartTagUpdate", {
            tagId,
            mediaSourceId: selectedSourceId,
            query,
            isPool
        })
        invalidateAll()
        close()
    }
</script>

<Popup title="Edit Smart Tag Configuration" onclose={close}>
    <section>
        <label for="enabled">Enable Smart Tag</label>
        <input type="checkbox" id="enabled" bind:checked={enabled} />

        {#if enabled}
            <label for="mediaSource">Media Source</label>
            <select id="mediaSource" bind:value={selectedSourceId}>
                {#each mediaSources as source}
                    <option value={source.id}>{source.name}</option>
                {/each}
            </select>

            <label for="query">Query / Tag</label>
            <input
                type="text"
                id="query"
                bind:value={query}
                placeholder="e.g. artist:funkybun"
            />
        {/if}
    </section>

    {#snippet actionsLeft()}
        <Button card onclick={close}>Cancel</Button>
    {/snippet}

    {#snippet actionsRight()}
        <Button card highlighted icon="mdiContentSave" onclick={save}
            >Save</Button
        >
    {/snippet}
</Popup>

<style lang="scss">
    section {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1em;
        align-items: center;

        label {
            white-space: nowrap;
        }

        input[type="checkbox"] {
            justify-self: start;
        }
    }
</style>
