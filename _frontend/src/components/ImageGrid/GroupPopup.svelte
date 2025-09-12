<script lang="ts">
    let { onclose, startX, endX, children } = $props()
</script>

<div
    class="wrapper"
    style="left: {startX - 16}px; width: {endX - startX - 24}px"
>
    <main
        oncontextmenu={e => {
            e.preventDefault()
            onclose()
        }}
    >
        {@render children()}
    </main>
</div>

<style lang="scss">
    .wrapper {
        position: fixed;
        z-index: 2;
        top: 0;
        bottom: 0;

        display: flex;

        padding: 1.5rem;

        main {
            overflow-y: scroll;
            flex-grow: 1;

            padding: 1rem;
            border: 1px solid var(--border-color-1);
            border-radius: 0.5rem;

            background: var(--color-dark-level-base);
        }
    }
</style>
