<script lang="ts">
    import Icon from "$components/elements/Icon.svelte"
    import type { possibleIcons } from "$lib/possibleIcons"

    type T = $$Generic<Record>

    type Props = {
        options: {
            value: T
            name?: string
            icon?: keyof typeof possibleIcons
            disabled?: boolean
        }[]
        value?: T
        prefix?: string
        width?: number
        hideName?: boolean
        allowMouseWheel?: boolean
        large?: boolean
        position?: "top" | "bottom"
        onchange?: (value: T) => void
        oncontextmenu?: (e: MouseEvent) => void
    }

    let {
        options,
        value = $bindable(options[0].value),
        prefix = "",
        width = 150,
        hideName = false,
        allowMouseWheel = false,
        large = false,
        position = "bottom",
        onchange = () => {},
        oncontextmenu = () => {}
    }: Props = $props()

    let main: HTMLElement
    let open = $state(false)
    let top = $state(0)
    let left = $state(0)
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main
    bind:this={main}
    class:large
    {oncontextmenu}
    onclick={() => {
        const rect = main.getBoundingClientRect()
        left = rect.left

        if (position === "bottom") {
            top = rect.bottom + 4
        } else if (position === "top") {
            top = rect.top - 4 - options.length * 30
        }

        open = !open
    }}
    style:min-width={width > 0 ? `${width}px` : "100%"}
    onwheel={e => {
        if (!allowMouseWheel) return
        const index = options.findIndex(o => o.value === value)
        if (e.deltaY > 0) {
            value = options[index + 1]?.value || options[0].value
        } else {
            value =
                options[index - 1]?.value || options[options.length - 1].value
        }
        onchange(value)
    }}
    data-navigable
>
    {#if options.find(o => o.value == value)?.icon}
        <div class="icon">
            <Icon size={0.8} name={options.find(o => o.value == value)?.icon} />
        </div>
    {/if}
    {#if !hideName}
        <span>
            {prefix ? `${prefix}: ` : ""}
            {options.find(o => o.value == value)?.name || value}
        </span>
    {/if}
    <div class="arrow">
        <Icon size={0.8} name="mdiChevronDown" />
    </div>
</main>

{#if open}
    <div
        class="options"
        style:top="{top}px"
        style:left="{left}px"
        style:width="{width}px"
    >
        {#each options.filter(o => !o.disabled) as o}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <span
                class:active={o.value === value}
                onclick={e => {
                    value = o.value
                    onchange(o.value)
                    open = false
                }}
                data-navigable
            >
                {#if o.icon}
                    <Icon size={0.8} name={o.icon} />
                {/if}
                {o.name}
            </span>
        {/each}
    </div>
{/if}

<style lang="scss">
    main {
        cursor: pointer;
        user-select: none;

        position: relative;

        display: flex;
        gap: 0.35rem;
        align-items: center;

        width: max-content;
        padding: 4.25px;
        border: 1px solid var(--border-color-base);
        border-radius: 3px;

        font-size: 14px;
        font-weight: 200;

        background: var(--color-dark-level-base);

        transition: all 200ms ease;

        -webkit-app-region: no-drag;

        &.large {
            padding: 8px;
            border-radius: 5px;
        }

        .arrow {
            position: absolute;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
        }

        .icon {
            padding-left: 0.25rem;
        }

        @media (hover: hover) and (pointer: fine) {

            &:hover {
                filter: brightness(110%);
            }
        }
    }

    .options {
        user-select: none;

        position: absolute;
        z-index: 999;

        display: grid;

        margin-left: 10px;

        box-shadow: 0 0.2rem 0.5rem 0 hsl(var(--dropdown-shadow-color) / 0.4);

        span {
            margin-top: 1px;
            padding: 5px;

            text-wrap: nowrap;

            background: var(--color-dark-level-base);
            outline: 1px solid var(--border-color-base);

            &:hover {
                background: var(--color-dark-level-2);
                outline: 1px solid var(--border-color-1);
            }

            &.active {
                z-index: 1;
                background: var(--color-dark-level-2);
                outline: 1px solid var(--border-color-1);

                &:hover {
                    background: var(--color-dark-level-2-hover);
                    outline: 1px solid var(--border-color-1-hover);
                }
            }
        }
    }
</style>
