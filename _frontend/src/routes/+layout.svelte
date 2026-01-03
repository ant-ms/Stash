<script lang="ts">
    import "../styles/app.scss"

    import { PressedKeys, watch } from "runed"
    import { onMount } from "svelte"

    import { browser } from "$app/environment"
    import { afterNavigate } from "$app/navigation"
    import { navigateInDirection } from "$lib/client/keyboard-navigation"
    import { layout } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { controller, settings } from "$lib/stores.svelte"
    import vars from "$lib/vars.svelte"

    import Controller from "./Controller.svelte"

    let { children } = $props()

    const recreateNavigationPoint = () => {
        if (!document.querySelector("[data-selected]")) {
            const element = document.querySelector(
                "[data-navigable]"
            ) as Element
            element.setAttribute("data-selected", "true")
        }
    }

    afterNavigate(() => {
        if (layout.current == "tv") {
            recreateNavigationPoint()
        }
    })

    onMount(() => {
        browser && (() => (document.body.className = $settings.theme))()

        if (layout.current == "tv") {
            watch(
                () => mediaController.visibleMedium,
                () => {
                    vars.layout.isFullscreen = !!mediaController.visibleMedium
                    recreateNavigationPoint()
                }
            )

            document.addEventListener(
                "keydown",
                function (e) {
                    // ignore inputs and certain controls if needed
                    const blocked = new Set([
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight"
                    ])
                    if (blocked.has(e.key)) {
                        e.preventDefault()
                    }
                },
                { passive: false }
            )

            const keys = new PressedKeys()
            keys.onKeys(["ArrowUp"], () => navigateInDirection("up"))
            keys.onKeys(["ArrowDown"], () => navigateInDirection("down"))
            keys.onKeys(["ArrowLeft"], () => navigateInDirection("left"))
            keys.onKeys(["ArrowRight"], () => navigateInDirection("right"))
            keys.onKeys(["Enter"], () => {
                console.log("enter")
                if (document.querySelector("[data-selected]")) {
                    const element = document.querySelector(
                        "[data-selected]"
                    ) as Element
                    element.click()
                    console.log(element.click)
                }
            })
        }
    })
</script>

<Controller bind:this={$controller} />

{@render children?.()}
