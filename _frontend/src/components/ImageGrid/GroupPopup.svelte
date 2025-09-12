<script lang="ts">
    let {
     onclose,
     startX,
     endX,
     children
    } = $props();
</script>

<div class="wrapper" style="left: {startX - 16}px; width: {endX - startX - 24}px">
    <main oncontextmenu={e => {e.preventDefault(); onclose()}}>
        {@render children()}
    </main>
</div>


<style lang="scss">
    .wrapper {
        position: fixed;
        padding: 1.5rem;
        top: 0;
        bottom: 0;
        display: flex;

        main {
            flex-grow: 1;
            padding: 1rem;

            background: var(--color-dark-level-base);
            border: 1px solid var(--border-color-1);
            border-radius: 0.5rem;

            overflow-y: scroll;
        }
    }
</style>
