<script lang="ts">
    import { mount, unmount } from "svelte"

    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import { prompts } from "$lib/controllers/PromptController"

    import type { PageData } from "./$types"
    import AddNewMediaSourcePopup from "./AddNewMediaSourcePopup.svelte"

    interface Props {
        data: PageData
    }
    let { data }: Props = $props()

    const editAttribute = async (
        id: number,
        attribute: string,
        value: string
    ) => {
        const response = await fetch("/settings/media-sources/edit", {
            method: "POST",
            body: JSON.stringify({ id, attribute, value })
        })
        if (!response.ok) {
            window.alert(`Error: ${response.status}`)
            return
        }
        invalidateAll()
    }

    const editString = async (
        id: number,
        attribute: string,
        current: string
    ) => {
        const newValue = await prompts.text(`New ${attribute}`, current)
        if (newValue && newValue !== current) {
            editAttribute(id, attribute, newValue)
        }
    }
</script>

<SettingsPageContent title="Media Sources">
    {#snippet headerActions()}
        <Button
            card
            icon="mdiPlus"
            onclick={() => {
                const element = mount(AddNewMediaSourcePopup, {
                    target: document.body,
                    props: { close: () => unmount(element) }
                })
            }}
        >
            Add source
        </Button>
    {/snippet}

    <Table
        headers={["Id", "Name", "Base URL", "Endpoint", "Mapping"]}
        data={data.mediaSources}
    >
        {#snippet children({ entry })}
            <td>{entry.id}</td>
            <td>
                {entry.name}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={() => editString(entry.id, "name", entry.name)}
                    />
                </div>
            </td>
            <td>
                {entry.baseUrl}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={() =>
                            editString(entry.id, "baseUrl", entry.baseUrl)}
                    />
                </div>
            </td>
            <td>
                {entry.searchEndpoint}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={() =>
                            editString(
                                entry.id,
                                "searchEndpoint",
                                entry.searchEndpoint
                            )}
                    />
                </div>
            </td>
            <td>
                <span title={entry.mapping}
                    >{entry.mapping.length > 30
                        ? entry.mapping.substring(0, 30) + "..."
                        : entry.mapping}</span
                >
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={() =>
                            editString(entry.id, "mapping", entry.mapping)}
                    />
                </div>
            </td>
        {/snippet}
    </Table>
</SettingsPageContent>

<style lang="scss">
    td {
        position: relative;

        .floating {
            position: absolute;
            top: 0;
            right: 0;
            display: none;
        }

        &:hover .floating {
            display: block;
        }
    }
</style>
