<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Popup from "$reusables/Popup.svelte"

    interface Props {
        close: () => void
    }
    let { close }: Props = $props()

    let name = $state("")
    let baseUrl = $state("")
    let searchEndpoint = $state("/posts.json")
    let mapping = $state("{}")

    const submit = async () => {
        if (!name || !baseUrl) return
        const response = await fetch("/settings/media-sources/create", {
            method: "POST",
            body: JSON.stringify({ name, baseUrl, searchEndpoint, mapping })
        })
        if (!response.ok) {
            window.alert(`Error: ${response.status}`)
            return
        }
        invalidateAll()
        close()
    }
</script>

<Popup title="Add new media source" onclose={close}>
    <section>
        <label for="name">Name</label>
        <input
            bind:value={name}
            type="text"
            id="name"
            placeholder="e.g. e621"
        />

        <label for="baseUrl">Base URL</label>
        <input
            bind:value={baseUrl}
            type="text"
            id="baseUrl"
            placeholder="e.g. https://e621.net"
        />

        <label for="endpoint">Endpoint</label>
        <input
            bind:value={searchEndpoint}
            type="text"
            id="endpoint"
            placeholder="e.g. /posts.json"
        />

        <label for="mapping">Mapping</label>
        <input
            bind:value={mapping}
            type="text"
            id="mapping"
            placeholder="JSON Mapping"
        />
    </section>

    {#snippet actionsLeft()}
        <Button card onclick={close}>Cancel</Button>
    {/snippet}

    {#snippet actionsRight()}
        <Button card highlighted icon="mdiPlus" onclick={submit}>Create</Button>
    {/snippet}
</Popup>

<style lang="scss">
    section {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em 1em;
        align-items: center;
    }
</style>
