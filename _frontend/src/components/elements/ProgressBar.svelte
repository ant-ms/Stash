<script lang="ts">
    type Section = {
        count: number
        color?: string
    }

    let { sections = [] as Section[], total } = $props<{
        sections?: Section[]
        total?: number
    }>()

    const computedTotal = $derived(
        total ??
            sections.reduce(
                (sum: number, s: Section) => sum + Math.max(0, s.count || 0),
                0
            )
    )

    const normalized = $derived(
        (() => {
            const parts = sections.map((s: Section) => ({
                count: Math.max(0, s.count || 0),
                color: s.color
            }))
            return parts.map((p: Section) => ({
                ...p,
                pct: (p.count * 100) / (computedTotal || 1)
            }))
        })()
    )
</script>

<div class="segmented-progress">
    {#if normalized.length === 0}
        <div class="track empty"></div>
    {:else}
        <div class="track">
            {#each normalized as seg, i}
                <div
                    class="seg"
                    style={`width:${seg.pct}%; background:${seg.color ?? "#4f46e5"};`}
                ></div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .segmented-progress {

        .track {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            gap: 2px;
            align-items: center;

            height: 14px;
            border-radius: 9999px;

            background: color-mix(in oklab, currentColor 8%, transparent);
        }

        .seg {
            height: 100%;
        }

        .empty {
            background: color-mix(in oklab, currentColor 8%, transparent);
        }
    }
</style>
