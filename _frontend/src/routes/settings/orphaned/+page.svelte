<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"

    import type { PageData } from "./$types"

    interface Props {
        data: PageData
    }

    let { data }: Props = $props()

    const importOrphan = async (cluster: number, filename: string) => {
        const response = await fetch(`/settings/orphaned/${filename}`, {
            method: "POST",
            body: JSON.stringify({
                cluster: cluster
            })
        })

        if (!response.ok) throw "Something went wrong with the import"
        invalidateAll()
    }

    const deleteOrphan = async (filename: string) => {
        const response = await fetch(`/settings/orphaned/${filename}`, {
            method: "DELETE"
        })

        if (!response.ok) throw "Something went wrong with the deletion"
        invalidateAll()
    }
</script>

<SettingsPageContent title="Orphaned Files">
    <Table data={data.unimportedFiles}>
        {#snippet children({ entry })}
            <td>
                <a href="{page.data.serverURL}/file/{entry}">{entry}</a>
                {#each data.clusters as cluster}
                    <Button
                        noMargin
                        onclick={() => {
                            importOrphan(cluster.id, entry)
                        }}
                    >
                        {cluster.name}
                    </Button>
                {/each}
                <Button
                    noMargin
                    icon="mdiTrashCan"
                    onclick={() => {
                        deleteOrphan(entry)
                    }}
                />
            </td>
        {/snippet}
    </Table>
</SettingsPageContent>

<style lang="scss">
    td {
        display: flex;
        align-items: center;
        justify-content: end;

        a {
            flex-grow: 1;
        }
    }
</style>
