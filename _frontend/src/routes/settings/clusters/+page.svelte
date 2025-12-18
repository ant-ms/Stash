<script lang="ts">
    import prettyBytes from "pretty-bytes"
    import { mount, unmount } from "svelte"

    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import { prompts } from "$lib/controllers/PromptController"
    import { possibleIcons } from "$lib/possibleIcons"

    import type { PageData } from "./$types"
    import AddNewClusterPopup from "./AddNewClusterPopup.svelte"

    interface Props {
        data: PageData
    }

    let { data }: Props = $props()

    const ClusterType = [
        "normal",
        "collection",
        "screenshots",
        "stories",
        "withName"
    ]

    const editClusterAttribute = async (
        id: number,
        attribute: "name" | "icon" | "type",
        value: string
    ) => {
        if (!["name", "icon", "type"].includes(attribute)) {
            window.alert(`Invalid attribute: ${attribute}`)
            return
        }

        if (
            attribute == "icon" &&
            !Object.keys(possibleIcons).includes(value)
        ) {
            window.alert(`Invalid icon: ${value}`)
            return
        }

        if (attribute == "type" && !ClusterType.includes(value)) {
            window.alert(`Invalid type: ${value}`)
            return
        }

        const response = await fetch("/settings/clusters/edit", {
            method: "POST",
            body: JSON.stringify({ id, attribute, value })
        })

        if (!response.ok) {
            window.alert(`Something went wrong, got status: ${response.status}`)
            console.error(await response.text())
            return
        }

        invalidateAll()
        close()
    }
</script>

<SettingsPageContent title="Clusters">
    {#snippet headerActions()}
        <Button
            card
            icon="mdiPlus"
            onclick={async () => {
                const element = mount(AddNewClusterPopup, {
                    target: document.body,
                    props: {
                        close: () => {
                            unmount(element)
                        }
                    }
                })
            }}
        >
            Add new cluster
        </Button>
    {/snippet}

    <Table
        headers={["Id", "Icon", "Name", "Type", "Media Count", "Storage Usage"]}
        data={data.clusters}
    >
        {#snippet children({ entry })}
            {@const mediaCountByClusterImages =
                data.mediaCountByClusterImages.find(
                    c => c.clustersId === entry.id
                )}
            {@const mediaCountByClusterVideos =
                data.mediaCountByClusterVideos.find(
                    c => c.clustersId === entry.id
                )}
            <td>
                {entry.id}
            </td>
            <td>
                <Icon nameAlt={entry.icon} />
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async () => {
                            // TODO: Icon Picker
                            const newIcon = await prompts.icon(
                                "New icon",
                                entry.icon
                            )
                            if (newIcon)
                                editClusterAttribute(entry.id, "icon", newIcon)
                        }}
                    />
                </div>
            </td>
            <td>
                {entry.name}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async () => {
                            const newName = await prompts.text(
                                "New name",
                                entry.name
                            )
                            if (newName)
                                editClusterAttribute(entry.id, "name", newName)
                        }}
                    />
                </div>
            </td>
            <td>
                {entry.type.substring(0, 1).toUpperCase() +
                    entry.type.substring(1)}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async (event: MouseEvent) => {
                            const newType = await prompts.dropdown(
                                event.currentTarget as HTMLElement,
                                ClusterType,
                                entry.type
                            )
                            if (newType && newType != entry.type)
                                editClusterAttribute(entry.id, "type", newType)
                        }}
                    />
                </div>
            </td>
            <td>
                {#if mediaCountByClusterImages && mediaCountByClusterImages._count.id}
                    {mediaCountByClusterImages._count.id} Images
                {/if}
                {#if mediaCountByClusterVideos && mediaCountByClusterVideos._count.id}
                    {mediaCountByClusterVideos._count.id} Videos
                {/if}
            </td>
            <td
                style={`background: linear-gradient(to right, var(--accent-background) ${entry.percentage}%, transparent ${entry.percentage}%)`}
            >
                {#if entry.imageUsage}
                    {prettyBytes(entry.imageUsage)} Images,
                {/if}
                {#if entry.videoUsage}
                    {prettyBytes(entry.videoUsage)} Videos
                {/if}
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
        }

        &:not(:hover) {

            .floating {
                display: none;
            }
        }
    }
</style>
