<script lang="ts">
    import { afterUpdate, onMount } from "svelte"

    import ImageGrid from "$components/ImageGrid/ImageGrid.svelte"
    import MediaViewer from "$components/MediaViewer/MediaViewer.svelte"
    import MenuBar from "$components/MenuBar.svelte"
    import Cast from "$components/Popups/ActionBars/Cast.svelte"
    import { isMobile } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import vars from "$lib/vars.svelte"

    import Sidebar from "./Sidebar.svelte"

    let imageGallerySection: HTMLDivElement | undefined

    const onscroll = (e: Event) => {
        const target = e.target as HTMLDivElement
        if (
            target.scrollHeight - target.scrollTop <=
            target.clientHeight + 2500
        ) {
            mediaController.loadMoreMedia()
        }
    }
</script>

<main class:mobile={isMobile.current}>
    {#if !vars.layout.isFullscreen && !isMobile.current}
        <Sidebar />
    {/if}

    {#if !vars.layout.isFullscreen}
        <div class="center">
            <section
                id="imageGallerySection"
                {onscroll}
                bind:this={imageGallerySection as HTMLDivElement}
            >
                <MenuBar />
                <ImageGrid />
            </section>
        </div>
    {/if}

    {#if vars.layout.castVisible}
        <Cast />
    {/if}

    {#if mediaController.visibleMedium && !isMobile.current && !vars.layout.castVisible}
        <MediaViewer />
    {/if}
</main>

<style lang="scss">
    main {
        overflow: scroll;
        overflow-y: auto;
        display: flex;
        background: var(--color-dark-level-base);

        .center {
            display: flex;
            flex-direction: column;
            flex-grow: 1;

            #imageGallerySection {
                position: relative;

                overflow: scroll;
                flex-basis: 0;
                flex-grow: 1;

                min-width: 350px;
            }
        }

        &.mobile {

            #imageGallerySection {
                min-width: unset;
            }
        }
    }
</style>
