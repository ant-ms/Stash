<script lang="ts">
    import { onMount } from "svelte"

    import {
        goToNextMedia,
        goToPreviousMedia,
        mediaController
    } from "$lib/controllers/MediaController.svelte"
    import { controller } from "$lib/stores.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import MediaViewer from "../MediaViewer/MediaViewer.svelte"

    // Swipe logic
    let startX = 0
    let startY = 0
    let translateX = $state(0)
    let translateY = $state(0)
    let isSwiping = $state(false)
    let direction: "vertical" | "horizontal" | null = null
    let isToolbarVisible = $state(false)

    function handleTouchStart(e: TouchEvent) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        isSwiping = true
        direction = null
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isSwiping) return
        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY
        const deltaX = currentX - startX
        const deltaY = currentY - startY

        if (!direction) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = "horizontal"
            } else {
                direction = "vertical"
            }
        }

        if (direction === "vertical") {
            translateY = deltaY
        } else if (direction === "horizontal") {
            translateX = deltaX
        }
    }

    function handleTouchEnd() {
        if (!isSwiping) return
        isSwiping = false

        if (direction === "vertical") {
            if (translateY > 150) {
                if (isToolbarVisible) {
                    isToolbarVisible = false
                } else {
                    mediaController.visibleMedium = null
                    $controller.setPopup(null)
                }
            } else if (translateY < -150 && !isToolbarVisible) {
                isToolbarVisible = true
            }
            translateY = 0
            translateX = 0
            direction = null
        } else if (direction === "horizontal") {
            if (translateX > 100) {
                translateX = window.innerWidth
                setTimeout(() => {
                    isSwiping = true
                    goToPreviousMedia()
                    translateX = 0
                    setTimeout(() => {
                        isSwiping = false
                    }, 50)
                }, 300)
            } else if (translateX < -100) {
                translateX = -window.innerWidth
                setTimeout(() => {
                    isSwiping = true
                    goToNextMedia()
                    translateX = 0
                    setTimeout(() => {
                        isSwiping = false
                    }, 50)
                }, 300)
            } else {
                translateX = 0
            }
            translateY = 0
            direction = null
        } else {
            translateY = 0
            translateX = 0
            direction = null
        }
    }

    onMount(() => {
        window.history.pushState({ popupOpened: true }, "")
    })

    const onPopState = (event: PopStateEvent) => {
        mediaController.visibleMedium = null
        $controller.setPopup(null)
    }
</script>

<svelte:window onpopstate={onPopState} />

{#if !varsSvelte.layout.castVisible}
    <main
        style="transform: translateY({translateY}px); opacity: {Math.max(
            0.2,
            1 - Math.max(0, translateY) / 600
        )}; transition: {isSwiping
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s'}"
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
    >
        <MediaViewer
            {translateX}
            {isSwiping}
            showToolbarOnMobile={isToolbarVisible}
        />
    </main>
{/if}

<style lang="scss">
    main {
        touch-action: none;
        will-change: transform, opacity;

        position: fixed;
        z-index: 200;
        top: 0;
        left: 0;

        width: 100vw;
        height: 100vh;

        background: #000;
    }
</style>
