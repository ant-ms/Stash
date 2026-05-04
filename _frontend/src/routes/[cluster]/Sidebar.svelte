<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Select from "$components/elements/Select.svelte"
    import { layout } from "$lib/context"
    import { controller } from "$lib/stores.svelte"
    import vars from "$lib/vars.svelte"

    import type { PageData } from "./$types"
    import SidebarTagsSection from "./SidebarTagsSection.svelte"

    let pageData = $derived(page.data as PageData)
</script>

<main
    class:mobile={layout.current == "mobile"}
    class:windowControlsSpacerVisible={vars.layout.windowControlsSpacerVisible}
    class:hidden={vars.layout.hideSidebar}
>
    <div class="header">
        <Select
            onchange={name => {
                goto(`/${name}`)
            }}
            value={page.data.cluster.name}
            options={pageData.clusters.map(c => ({
                value: c.name,
                name: c.name,
                icon: c.icon as any
            }))}
            width={-1}
            allowMouseWheel
        />
        <Button
            icon={vars.layout.isFilterBarVisible
                ? "mdiFilter"
                : "mdiFilterOutline"}
            onclick={() => {
                vars.layout.isFilterBarVisible = !vars.layout.isFilterBarVisible
            }}
            active={vars.layout.isFilterBarVisible}
            noMargin
            styleOverride="margin-left: 1rem"
        />
        <Button
            icon="mdiCog"
            href="/settings/general"
            oncontextmenu={e => {
                e.preventDefault()
                $controller.setPopup("Quick Switch")
            }}
            active={page.url.pathname.startsWith("/settings")}
            noMargin
        />
    </div>
    <section>
        <SidebarTagsSection />
    </section>
</main>

<style lang="scss">
    main {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;

        width: 250px;
        height: 100vh;
        border-right: 1px solid var(--border-color-base);

        background: var(--color-dark-level-1);

        -webkit-app-region: drag;

        &.hidden {
            display: none;
        }

        section {
            flex-grow: 1;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border-color-base);

            &::-webkit-scrollbar {
                display: none;
            }
        }

        &.mobile {
            width: 100%;
            height: 80vh;
            border: none;
        }

        &.windowControlsSpacerVisible {
            padding-top: 1.5rem;
        }

        .header {
            display: grid;
            grid-template-columns: 1fr auto auto;
            padding: 0.5rem;
        }
    }
</style>
