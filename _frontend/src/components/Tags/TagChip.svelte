<script lang="ts">
    import Icon from "$components/elements/Icon.svelte"
    import tagsController from "$lib/controllers/TagsController.svelte"

    let {
        tag,
        show = "icon-prefered",
        compact = false,
        onclick = () => {},
        oncontextmenu = () => {}
    }: {
        tag: number
        show?: "icon-prefered" | "name-only" | "both"
        compact?: boolean
        onclick?: (e: MouseEvent) => void
        oncontextmenu?: (e: MouseEvent) => void
    } = $props()

    let _tag = $derived(tagsController.tagMap[tag])
</script>

{#key _tag}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
        class:compact
        onclick={e => {
            e.preventDefault()
            onclick(e)
        }}
        oncontextmenu={e => {
            e.preventDefault()
            oncontextmenu(e)
        }}
        title={_tag?.icon && (show != "icon-prefered" || !_tag)
            ? _tag.tag
            : null}
    >
        {#if _tag?.icon && show != "name-only"}
            <Icon name={_tag?.icon} size={compact ? 0.9 : 1} />
        {/if}
        {#if show != "icon-prefered" || !_tag?.icon || _tag?.parentId}
            {_tag?.tag}
        {/if}
    </span>
{/key}

<style lang="scss">
    span {
        cursor: pointer;
        user-select: none;

        display: flex;
        gap: 5px;
        align-items: center;

        margin: 0.15em;
        margin-right: 0.25em;
        padding: 0.3em 0.5em;
        border: 1px solid var(--color-dark-level-1);
        border-radius: 3px;

        text-transform: capitalize;

        background: var(--color-dark-level-2);

        &.compact {
            cursor: default;
            padding: 0.25em 0.4em;
        }
    }
</style>
