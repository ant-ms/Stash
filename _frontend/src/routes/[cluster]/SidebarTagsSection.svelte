<script lang="ts">
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import SidebarSection from "$components/SidebarSection.svelte"
    import { layout } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import tagsController from "$lib/controllers/TagsController.svelte"
    import { selectedMediaIds } from "$lib/stores.svelte"

    import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"
</script>

<main class:mobile={layout.current == "mobile"}>
    <Button
        icon="mdiBackspaceOutline"
        onclick={() => {
            selectedMediaIds.set([])
            mediaController.selectedTags = []
        }}
    >
        Clear
    </Button>
    <SidebarSection>
        {#each Object.values(tagsController.tagMap)
            .filter(t => !t.parentId)
            .sort( (a, b) => (page.params.cluster == "Camp Buddy" ? b.tag.localeCompare(a.tag) : b.count + b.indirectCount - (a.count + a.indirectCount)) ) as tag}
            <SidebarHierarchyEntry tagId={tag.id} />
        {/each}
    </SidebarSection>
</main>

<style lang="scss">
    main {
        scrollbar-width: none;
        scroll-padding: 38px;
        overflow: scroll;
        max-height: calc(100vh - 69px);

        &.mobile {
            max-height: calc(100vh - 56px - 1rem);
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
    }
</style>
