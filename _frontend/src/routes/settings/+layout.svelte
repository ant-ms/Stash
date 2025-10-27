<script lang="ts">
    import { goto } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import MobileBottomBar from "$components/MobileBottomBar.svelte"
    import SidebarSection from "$components/SidebarSection.svelte"
    import { isMobile } from "$lib/context.js"
    import varsSvelte from "$lib/vars.svelte.js"

    let { children, data } = $props()
</script>

<main class:mobile={isMobile.current}>
    <!-- TODO: Mobile support -->
    <section class="sidebar">
        {#if !isMobile.current}
            <div
                style="display: flex;

-webkit-app-region: drag;"
                style:justify-content={varsSvelte.layout.isElectron
                    ? "right"
                    : "left"}
            >
                <Button icon="mdiArrowLeft" onclick={() => goto("/")} />
            </div>
        {/if}

        <SidebarSection title="Personal">
            <Button icon="mdiToggleSwitch" href="/settings/general"
                >General</Button
            >
        </SidebarSection>

        <SidebarSection title="Content">
            <Button icon="mdiRhombusSplit" href="/settings/clusters">
                Clusters
            </Button>
            <Button icon="mdiTagMultiple" href="/settings/tags">Tags</Button>
        </SidebarSection>

        <SidebarSection title="Administration">
            <Button icon="mdiSync" href="/settings/jobs">Jobs</Button>
            <Button icon="mdiTimelapse" href="/settings/scheduled-jobs"
                >Scheduled Jobs</Button
            >
            <Button icon="mdiPassport" href="/settings/credentials">
                Credentials
            </Button>
            <Button icon="mdiDatabaseSearch" href="/settings/queries"
                >Queries</Button
            >
            <Button icon="mdiImageMultiple" href="/settings/icon-packs">
                Icon Packs
            </Button>
        </SidebarSection>

        <SidebarSection title="Integrations">
            <Button icon="mdiTransmissionTower" href="/settings/transmission">
                Transmission
            </Button>
        </SidebarSection>

        <SidebarSection title="Tasks">
            <Button
                icon="mdiFileFind"
                href="/settings/orphaned"
                count={data.unimported_count}
            >
                Orphaned Files
            </Button>
            <Button
                icon="mdiContentDuplicate"
                href="/settings/duplicates"
                count={data.duplicates_count}
            >
                Duplicates
            </Button>
            <Button
                icon="mdiTrashCanOutline"
                href="/settings/trash-bin"
                count={data.trash_count}
            >
                Trash Bin
            </Button>
        </SidebarSection>

        <div class="divider"></div>

        <Button icon="mdiChartBar" href="/settings/statistics"
            >Statistics</Button
        >
        <Button icon="mdiInformationOutline" href="/settings/about"
            >About</Button
        >
    </section>

    <div class="content">
        {@render children()}
    </div>

    {#if isMobile.current}
        <div class="mobileBottomBar">
            <MobileBottomBar />
        </div>
    {/if}
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 234px 1fr;
        height: 100vh;

        .sidebar {
            overflow: hidden;
            display: flex;
            flex-direction: column;

            padding: 5px 0;
            border-right: 1px solid var(--border-color-base);

            background: var(--color-dark-level-1);

            .divider {
                flex-grow: 1;
            }
        }

        .content {
            overflow: hidden;
            flex-grow: 1;
            background: var(--color-dark-level-base);
        }

        .mobileBottomBar {
            grid-column: span 2;
        }

        &.mobile {
            grid-template-columns: 60px 1fr;
        }
    }
</style>
