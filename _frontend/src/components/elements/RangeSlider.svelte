<script lang="ts">
    type Props = {
        marks: { value: number; label: string }[]
        min?: number
        max?: number
        onchange?: (min: number, max: number) => void
    }

    let {
        marks,
        min = 0,
        max = marks[marks.length - 1].value,
        onchange = () => {}
    }: Props = $props()

    let track: HTMLElement
    let dragging: "min" | "max" | null = $state(null)

    // Local state used during drag — syncs from props when idle
    let localMin = $state(min)
    let localMax = $state(max)

    $effect(() => {
        if (!dragging) {
            localMin = min
            localMax = max
        }
    })

    const getMinIndex = () => marks.findIndex(m => m.value === localMin)
    const getMaxIndex = () => marks.findIndex(m => m.value === localMax)

    const getClosestMarkIndex = (clientX: number) => {
        if (!track) return 0
        const rect = track.getBoundingClientRect()
        const ratio = Math.max(
            0,
            Math.min(1, (clientX - rect.left) / rect.width)
        )
        const index = Math.round(ratio * (marks.length - 1))
        return index
    }

    const onpointerdown = (e: PointerEvent, handle: "min" | "max") => {
        e.preventDefault()
        dragging = handle
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }

    const onpointermove = (e: PointerEvent) => {
        if (!dragging) return
        const index = getClosestMarkIndex(e.clientX)
        const minIdx = getMinIndex()
        const maxIdx = getMaxIndex()

        // When both handles overlap, auto-switch based on drag direction
        if (minIdx === maxIdx) {
            if (index < minIdx) dragging = "min"
            else if (index > maxIdx) dragging = "max"
        }

        if (dragging === "min") {
            const clampedIndex = Math.min(index, maxIdx)
            localMin = marks[clampedIndex].value
        } else {
            const clampedIndex = Math.max(index, minIdx)
            localMax = marks[clampedIndex].value
        }
    }

    const onpointerup = () => {
        if (dragging) {
            dragging = null
            onchange(localMin, localMax)
        }
    }

    const getPercent = (index: number) => {
        return (index / (marks.length - 1)) * 100
    }

    const minPercent = $derived(getPercent(getMinIndex()))
    const maxPercent = $derived(getPercent(getMaxIndex()))
</script>

<svelte:window {onpointermove} {onpointerup} />

<div class="range-slider">
    <div class="track" bind:this={track}>
        <div class="track-bg"></div>
        <div
            class="track-fill"
            style:left="{minPercent}%"
            style:width="{maxPercent - minPercent}%"
        ></div>

        <!-- Min thumb -->
        <div
            class="thumb"
            class:active={dragging === "min"}
            style:left="{minPercent}%"
            onpointerdown={e => onpointerdown(e, "min")}
            role="slider"
            tabindex="0"
            aria-valuemin={marks[0].value}
            aria-valuemax={localMax}
            aria-valuenow={localMin}
        ></div>

        <!-- Max thumb -->
        <div
            class="thumb"
            class:active={dragging === "max"}
            style:left="{maxPercent}%"
            onpointerdown={e => onpointerdown(e, "max")}
            role="slider"
            tabindex="0"
            aria-valuemin={localMin}
            aria-valuemax={marks[marks.length - 1].value}
            aria-valuenow={localMax}
        ></div>
    </div>

    <div class="marks">
        {#each marks as mark, i}
            <span
                class="mark"
                class:active={i >= getMinIndex() && i <= getMaxIndex()}
                style:left="{getPercent(i)}%"
            >
                {mark.label}
            </span>
        {/each}
    </div>
</div>

<style lang="scss">
    .range-slider {
        user-select: none;

        position: relative;

        width: 180px;
        padding: 6px 8px;

        -webkit-app-region: no-drag;
    }

    .track {
        position: relative;
        display: flex;
        align-items: center;
        height: 18px;
    }

    .track-bg {
        position: absolute;
        right: 0;
        left: 0;

        height: 3px;
        border-radius: 2px;

        background: var(--border-color-base);
    }

    .track-fill {
        position: absolute;
        height: 3px;
        border-radius: 2px;
        background: var(--border-color-1);
    }

    .thumb {
        touch-action: none;
        cursor: grab;

        position: absolute;
        transform: translateX(-50%);

        width: 14px;
        height: 14px;
        border: 2px solid var(--border-color-1);
        border-radius: 50%;

        background: var(--color-dark-level-base);

        transition:
            border-color 150ms ease,
            transform 150ms ease;

        &:hover,
        &.active {
            transform: translateX(-50%) scale(1.2);
            border-color: var(--border-color-1-hover, var(--border-color-1));
        }

        &.active {
            cursor: grabbing;
        }
    }

    .marks {
        position: relative;
        height: 16px;
        margin-top: 2px;

        .mark {
            position: absolute;
            transform: translateX(-50%);

            font-size: 10px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.4);

            transition: color 150ms ease;

            &.active {
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }
</style>
