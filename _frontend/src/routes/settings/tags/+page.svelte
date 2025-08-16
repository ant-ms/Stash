<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import { page } from "$app/stores"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import TagChip from "$components/Tags/TagChip.svelte"
    import query from "$lib/client/call.js"
    import { prompts } from "$lib/controllers/PromptController.js"

    import type { PageData } from "./$types.js"

    let { data } = $props()
</script>

<SettingsPageContent title="Tags">
    <Table
        headers={[
            "Id",
            "Icons",
            "Tag",
            "Description",
            "Tags",
            "Media count",
            "Clusters"
        ]}
        data={data.tags}
    >
        {#snippet children({ entry })}
            <td id={entry.id}>
                {entry.id}
            </td>
            <td align="center">
                {#if entry.icon}
                    <Icon nameAlt={entry.icon} />
                {:else if entry.indirectIcon}
                    <Icon nameAlt={entry.indirectIcon} opacity={0.35} />
                {/if}
                <!-- TODO: Make reusable -->
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async () => {
                            const newIcon = await prompts.icon(
                                "Select a new icon",
                                entry.icon || ""
                            )
                            if (newIcon) {
                                const previousIcon = entry.icon
                                query("tag_update_icon", {
                                    tagId: entry.id,
                                    newIcon
                                })
                                    .catch(e => {
                                        console.error(e)
                                        entry.icon = previousIcon
                                    })
                                    .then(() => invalidateAll())
                            }
                        }}
                    />
                </div>
            </td>
            <td style="text-transform: capitalize">
                {entry.tagBeforePrefix
                    .substring(0, entry.tagBeforePrefix.lastIndexOf("/"))
                    .replace("/", " / ")}
                /
                <span style:color="var(--accent-foreground)">{entry.tag}</span>
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async () => {
                            const newName = await prompts.text(
                                "Select a new name",
                                entry.tag || ""
                            )
                            if (newName) {
                                const previousName = entry.tag
                                query("TagUpdateName", {
                                    tagId: entry.id,
                                    newName
                                })
                                    .catch(e => {
                                        console.error(e)
                                        entry.tag = previousName
                                    })
                                    .then(() => invalidateAll())
                            }
                        }}
                    />
                </div>
            </td>
            <td>
                {entry.description}
                <div class="floating">
                    <Button
                        icon="mdiPencil"
                        onclick={async () => {
                            const newDescription = await prompts.text(
                                "Enter a new description for the medium",
                                entry.description || ""
                            )
                            if (newDescription) {
                                const previousDescription =
                                    entry.description || null
                                entry.description = newDescription
                                query("TagUpdateDescription", {
                                    tagId: entry.id,
                                    description: newDescription
                                })
                                    .catch(e => {
                                        console.error(e)
                                        entry.icon = previousDescription
                                    })
                                    .then(() => invalidateAll())
                            }
                        }}
                    />
                </div>
            </td>
            <td>
                <span>
                    {data.tagToTagMappings
                        .filter(t => t.id == entry.id)
                        .flatMap(t => t.tagged.map(tg => tg.tag))
                        .join(", ")}
                </span>
                <div class="floating">
                    <Button
                        icon="mdiPlus"
                        onclick={async () => {
                            const tagToReference = await prompts.tag(
                                "Select tag to reference"
                            )
                            if (tagToReference) {
                                await query("createTagToTagReference", {
                                    tagId: entry.id,
                                    tagToReferenceId: tagToReference.id
                                })
                                invalidateAll()
                            }
                        }}
                    />
                </div>
            </td>
            <td>
                {entry.count}
            </td>
            <td>
                {data.tagClusterMappings[entry.id] &&
                    data.tagClusterMappings[entry.id]
                        .map(
                            cluster =>
                                ($page.data as PageData).clusters.find(
                                    c => c.id == cluster
                                )?.name
                        )
                        .join(", ")}
                <div class="floating">
                    <Button
                        noMargin
                        icon="mdiPencil"
                        onclick={async () => {
                            const selectedClusterIds =
                                await prompts.selectMultiple(
                                    "Permitted Clusters",
                                    data.clusters.map(c => ({
                                        value: c.id.toString(),
                                        name: c.name
                                    })),
                                    [
                                        ...new Set(
                                            data.tagClusterMappings[entry.id]
                                                .map(cluster =>
                                                    (
                                                        $page.data as PageData
                                                    ).clusters
                                                        .find(
                                                            c => c.id == cluster
                                                        )
                                                        ?.id.toString()
                                                )
                                                .filter(
                                                    cluster =>
                                                        cluster !== undefined
                                                )
                                        )
                                    ]
                                )
                            if (selectedClusterIds) {
                                await query("changeClustersOfTag", {
                                    tagId: entry.id,
                                    clusterIds: selectedClusterIds.map(id =>
                                        parseInt(id)
                                    )
                                })
                                invalidateAll()
                            }
                        }}
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
        }

        &:not(:hover) {

            .floating {
                display: none;
            }
        }
    }
</style>
