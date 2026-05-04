<script lang="ts">
    import { type IconName } from "$lib/possibleIcons.svelte"
    import Dropdown from "$reusables/Dropdown.svelte"

    import Button from "./elements/Button.svelte"

    let {
        children,
        elements = [] as {
            label: string
            icon: IconName
            action: () => void
        }[]
    } = $props()

    let wrapperElement: HTMLDivElement
    let dropdownCoordinates: { x: number; y: number } | null = $state(null)

    const onContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        dropdownCoordinates = { x: e.clientX, y: e.clientY }
    }

    const onOutsideClick = (e: MouseEvent) => {
        if (!dropdownCoordinates) return

        // check if the click was inside or outside the bounding box of the context-menu
        const rect = wrapperElement.getBoundingClientRect()
        const isInside =
            rect.left <= e.clientX &&
            e.clientX <= rect.right &&
            rect.top <= e.clientY &&
            e.clientY <= rect.bottom
        if (!isInside) {
            dropdownCoordinates = null
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div oncontextmenu={onContextMenu} bind:this={wrapperElement}>
    {@render children()}
</div>

{#if dropdownCoordinates != null}
    <Dropdown left={dropdownCoordinates.x} top={dropdownCoordinates.y}>
        {#each elements as { label, icon, action }}
            <Button
                noMargin
                {icon}
                onclick={() => {
                    dropdownCoordinates = null
                    action()
                }}
            >
                {label}
            </Button>
        {/each}
    </Dropdown>
{/if}

<svelte:window on:mousedown={onOutsideClick} />
