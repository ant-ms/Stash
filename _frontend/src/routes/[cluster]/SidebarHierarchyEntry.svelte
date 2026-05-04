<script lang="ts">
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import tagsController from "$lib/controllers/TagsController.svelte"
    import { type IconName } from "$lib/possibleIcons.svelte"
    import { selectedMediaIds } from "$lib/stores.svelte"
    import Dropdown from "$reusables/Dropdown.svelte"

    import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"

    let {
        tagId,
        indent = 0,
        nameOverwrite = "",
        iconOverwrite = null
    }: {
        tagId: number
        indent?: number
        nameOverwrite?: string
        iconOverwrite?: IconName | null
    } = $props()

    $effect(() => {
        if (
            mediaController.selectedTags.length == 1 &&
            mediaController.selectedTags[0].id == tagId
        ) {
            setTimeout(() => {
                const element = document.getElementById(`tag-${tagId}`)
                element?.scrollIntoView({ block: "nearest" })
            }, 100)
        }
    })

    let showDropdown = $state(false)
    let [icon, iconOpacity] = $derived.by(() => {
        if (iconOverwrite) return [iconOverwrite, 1]
        if (tagsController.tagMap[tagId].icon)
            return [tagsController.tagMap[tagId].icon, 1]
        if (tagsController.tagMap[tagId].indirectIcon)
            return [tagsController.tagMap[tagId].indirectIcon, 0.35]
        if (tagsController.tagMap[tagId].collapsed)
            return ["mdiFolderHidden", 1]
        return ["mdiFolderOutline", 1]
    }) as [IconName, number]
</script>

<main id="tag-{tagId}">
    <Button
        styleOverride="margin-left: {0.75 +
            indent}em; text-transform: capitalize"
        count={tagsController.tagMap[tagId].count}
        title="Total: {tagsController.tagMap[tagId].count +
            tagsController.tagMap[tagId]
                .indirectCount} (direct count: {tagsController.tagMap[tagId]
            .count}, indirect count: {tagsController.tagMap[tagId]
            .indirectCount})"
        {icon}
        {iconOpacity}
        onclick={e => {
            selectedMediaIds.set([])
            if (e.altKey) {
                if (
                    mediaController.selectedTags.some(
                        t => t.id == tagsController.tagMap[tagId].id
                    )
                )
                    mediaController.selectedTags =
                        mediaController.selectedTags.filter(
                            t => t.id != tagsController.tagMap[tagId].id
                        )
                else
                    mediaController.selectedTags = [
                        ...mediaController.selectedTags,
                        tagsController.tagMap[tagId]
                    ]
            } else {
                mediaController.selectedTags = [tagsController.tagMap[tagId]]
            }
        }}
        oncontextmenu={e => {
            e.preventDefault()
            showDropdown = !showDropdown
        }}
        onmouseenter={() => mediaController.prefetchMediaForTag(tagId)}
        active={mediaController.selectedTags.some(
            t => t.id == tagsController.tagMap[tagId].id
        )}
    >
        {nameOverwrite || tagsController.tagMap[tagId].tag}
    </Button>

    <Dropdown
        visible={showDropdown}
        top={40}
        left={10}
        right={8}
        position="absolute"
    >
        <Button
            onclick={() => {
                tagsController.toggleTag(
                    tagsController.tagMap[tagId],
                    collapsed => (
                        tagsController.tagMap[tagId],
                        (tagsController.tagMap[tagId] = {
                            ...tagsController.tagMap[tagId],
                            collapsed
                        })
                    )
                )
                showDropdown = false
            }}
            noMargin
            icon={tagsController.tagMap[tagId].collapsed
                ? "mdiArrowExpandVertical"
                : "mdiArrowCollapseVertical"}
        >
            {tagsController.tagMap[tagId].collapsed ? "Uncollapse" : "Collapse"}
        </Button>
        <Button
            onclick={() => {
                tagsController.createTag(tagsController.tagMap[tagId])
                showDropdown = false
            }}
            noMargin
            icon="mdiTagPlus"
        >
            Create new subtag
        </Button>
        <Button href="/settings/tags#{tagId}" noMargin icon="mdiCog">
            Edit in Setings
        </Button>
    </Dropdown>
</main>

{#if tagsController.tagMap[tagId].children && !tagsController.tagMap[tagId].collapsed}
    {#each tagsController.tagMap[tagId].children
        .map(t => t.id)
        .sort( (a, b) => (page.params.cluster == "Camp Buddy" ? tagsController.tagMap[b].tag.localeCompare(tagsController.tagMap[a].tag) : tagsController.tagMap[b].count + tagsController.tagMap[b].indirectCount - (tagsController.tagMap[a].count + tagsController.tagMap[a].indirectCount)) ) as c}
        <SidebarHierarchyEntry indent={indent + 1} tagId={c} />
    {/each}
{/if}

<style lang="scss">
    main {
        position: relative;
    }
</style>
