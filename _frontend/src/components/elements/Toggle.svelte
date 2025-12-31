<script lang="ts">
    let {
        toggle,
        enable,
        disable,
        state = $bindable()
    }: {
        toggle?: (value: boolean) => void
        enable?: (value: boolean) => void
        disable?: (value: boolean) => void
        state: boolean
    } = $props()

    //   $: if (state != undefined) toggle(state)
    //   $: if (state == true) dispatch("enable")
    //   $: if (state == false) dispatch("disable")
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<main
    onclick={() => {
        state = !state
        if (state != undefined && toggle) toggle(state)
        if (state == true && enable) enable(true)
        if (state == false && disable) disable(false)
    }}
>
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class:on={state} class:off={!state}></div>
</main>

<style lang="scss">
    $size: 20px;
    $padding: 2px;

    main {
        cursor: pointer;

        position: relative;

        width: $size * 2.25;
        height: $size;
        padding: $padding;
        border: 1px solid var(--border-color-base);
        border-radius: 0.6em;

        background: var(--color-dark-level-base);
        box-shadow:
            rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
            rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

        div {
            position: absolute;
            top: $padding;
            right: $padding;

            width: $size;
            height: $size;
            border-radius: 0.45em;

            background: hsl(0, 0%, 24%);

            transition: all 200ms ease;

            &.off {
                transform: translate(-125%, 0);
            }

            &.on {
                background: hsl(0, 0%, 35%);
            }
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover div {
                filter: brightness(1.2);
            }
        }
    }
</style>
