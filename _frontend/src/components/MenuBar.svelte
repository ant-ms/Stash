<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import { addTagToMedia } from "$lib/client/actions/addTagToMedia.svelte"
    import { removeTagFromMedia } from "$lib/client/actions/removeTagFromMedia.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import Button from "./elements/Button.svelte"

    let clientWidth: number
</script>

{#if varsSvelte.selectedMedias.length}
    <main style="width: {clientWidth - 8}px">
        <Button
            card
            icon="mdiGroup"
            disabled={varsSvelte.selectedMedias.length <= 1}
            onclick={() => {
                fetch(`/api/group-together`, {
                    method: "POST",
                    // TODO: rework this completely
                    body: JSON.stringify(
                        varsSvelte.selectedMedias.map(media => media.id)
                    )
                }).then(() => invalidateAll())
            }}>Group</Button
        >

        <Button
            card
            icon="mdiUngroup"
            disabled={varsSvelte.selectedMedias.length > 1}
        >
            Ungroup
        </Button>

        <Button
            noMargin
            onclick={() => {
                varsSvelte.selectedMedias = []
            }}
            icon="mdiSelectionOff"
        >
            Clear Selection ({varsSvelte.selectedMedias.length})
        </Button>
        <div style="flex-grow: 1"></div>
        <Button card icon="mdiPencil">Rename</Button>
        <Button
            card
            icon="mdiTagPlus"
            onclick={() => addTagToMedia(varsSvelte.selectedMedias)}
            >Add Tag</Button
        >
        <Button
            card
            icon="mdiTagMinus"
            onclick={() => removeTagFromMedia(varsSvelte.selectedMedias)}
        >
            Remove Tag
        </Button>
    </main>
    <div style="height: 50px" bind:clientWidth></div>
{/if}

<style>
    main {
        position: fixed;
        z-index: 99;
        /* width: calc(100% - 1rem); */
        display: flex;

        padding: 4.25px;
        border-bottom: 1px solid var(--color-dark-level-2);

        background: var(--color-dark-level-base);
    }
</style>
