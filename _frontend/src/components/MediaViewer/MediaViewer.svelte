<script lang="ts">
    import { PressedKeys } from "runed"
    import { onMount } from "svelte"

    import { page } from "$app/state"
    import MobileToolbar from "$components/Mobile/MobileToolbar.svelte"
    import { layout } from "$lib/context"
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
    let {
        translateX = 0,
        isSwiping = false,
        showToolbarOnMobile = true
    } = $props()

    const getPreloadedImageUrls = (visibleMedium: MediaType | null) => {
        if (!visibleMedium) return []

        const mediaIndex = mediaController.media.findIndex(
            m => m.id == visibleMedium?.id
        )

        const output = []

        // Preload previous medium
        if (mediaIndex > 0) {
            const prev = mediaController.media[mediaIndex - 1]
            if (prev.type.startsWith("image")) {
                output.push(
                    `${page.data.serverURL}/file/${prev.id}${vars.imageSuffixParameter ? vars.imageSuffixParameter + "&" : "?"}session=${page.data.session}`
                )
            } else if (prev.type.startsWith("video")) {
                output.push(
                    `${page.data.serverURL}/api/media/${prev.id}/thumbnail?session=${page.data.session}`
                )
            }
        }

        // Preload next mediums
        for (let i = 1; i <= 3; i++) {
            if (mediaIndex + i < mediaController.media.length) {
                const next = mediaController.media[mediaIndex + i]
                if (next.type.startsWith("image")) {
                    output.push(
                        `${page.data.serverURL}/file/${next.id}${vars.imageSuffixParameter ? vars.imageSuffixParameter + "&" : "?"}session=${page.data.session}`
                    )
                } else if (next.type.startsWith("video")) {
                    output.push(
                        `${page.data.serverURL}/api/media/${next.id}/thumbnail?session=${page.data.session}`
                    )
                }
            } else {
                break
            }
        }

        return output
    }
    let preloadedImageUrls = $derived(
        getPreloadedImageUrls(mediaController.visibleMedium)
    )

    let mediaIndex = $derived(
        mediaController.visibleMedium
            ? mediaController.media.findIndex(
                  m => m.id == mediaController.visibleMedium?.id
              )
            : -1
    )
    let prevMedium = $derived(
        mediaIndex > 0 ? mediaController.media[mediaIndex - 1] : null
    )
    let nextMedium = $derived(
        mediaIndex !== -1 && mediaIndex < mediaController.media.length - 1
            ? mediaController.media[mediaIndex + 1]
            : null
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
        class:mobile={layout.current == "mobile"}
        class:toolbar-hidden={layout.current == "mobile" &&
            !showToolbarOnMobile}
    >
        {#if layout.current == "mobile" ? showToolbarOnMobile : true}
            <div class="toolbar">
                {#if layout.current == "mobile"}
                    <MobileToolbar />
                {:else}
                    <Toolbar {hideControls} />
                {/if}
            </div>
        {/if}
        <div
            id="media"
            style="transform: {translateX
                ? `translateX(${translateX}px)`
                : 'none'}; transition: {isSwiping
                ? 'none'
                : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'}"
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
            {#if prevMedium && (translateX > 0 || isSwiping)}
                <div class="swipe-preview prev">
                    <img
                        src={prevMedium.type.startsWith("video")
                            ? `${page.data.serverURL}/api/media/${prevMedium.id}/thumbnail?session=${page.data.session}`
                            : `${page.data.serverURL}/file/${prevMedium.id}${vars.imageSuffixParameter ? vars.imageSuffixParameter + "&" : "?"}session=${page.data.session}`}
                        alt="Previous"
                    />
                </div>
            {/if}

            {#if nextMedium && (translateX < 0 || isSwiping)}
                <div class="swipe-preview next">
                    <img
                        src={nextMedium.type.startsWith("video")
                            ? `${page.data.serverURL}/api/media/${nextMedium.id}/thumbnail?session=${page.data.session}`
                            : `${page.data.serverURL}/file/${nextMedium.id}${vars.imageSuffixParameter ? vars.imageSuffixParameter + "&" : "?"}session=${page.data.session}`}
                        alt="Next"
                    />
                </div>
            {/if}

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
            position: relative;
            background: var(--color-lowest);

            .swipe-preview {
                pointer-events: none;

                position: absolute;
                top: 0;

                display: flex;
                align-items: center;
                justify-content: center;

                width: 100%;
                height: 100%;

                &.prev {
                    left: -100%;
                }

                &.next {
                    left: 100%;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
            }
        }

        &.mobile {
            display: flex;
            flex-direction: column;

            width: 100vw !important;
            max-width: none !important;

            background: #000;

            .toolbar {
                flex-shrink: 0;
                order: 2;
            }

            #media {
                flex-grow: 1;
                order: 1;
                background: #000;
            }

            &.toolbar-hidden {

                .toolbar {
                    display: none;
                }
            }
        }

        &.fullscreen {
            width: 100vw !important;
            max-width: none !important;
            background: #000;

            #media {
                background: #000;
            }
        }
    }
</style>
