<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/state"
    import TagsController from "$lib/controllers/TagsController.svelte"
    import { controller } from "$lib/stores.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import SidebarHierarchyEntry from "../routes/[cluster]/SidebarHierarchyEntry.svelte"
    import Button from "./elements/Button.svelte"
    import Icon from "./elements/Icon.svelte"
    import Select from "./elements/Select.svelte"
    import FilterBar from "./ImageGrid/FilterBar.svelte"

    let leftPanelOpen = $state(false)
    let rightPanelOpen = $state(false)

    // For swipe-to-open logic
    let startX = 0
    let currentX = 0
    let isSwiping = false

    function handleTouchStart(e: TouchEvent) {
        // Prevent swipe from triggering if we touch a scrollable area inside a panel
        const target = e.target as HTMLElement
        if (target.closest(".panel-content")) return

        startX = e.touches[0].clientX
        currentX = startX
        isSwiping = true
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isSwiping) return
        currentX = e.touches[0].clientX
    }

    function handleTouchEnd() {
        if (!isSwiping) return
        isSwiping = false
        const deltaX = currentX - startX
        const threshold = 60 // Minimum swipe distance

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                // Swipe Right
                if (rightPanelOpen) {
                    rightPanelOpen = false
                } else if (!leftPanelOpen && startX < 50) {
                    leftPanelOpen = true
                }
            } else {
                // Swipe Left
                if (leftPanelOpen) {
                    leftPanelOpen = false
                } else if (!rightPanelOpen && startX > window.innerWidth - 50) {
                    rightPanelOpen = true
                }
            }
        }
    }

    // Navbar Dragging logic
    let navbarStartX = 0
    let navbarIsDragging = false

    function handleNavbarTouchStart(e: TouchEvent) {
        navbarStartX = e.touches[0].clientX
        navbarIsDragging = true
    }

    function handleNavbarTouchMove(e: TouchEvent) {
        if (!navbarIsDragging) return
        const deltaX = e.touches[0].clientX - navbarStartX
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0 && !leftPanelOpen) {
                leftPanelOpen = true
                navbarIsDragging = false
            } else if (deltaX < 0 && !rightPanelOpen) {
                rightPanelOpen = true
                navbarIsDragging = false
            }
        }
    }

    function handleNavbarTouchEnd() {
        navbarIsDragging = false
    }

    const clusterOptions = $derived(
        (page.data.clusters || []).map((c: any) => ({
            value: c.name,
            name: c.name,
            icon: c.icon
        }))
    )

    const activeCluster = $derived(
        clusterOptions.find((c: any) => page.url.pathname.includes(c.value))
            ?.value
    )
</script>

<svelte:window
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
/>

<main>
    <!-- Left Panel (Tags) -->
    <div class="side-panel left" class:open={leftPanelOpen}>
        <div class="panel-content">
            {#each Object.values(TagsController.tagMap)
                .filter(t => !t.parentId)
                .sort( (a, b) => (page.params.cluster == "Camp Buddy" ? b.tag.localeCompare(a.tag) : b.count + b.indirectCount - (a.count + a.indirectCount)) ) as tag}
                <SidebarHierarchyEntry tagId={tag.id} />
            {/each}
        </div>
    </div>

    <!-- Right Panel (Filters) -->
    <div class="side-panel right" class:open={rightPanelOpen}>
        <div class="panel-content filters">
            <FilterBar />
        </div>
    </div>

    <!-- Overlay -->
    {#if leftPanelOpen || rightPanelOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="overlay"
            onclick={() => {
                leftPanelOpen = false
                rightPanelOpen = false
            }}
        ></div>
    {/if}

    <!-- Floating Navigation Bar -->
    <div
        class="navbar-container"
        ontouchstart={handleNavbarTouchStart}
        ontouchmove={handleNavbarTouchMove}
        ontouchend={handleNavbarTouchEnd}
    >
        <div class="navbar-pill">
            <!-- Tags Indicator -->
            <div
                class="indicator left"
                class:active={leftPanelOpen}
                onclick={() => (leftPanelOpen = !leftPanelOpen)}
            >
                <Icon name="mdiTag" size={0.8} />
            </div>

            {#if page.url.pathname.includes("settings")}
                <Button
                    size="large"
                    card
                    icon="mdiArrowLeft"
                    onclick={() => history.back()}
                    styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
                />
            {:else}
                <Select
                    value={activeCluster}
                    options={clusterOptions}
                    onchange={v => goto(`/${v}`)}
                    width={110}
                    large
                    position="top"
                />
            {/if}

            <div class="spacer"></div>

            <div class="right-actions">
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
                    styleOverride="padding: 0.75rem; --outline-size: 3px; --border-radius: 13px"
                />
            </div>

            <!-- Filters Indicator -->
            <div
                class="indicator right"
                class:active={rightPanelOpen}
                onclick={() => (rightPanelOpen = !rightPanelOpen)}
            >
                <Icon
                    name={rightPanelOpen ? "mdiFilter" : "mdiFilterOutline"}
                    size={0.8}
                />
            </div>
        </div>
    </div>
</main>

<style lang="scss">
    main {
        touch-action: none;
        position: relative;
        z-index: 100;
    }

    .navbar-container {
        position: fixed;
        z-index: 110;
        right: 0;
        bottom: 1rem;
        left: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 0 1rem;

        -webkit-tap-highlight-color: transparent;
    }

    .navbar-pill {
        display: flex;
        gap: 0.25rem;
        align-items: center;

        width: 100%;
        max-width: 450px;
        height: 60px;
        padding: 0 0.25rem;
        border: 1px solid var(--border-color-1);
        border-radius: 16px;

        background-color: var(--color-dark-level-1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

        .indicator {
            display: flex;
            gap: 2px;
            align-items: center;

            height: 100%;
            padding: 0 0.5rem;

            color: var(--color-text);

            opacity: 0.6;

            transition:
                opacity 0.2s,
                transform 0.2s;

            &.active {
                color: var(--accent);
                opacity: 1;
            }

            &:active {
                transform: scale(0.9);
            }
        }

        :global(> main) {
            box-sizing: border-box;
            height: auto !important;
            margin: 0.25em;
            padding: 0.75rem !important;
            border-radius: 13px !important;
        }

        .right-actions {
            display: flex;
            gap: 0.1rem;
            align-items: center;
        }

        .spacer {
            flex-grow: 1;
            height: 100%; // To make the spacer draggable
        }
    }

    .side-panel {
        position: fixed;
        z-index: 102;
        bottom: calc(60px + 2rem);

        display: flex;
        flex-direction: column;

        width: 85vw;
        max-width: 400px;
        max-height: calc(100vh - 60px - 3rem);
        border: 1px solid var(--border-color-1);
        border-radius: 16px;

        background-color: var(--color-dark-level-1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

        transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);

        &.left {
            left: 1rem;
            transform: translateX(calc(-100% - 2rem));

            &.open {
                transform: translateX(0);
            }
        }

        &.right {
            right: 1rem;
            transform: translateX(calc(100% + 2rem));

            &.open {
                transform: translateX(0);
            }
        }

        .panel-content {
            overflow-y: auto;
            overscroll-behavior-y: contain;
            flex-grow: 1;
            padding: 0.5rem;

            &.filters {
                padding: 1rem;
            }
        }
    }

    .overlay {
        position: fixed;
        z-index: 101;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
    }
</style>
