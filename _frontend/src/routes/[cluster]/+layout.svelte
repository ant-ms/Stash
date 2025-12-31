<script lang="ts">
    import MobileBottomBar from "$components/MobileBottomBar.svelte"
    import { layout } from "$lib/context"

    interface Props {
        children?: import("svelte").Snippet
    }

    let { children }: Props = $props()
</script>

<main class:mobile={layout.current == "mobile"}>
    {@render children?.()}

    {#if layout.current == "mobile"}
        <MobileBottomBar />
    {/if}
</main>

<style lang="scss">
    main {
        display: grid;
        width: 100vw;
        height: 100vh;

        &.mobile {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
            height: 100vh;
        }
    }
</style>
