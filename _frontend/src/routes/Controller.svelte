<script lang="ts">
    import { PressedKeys } from "runed"
    import { onMount } from "svelte"

    import { browser } from "$app/environment"
    import { goto } from "$app/navigation"
    import { page } from "$app/state"
    import MediaViewerMobile from "$components/Mobile/MediaViewerMobile.svelte"
    import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
    import ImportPopup from "$components/Popups/ImportPopup/ImportPopup.svelte"
    import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
    import QuickSwitch from "$components/Popups/QuickSwitch.svelte"
    import MasonaryView from "$components/Popups/views/MasonaryView.svelte"
    import { isMobile } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import tagsController from "$lib/controllers/TagsController.svelte"
    import {
        actionBar,
        actionBars,
        selectedMediaIds,
        windowControlsSpacerVisible
    } from "$lib/stores.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import type { PageData } from "./[cluster]/$types"

    let pageData = page.data as PageData

    $effect(() => {
        varsSvelte.clusterName = page.params.cluster
    })

    onMount(() => {
        mediaController.init()
        tagsController.init()
        console.log("%cControllers mounted", "color: grey")
        if (browser) {
            // @ts-ignore
            window.mediaController = mediaController
        }
    })

    $effect(() => {
        if (isMobile.current) {
            setPopup(
                mediaController.visibleMedium ? "Media Viewer Mobile" : null
            )
        }
    })

    const popups = {
        "Quick Switch": QuickSwitch,
        "Create Story": CreateStoryPopup,
        "Media Viewer Mobile": MediaViewerMobile,
        "Media Details": MediaDetailsPopup,
        "Masonary View": MasonaryView,
        Import: ImportPopup
    } as const

    let popup: keyof typeof popups | null = $state(null)
    let Popup = $derived(popup ? popups[popup] : null) as any
    export const setPopup = (newPopup: typeof popup) => (popup = newPopup)
    export const setActionBar = (
        newActionBar: keyof typeof actionBars | null
    ) => actionBar.set(newActionBar)

    windowControlsSpacerVisible.set(page.data.userAgent?.includes("Electron"))

    onMount(() => {
        varsSvelte.layout.isElectron =
            page.data.userAgent?.includes("Electron")
        // @ts-ignore
        window.fullscreenChanged = (state: boolean) => {
            windowControlsSpacerVisible.set(!state)
            varsSvelte.layout.isElectron = state ? "fullscreen" : true
        }
        // @ts-ignore
        window.getSelectedMediaIds = () => $selectedMediaIds

        const keys = new PressedKeys()
        keys.onKeys(["meta", "o"], () => {
            popup = "Quick Switch"
        })
        keys.onKeys(["meta", "k"], () => {
            popup = "Quick Switch"
        })
        keys.onKeys(["meta", "/"], () => {
            popup = "Quick Switch"
        })
        keys.onKeys(["meta", ","], () => goto("/settings/general"))

        // TODO: These don't seem to work all that well
        keys.onKeys(["shift", "ArrowUp"], () => {
            const currentClusterIndex = pageData.clusters.findIndex(
                c => c.id == pageData.cluster.id
            )
            if (currentClusterIndex == 0) return
            const newCluster = pageData.clusters[currentClusterIndex - 1]
            goto(`/${newCluster.name}`)
        })
        keys.onKeys(["shift", "ArrowDown"], () => {
            const currentClusterIndex = pageData.clusters.findIndex(
                c => c.id == pageData.cluster.id
            )
            if (currentClusterIndex >= pageData.clusters.length - 1) return
            const cluster = pageData.clusters[currentClusterIndex + 1]
            goto(`/${cluster.name}`)
        })
    })
</script>

{#if Popup}
    <Popup />
{/if}

<!-- TODO: Make toggle for less bandwith usage -->
<svelte:head>
    {#if mediaController.prefetchedQueryForTagId}
        {#key mediaController.prefetchedQueryForTagId[0]}
            {#await mediaController.prefetchedQueryForTagId[1] then mediaToPreload}
                {#each mediaToPreload as { id }}
                    <link
                        rel="preload"
                        as="image"
                        href="{pageData.serverURL}/thumb/{id}.webp?session={page.data.session}"
                    />
                {/each}
            {/await}
        {/key}
    {/if}
</svelte:head>
