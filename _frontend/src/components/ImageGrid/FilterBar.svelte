<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import Select from "$components/elements/Select.svelte"
    import { refreshFilters } from "$lib/client/QuickSwitchHelpers/filters.svelte"
    import { SUBJECT_TYPES } from "$lib/constants"
    import { layout } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"

    import { sortingMethods } from "../../types"

    const update = () => {
        refreshFilters()
    }
</script>

<div class="filter-bar" class:mobile={layout.current == "mobile"}>
    <div class="group toggles">
        <Button
            icon={mediaController.filters.favouritesOnly
                ? "mdiStar"
                : "mdiStarOutline"}
            active={mediaController.filters.favouritesOnly}
            onclick={() => {
                mediaController.filters.favouritesOnly =
                    !mediaController.filters.favouritesOnly
                update()
            }}
            title="Favourites Only"
            card
            noMargin
        />
        <Button
            icon={mediaController.filters.traverse
                ? "mdiGraph"
                : "mdiGraphOutline"}
            active={mediaController.filters.traverse}
            onclick={() => {
                mediaController.filters.traverse =
                    !mediaController.filters.traverse
                update()
            }}
            title="Traverse"
            card
            noMargin
        />
        <Button
            icon={mediaController.filters.includeTaggedTags
                ? "mdiTagMultiple"
                : "mdiTag"}
            active={mediaController.filters.includeTaggedTags}
            onclick={() => {
                mediaController.filters.includeTaggedTags =
                    !mediaController.filters.includeTaggedTags
                update()
            }}
            title="Include Tagged Tags"
            card
            noMargin
        />
    </div>

    <div class="group">
        <Select
            value={mediaController.filters.mediaType}
            options={[
                { value: "all", name: "All Types", icon: "mdiMultimedia" },
                { value: "image", name: "Images", icon: "mdiImage" },
                { value: "video", name: "Videos", icon: "mdiVideo" }
            ]}
            onchange={v => {
                mediaController.filters.mediaType = v
                update()
            }}
            width={130}
        />
        <Select
            value={mediaController.filters.activeSortingMethod}
            options={sortingMethods.map((s, i) => ({
                value: i,
                name: s.title,
                icon: s.icon
            }))}
            onchange={v => {
                if (
                    v == mediaController.filters.activeSortingMethod &&
                    sortingMethods[v].id == "Random"
                ) {
                    mediaController.filters.seed = Math.random()
                } else {
                    mediaController.filters.activeSortingMethod = v
                }
                update()
            }}
            width={180}
        />
    </div>

    <div class="group">
        <Select
            value={mediaController.filters.minResolution}
            prefix="Res"
            options={[
                { value: null, name: "Any", icon: "mdiAllInclusive" },
                { value: 720, name: "720p+", icon: "mdiStandardDefinition" },
                { value: 1080, name: "1080p+", icon: "mdiHighDefinition" },
                { value: 2160, name: "4K+", icon: "mdiVideo4kBox" }
            ]}
            onchange={v => {
                mediaController.filters.minResolution = v
                update()
            }}
            width={120}
        />
        <Select
            value={mediaController.filters.specialFilterAttribute}
            prefix="Subject"
            options={SUBJECT_TYPES.map(s => ({
                value: s.value,
                name: s.value || "Any",
                icon: s.icon
            }))}
            onchange={v => {
                mediaController.filters.specialFilterAttribute = v
                update()
            }}
            width={130}
        />
        <Select
            value={mediaController.filters.countOfTags}
            prefix="Tags"
            options={[
                { value: -1, name: "Any", icon: "mdiAllInclusive" },
                { value: 0, name: "0", icon: "mdiNumeric0" },
                { value: 1, name: "1", icon: "mdiNumeric1" },
                { value: 2, name: "2", icon: "mdiNumeric2" },
                { value: 3, name: "3", icon: "mdiNumeric3" }
            ]}
            onchange={v => {
                mediaController.filters.countOfTags = v
                update()
            }}
            width={110}
        />
    </div>
</div>

<style lang="scss">
    .filter-bar {
        position: sticky;
        top: 0;
        z-index: 10;

        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;

        padding: 0.5rem;
        background: var(--color-dark-level-1);
        border-bottom: 1px solid var(--border-color-base);

        margin-top: -1em;
        margin-right: -1em;
        margin-bottom: 1rem;
        margin-left: -1em;

        .group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        &.mobile {
            position: relative;
            top: unset;

            flex-direction: column;
            gap: 0.5rem;

            margin-top: 0;
            margin-right: 0;
            margin-left: 0;
            border-radius: 0.75rem;
            border: 1px solid var(--border-color-base);

            .group {
                width: 100%;
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                gap: 0.5rem;

                :global(main) {
                    width: 100% !important;
                }
            }
        }
    }
</style>
