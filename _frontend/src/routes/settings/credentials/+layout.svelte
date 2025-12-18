<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import { prompts } from "$lib/controllers/PromptController"

    import type { LayoutData } from "./$types"

    interface PermittedCluster {
        id: number
        name: string
    }

    let {
        data,
        children
    }: {
        data: LayoutData
        children: any
    } = $props()

    const editUsername = async (id: number, newUsername: string) => {
        const response = await fetch("/settings/credentials/edit/username", {
            method: "POST",
            body: JSON.stringify({ id, username: newUsername })
        })

        if (!response.ok) {
            window.alert(`Something went wrong, got status: ${response.status}`)
            console.error(await response.text())
            return
        }

        invalidateAll()
    }

    const editPermittedClusters = async (id: number, newClusters: number[]) => {
        const response = await fetch("/settings/credentials/edit/clusters", {
            method: "POST",
            body: JSON.stringify({ id, clusters: newClusters })
        })

        if (!response.ok) {
            window.alert(`Something went wrong, got status: ${response.status}`)
            console.error(await response.text())
            return
        }

        invalidateAll()
    }
</script>

<SettingsPageContent title="Credentials">
    {#snippet headerActions()}
        <Button card icon="mdiPlus" href="/settings/credentials/new">
            Add Credential
        </Button>
        <Button card icon="mdiLogout" href="/settings/credentials/logout">
            Logout
        </Button>
    {/snippet}

    <Table headers={["Username", "Permitted Clusters"]} data={data.credentials}>
        {#snippet children({ entry })}
            <td>
                {entry.username}
                <div class="floating">
                    <Button
                        noMargin
                        icon="mdiPencil"
                        onclick={async () => {
                            const newName = await prompts.text(
                                "New name",
                                entry.username
                            )
                            if (newName) editUsername(entry.id, newName)
                        }}
                    />
                </div>
            </td>
            <td>
                {entry.permittedClusters
                    .map((c: PermittedCluster) => c.name)
                    .join(", ")}
                <div class="floating">
                    <Button
                        noMargin
                        icon="mdiPencil"
                        onclick={async () => {
                            const newClusters = await prompts.selectMultiple(
                                "Permitted Clusters",
                                data.allClusters.map(c => ({
                                    value: c.id.toString(),
                                    name: c.name
                                })),
                                entry.permittedClusters.map(
                                    (c: PermittedCluster) => c.id.toString()
                                )
                            )
                            if (newClusters)
                                editPermittedClusters(
                                    entry.id,
                                    newClusters.map(v => +v)
                                )
                        }}
                    />
                </div>
            </td>
        {/snippet}
    </Table>
</SettingsPageContent>

{@render children()}

<style lang="scss">
    td {
        position: relative;

        .floating {
            position: absolute;
            top: 0;
            right: 0;
        }

        &:not(:hover) {

            .floating {
                display: none;
            }
        }
    }
</style>
