<script lang="ts">
    import Icon from "$components/elements/Icon.svelte"
    import TagChip from "$components/Tags/TagChip.svelte"
    import {
        mediaController,
        type MediaType
    } from "$lib/controllers/MediaController.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import GridThumbnail from "./GridThumbnail.svelte"

    interface Props {
        medium: MediaType
        parent?: boolean
        sub?: boolean
        onclick?: (e: MouseEvent) => void
    }

    let {
        medium,
        parent = false,
        sub = false,
        onclick = undefined
    }: Props = $props()

    const leftClick = (e: MouseEvent) => {
        if (e.metaKey) {
            mediaController.visibleMedium = null
            if (varsSvelte.selectedMedias.includes(medium))
                varsSvelte.selectedMedias = varsSvelte.selectedMedias.filter(
                    j => j != medium
                )
            else
                varsSvelte.selectedMedias = [
                    ...varsSvelte.selectedMedias,
                    medium
                ]
        } else {
            varsSvelte.selectedMedias = []
            if (parent) {
                onclick?.(e)
            } else {
                mediaController.visibleMedium = medium
            }
        }
    }
</script>

<main
    onmouseup={e => leftClick(e)}
    class:active={mediaController.visibleMedium == medium && !parent}
    class:selected={varsSvelte.selectedMedias.includes(medium)}
    class:sub
>
    <div class="thumb">
        <GridThumbnail {medium} disableActive rigidAspectRatio disableZoom />
    </div>

    <div class="details">
        {#if parent}
            {#await fetch(`/api/group-together/${medium.groupedIntoNamesId}`).then( response => response.text() ) then name}
                <b>
                    <Icon name="mdiCardMultiple" size={0.8} />
                    {name}
                </b>
            {/await}
        {:else}
            {#key mediaController.visibleMedium == medium ? mediaController.visibleMedium : null}
                <b>{medium.name}</b>
            {/key}
        {/if}
    </div>

    {#key mediaController.visibleMedium == medium ? mediaController.visibleMedium : null}
        <div class="tags">
            {#each medium.tags as tag}
                <TagChip {tag} compact />
            {/each}
        </div>
    {/key}
</main>

<style lang="scss">
    main {
        user-select: none;

        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.5em;

        padding: 1em;
        border: 1px solid transparent;
        border-radius: 0.5em;

        transition: all 200ms;

        &.sub {
            margin-left: 3em;
        }

        &.active {
            border: 1px solid var(--border-color-1-hover);
            background: var(--color-dark-level-1-hover);
            box-shadow:
                rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
                rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
        }

        &.selected {
            border: 1px solid var(--border-color-2-hover);
            background: var(--color-dark-level-2-hover);
            box-shadow:
                rgba(68, 68, 68, 0.2) 0px 1px 3px 0px,
                rgba(68, 68, 68, 0.12) 0px 1px 2px 0px;
        }

        .details {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 35px;

            b {
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                line-clamp: 2;

                font-weight: bold;
                text-overflow: ellipsis;
            }
        }

        .tags {
            overflow: scroll;
            display: flex;
            margin: -2.25px;
        }

        .thumb {
            position: relative;
        }

        @media (hover: hover) and (pointer: fine) {

            &:hover {
                border: 1px solid var(--border-color-1-hover);
                background: var(--color-dark-level-1-hover);
                box-shadow:
                    rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
                    rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
            }
        }
    }
</style>
