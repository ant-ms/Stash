<script lang="ts">
    import { Spring } from "svelte/motion"

    import { page } from "$app/state"
    import TagsController from "$lib/controllers/TagsController.svelte"
    import { controller } from "$lib/stores.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import SidebarHierarchyEntry from "../routes/[cluster]/SidebarHierarchyEntry.svelte"
    import Button from "./elements/Button.svelte"

    // Svelte 5 runes for state management
    let windowHeight = $state(0)
    let innerHeight = $derived(windowHeight - 96)

    // Spring store for smooth height animation
    const contentHeight = new Spring(0, {
        stiffness: 0.2,
        damping: 0.8
    })

    let isDragging = $state(false)
    let startY = $state(0)
    let startHeight = $state(0)
    let startedAtTop = $state(false)

    function startDrag(event: MouseEvent | TouchEvent) {
        const target = event.target as HTMLElement
        if (target.closest("a")) return

        isDragging = true

        const y =
            event instanceof TouchEvent
                ? event.touches[0].clientY
                : event.clientY
        startY = y
        startHeight = contentHeight.current // Get current value of the spring
        startedAtTop = startHeight === innerHeight

        // Add window event listeners for move and end events
        window.addEventListener("mousemove", handleDrag, { passive: false })
        window.addEventListener("mouseup", stopDrag)
        window.addEventListener("touchmove", handleDrag, { passive: false })
        window.addEventListener("touchend", stopDrag)
    }

    function handleDrag(event: MouseEvent | TouchEvent) {
        if (!isDragging) return

        if (event instanceof TouchEvent) {
            event.preventDefault()
        }

        const currentY =
            event instanceof TouchEvent
                ? event.touches[0].clientY
                : event.clientY
        const deltaY = startY - currentY // Inverted for natural dragging
        let newHeight = startHeight + deltaY

        // Update spring value directly, it won't "jump" because it's a spring
        contentHeight.set(Math.max(0, Math.min(innerHeight, newHeight)), {
            hard: true
        })
    }

    function stopDrag() {
        isDragging = false

        // Snap to the nearest position using the spring's animation
        if (startedAtTop) {
            contentHeight.set(
                contentHeight.current > window.innerHeight * 0.8
                    ? innerHeight
                    : 0
            )
        } else {
            contentHeight.set(
                contentHeight.current > window.innerHeight * 0.2
                    ? innerHeight
                    : 0
            )
        }

        // Clean up window event listeners
        window.removeEventListener("mousemove", handleDrag)
        window.removeEventListener("mouseup", stopDrag)
        window.removeEventListener("touchmove", handleDrag)
        window.removeEventListener("touchend", stopDrag)
    }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<main>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="always-visible"
        onmousedown={startDrag}
        ontouchstart={startDrag}
    >
        <div class="drag-region">
            <div class="dragger"></div>
        </div>
        <div class="buttons">
            {#each page.data.clusters as cluster}
                <Button
                    size="large"
                    active={page.url.pathname.includes(cluster.name)}
                    card
                    icon={cluster.icon}
                    href="/{cluster.name}"
                    styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
                />
            {/each}
            <div class="spacer"></div>
            <Button
                size="large"
                active={varsSvelte.layout.castVisible}
                card
                icon="mdiCast"
                onclick={() => {
                    varsSvelte.layout.castVisible =
                        !varsSvelte.layout.castVisible
                }}
                styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
            />
            <Button
                size="large"
                active={page.url.pathname.includes("settings")}
                card
                icon="mdiCog"
                href="/settings/general"
                oncontextmenu={e => {
                    e.preventDefault()
                    $controller.setPopup("Quick Switch")
                }}
                styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
            />
        </div>
    </div>
    <div class="content-out-of-view" style="height: {contentHeight.current}px">
        <!-- {#if contentHeight.current > 0} content can be conditionally rendered based on height -->
        {#each Object.values(TagsController.tagMap)
            .filter(t => !t.parentId)
            .sort( (a, b) => (page.params.cluster == "Camp Buddy" ? b.tag.localeCompare(a.tag) : b.count + b.indirectCount - (a.count + a.indirectCount)) ) as tag}
            <SidebarHierarchyEntry tagId={tag.id} />
        {/each}
        <!-- {/if} -->
    </div>
</main>

<style lang="scss">
    main {
        touch-action: none; // Prevents default touch behaviors like scrolling

        overscroll-behavior-y: contain; // Prevents page reload when dragging down
        display: grid;
        gap: 0.5rem;

        padding: 0.5rem;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;

        background-color: var(--accent-background);
    }

    .always-visible {
        display: grid;
        gap: 0.5rem;
    }

    .drag-region {
        cursor: ns-resize;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 10px;

        -webkit-app-region: drag;

        .dragger {
            width: 30px;
            height: 4px;
            border-radius: 2px;
            background: #777;
        }
    }

    .buttons {
        display: flex;

        .spacer {
            flex-grow: 1;
        }
    }

    .content-out-of-view {
        overflow: scroll;
        // Added transition for smoother visual updates when not dragging
        transition: height 0.1s ease-out;
    }
</style>
