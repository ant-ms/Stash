<script lang="ts">
    import type { Snippet } from "svelte"

    import { page } from "$app/state"
    import Icon from "$components/elements/Icon.svelte"
    import Key from "$components/elements/Key.svelte"
    import type { possibleIcons } from "$lib/possibleIcons"

    let {
        icon = null as keyof typeof possibleIcons | null,
        iconNoTyping = null as string | null,
        iconOpacity = 1,
        count = null as number | null,
        active = false,
        href = null as string | null,
        shortcut = null as {
            modifier: string
            key: string
        } | null,
        hidden = false,
        right = false,
        card = false,
        highlighted = false,
        disabled = false,
        noMargin = false,
        styleOverride = "",
        download = null as null | true,
        transparentButton = false,
        title = null as null | string,
        oncontextmenu = (() => {}) as (e: MouseEvent) => void,
        onclick = (() => {}) as (e: MouseEvent) => void | Promise<void>,
        onmouseenter = (() => {}) as (e: MouseEvent) => void,
        children = null,
        size = "medium" as "small" | "medium" | "large"
    } = $props()

    let loading = $state(false)
    const handleClick = async (e: MouseEvent) => {
        try {
            loading = true
            await onclick?.(e)
        } catch (e) {
            console.error(e)
        } finally {
            loading = false
        }
    }
</script>

<!-- TODO: Maybe we can get rid of the href? -->
<a
    class:loading
    {download}
    {href}
    style={styleOverride}
    class:active={active || (href && href == page.url.pathname)}
    class:hidden={hidden || !children}
    class:right
    class:highlighted
    class:noMargin
    class:transparentButton
    {oncontextmenu}
    onclick={handleClick}
    {onmouseenter}
    class:card
    class:disabled
    {title}
    class:large={size == "large"}
    class:small={size == "small"}
    data-navigable
>
    <div class="section">
        {#if (icon || iconNoTyping) != null}
            <!-- @ts-ignore -->
            <Icon
                nameAlt={icon || iconNoTyping || "mdiHelp"}
                size={size == "large" ? "1.5rem" : "1.25em"}
                opacity={iconOpacity}
            />
        {/if}
        {#if children}
            <span>
                {@render (children as Snippet)()}
            </span>
        {/if}
        {#if shortcut}
            <div style="display: flex;margin-left: 5px">
                <Key compact key={shortcut.modifier} />
                <Key compact key={shortcut.key} />
            </div>
        {/if}
    </div>

    {#if count}
        <div class="section" style="filter: opacity(0.6)">
            <span>{count}</span>
        </div>
    {/if}
</a>

<!-- TODO: Reimplement and make it cancel any potential other actions that could have been triggered -->
<!-- {#if shortcut}
    <Shortcut
        modifier={shortcut.modifier as any}
        key={shortcut.key}
        action={onclick}
    />
{/if} -->

<style lang="scss">
    @use "sass:color";

    a {
        --outline-size: 1px;
        --border-radius: 0.35em;

        cursor: pointer;
        user-select: none;

        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;

        padding: 0.5em 0.75em;
        border-radius: var(--border-radius);

        text-decoration: none;

        outline: 1px solid transparent;

        transition:
            outline 100ms,
            background 100ms,
            transform 200ms;

        -webkit-app-region: no-drag;
        -webkit-tap-highlight-color: transparent;

        &:not(.noMargin) {
            margin: 0.15em 0.5em;
        }

        &.card {
            margin: 0.25em;
            background: var(--color-dark-level-2);
            outline: 1px solid var(--border-color-1);
            outline-offset: calc(var(--outline-size) * -1);

            &:hover {
                background: var(--color-dark-level-2-hover) !important;
                outline: 1px solid var(--border-color-1-hover) !important;
            }
        }

        &.disabled {
            pointer-events: none;
            opacity: 75%;
        }

        &.loading {
            pointer-events: none;
            position: relative;
        }

        &.loading::after {
            content: "";

            position: absolute;
            z-index: 1;
            inset: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(0, 0, 0, 0.25);
        }

        &.loading::before {
            content: "";

            position: absolute;
            z-index: 2;
            top: calc(50% - 2px);
            left: 50%;

            width: 1em;
            height: 1em;
            margin: -0.5em 0 0 -0.5em;
            border: 3px solid transparent;
            border-top-color: white;
            border-radius: 50%;

            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        &.highlighted {
            background: var(--color-dark-level-3);
            outline: 1px solid var(--border-color-1);
            outline-offset: calc(var(--outline-size) * -1);

            @media (hover: hover) and (pointer: fine) {
                &:hover {
                    background: var(--color-dark-level-2-hover);
                    outline: 1px solid var(--border-color-1-hover);
                    outline-offset: calc(var(--outline-size) * -1);
                }
            }
        }

        .section {
            display: grid;
            grid-auto-flow: column;
            align-items: center;

            span {
                overflow: hidden;

                margin-left: 0.35em;

                font-weight: 300;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        &.hidden {
            align-items: center;
            justify-content: center;

            span {
                display: none;
            }
        }

        &.right {
            &,
            .section {
                flex-direction: row-reverse;
            }
        }

        &.active,
        &.active:hover {
            background: var(--accent-background);
            outline: var(--outline-size) solid var(--accent);
            outline-offset: calc(var(--outline-size) * -1);
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                &:not(.transparentButton) {
                    background: var(--color-dark-level-2);
                    outline: 1px solid var(--border-color-1);
                    outline-offset: calc(var(--outline-size) * -1);
                }

                &.transparentButton {
                    transform: scale(1.1);
                }
            }
        }
    }
</style>
