<script lang="ts">
    import { PressedKeys } from "runed"
    import { onMount } from "svelte"

    import { page } from "$app/state"
    import { isMobile } from "$lib/context"
    import {
        goToNextMedia,
        goToPreviousMedia,
        mediaController,
        type MediaType
    } from "$lib/controllers/MediaController.svelte"
    import { controller, settings } from "$lib/stores.svelte"
    import vars from "$lib/vars.svelte"

    import MediaViewerImage from "./MediaViewerImage.svelte"
    import MediaViewerVideo from "./MediaViewerVideo.svelte"
    import Toolbar from "./Toolbar.svelte"

    let mediaElement: HTMLElement | null = $state(null)
    let isZoomedIn = false

    const getPreloadedImageUrls = (visibleMedium: MediaType | null) => {
        if (!visibleMedium) return []

        const mediaIndex = mediaController.media.findIndex(
            m => m.id == visibleMedium?.id
        )

        const output = []
        for (let i = 1; i <= 3; i++) {
            if (
                mediaIndex + i < mediaController.media.length &&
                mediaController.media[mediaIndex + i].type.startsWith("image")
            ) {
                output.push(
                    `${page.data.serverURL}/file/${
                        mediaController.media[mediaIndex + i].id
                    }${vars.imageSuffixParameter}?session=${page.data.session}`
                )
            } else {
                break
            }
        }

        return output
    }
    let preloadedImageUrls = $derived(
        getPreloadedImageUrls(mediaController.visibleMedium)
    )

    let hideControls = $state(false)
    let hideTimeout: NodeJS.Timeout

    const hideControlsAfterTimeout = () => {
        clearTimeout(hideTimeout)
        hideTimeout = setTimeout(() => {
            hideControls = true
        }, 3000)
    }

    onMount(() => {
        const handleMouseMove = () => {
            hideControls = false
            hideControlsAfterTimeout()
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseleave", () => {
            hideControls = true
            clearTimeout(hideTimeout)
        })

        hideControlsAfterTimeout()

        const keys = new PressedKeys()
        keys.onKeys(["escape"], () => {
            vars.layout.isFullscreen = false
            mediaController.visibleMedium = null
        })

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            clearTimeout(hideTimeout)
        }
    })
</script>

{#if mediaController.visibleMedium}
    <main
        class:fullscreen={vars.layout.isFullscreen}
        class:mobile={isMobile.current}
    >
        <div class="toolbar">
            <Toolbar {hideControls} />
        </div>
        <div
            id="media"
            bind:this={mediaElement}
            class:darkened={vars.layout.isFullscreen}
            class:isZoomedIn
            onpointerdown={e => {
                if ($settings.mediaTouchAction == "navigate") {
                    // @ts-ignore
                    const { width } = mediaElement.getBoundingClientRect()

                    if (e.clientY > window.innerHeight - 200) return

                    if (e.offsetX < width / 2) goToPreviousMedia()
                    if (e.offsetX > width / 2) goToNextMedia()
                }
            }}
        >
            {#if mediaController.visibleMedium.type.startsWith("image")}
                <MediaViewerImage />
            {:else if mediaController.visibleMedium.type.startsWith("video")}
                <MediaViewerVideo {hideControls} />
            {:else}
                <span>{mediaController.visibleMedium.name}</span>
            {/if}
        </div>
    </main>

    {#each preloadedImageUrls as href}
        <link rel="preload" as="image" {href} />
    {/each}
{/if}

<style lang="scss">
    main {
        display: grid;
        grid-template-rows: auto 1fr;

        min-width: 40vw;
        max-width: min(1000px, 40vw);
        height: 100vh;

        background: var(--color-dark-level-lower);

        &:not(&.fullscreen) {
            border-left: 1px solid var(--border-color-base);
        }

        #media {
            background: var(--color-lowest);
        }

        &.fullscreen,
        &.mobile {
            width: 100vw !important;
            max-width: none !important;

            #media {
                background: #000;
            }
        }
    }
</style>
