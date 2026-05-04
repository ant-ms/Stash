<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import { prompts } from "$lib/controllers/PromptController"

    import type { PageData } from "./$types"

    interface Props {
        data: PageData
    }

    let { data }: Props = $props()

    const addIcon = async () => {
        const name = await prompts.text("Icon Name (e.g. extraMyIcon)")
        if (!name) return

        const svgData = await prompts.text("SVG Path/Data (e.g. <path d=\"...\" />)")
        if (!svgData) return

        const response = await fetch("/api/icons", {
            method: "POST",
            body: JSON.stringify({ name, svgData })
        })

        if (!response.ok) {
            window.alert("Failed to add icon")
            return
        }

        invalidateAll()
    }

    const editIcon = async (icon: any) => {
        const name = await prompts.text("Icon Name", icon.name)
        if (!name) return

        const svgData = await prompts.text("SVG Path/Data", icon.svgData)
        if (!svgData) return

        const response = await fetch(`/api/icons/${icon.id}`, {
            method: "PATCH",
            body: JSON.stringify({ name, svgData })
        })

        if (!response.ok) {
            window.alert("Failed to update icon")
            return
        }

        invalidateAll()
    }

    const deleteIcon = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this icon?")) return

        const response = await fetch(`/api/icons/${id}`, {
            method: "DELETE"
        })

        if (!response.ok) {
            window.alert("Failed to delete icon")
            return
        }

        invalidateAll()
    }
</script>

<SettingsPageContent title="Custom Icons">
    {#snippet headerActions()}
        <Button card icon="mdiPlus" onclick={addIcon}>
            Add new icon
        </Button>
    {/snippet}

    <Table headers={["Preview", "Name", "SVG Data", "Actions"]} data={data.customIcons}>
        {#snippet children({ entry })}
            <td>
                <Icon nameAlt={entry.name} />
            </td>
            <td>
                {entry.name}
            </td>
            <td class="svg-data">
                {entry.svgData}
            </td>
            <td>
                <Button icon="mdiPencil" onclick={() => editIcon(entry)} />
                <Button icon="mdiDelete" onclick={() => deleteIcon(entry.id)} />
            </td>
        {/snippet}
    </Table>
</SettingsPageContent>

<style lang="scss">
    .svg-data {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: monospace;
        font-size: 0.8rem;
    }
</style>
