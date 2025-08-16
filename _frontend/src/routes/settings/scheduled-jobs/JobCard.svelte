<script lang="ts">
    import { onMount } from "svelte"

    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import ProgressBar from "$components/elements/ProgressBar.svelte"
    import type { possibleIcons } from "$lib/possibleIcons"

    type T = $$Generic<Record>

    let {
        title,
        icon,
        onCreate,
        itemsAwaitingProcessing,
        countProcessed,
        countScheduled,
        countApplicable
    }: {
        title: string
        icon: keyof typeof possibleIcons
        onCreate: (itemsToProcess: T[]) => Promise<void>
        itemsAwaitingProcessing: Promise<T[]>
        countProcessed: Promise<number>
        countScheduled: Promise<number>
        countApplicable: Promise<number>
    } = $props()

    let _itemsAwaitingProcessing: Awaited<typeof itemsAwaitingProcessing> =
        $state([])

    onMount(async () => {
        _itemsAwaitingProcessing = await itemsAwaitingProcessing
    })
</script>

<main>
    <div class="header">
        <Icon name={icon} />
        <b>{title}</b>
    </div>

    {#await Promise.all([countProcessed, countScheduled, countApplicable])}
        <ProgressBar />
    {:then [awaitedCountProcessed, awaitedCountScheduled, awaitedCountApplicable]}
        <ProgressBar
            sections={[
                {
                    count: awaitedCountProcessed,
                    color: "var(--accent-foreground)"
                },
                {
                    count: awaitedCountScheduled,
                    color: "var(--accent-background)"
                }
            ]}
            total={awaitedCountApplicable}
        />
    {/await}

    <div class="footer">
        <Button
            noMargin
            icon="mdiPlayOutline"
            onclick={async () =>
                await onCreate(_itemsAwaitingProcessing.slice(0, 10))}
            disabled={!_itemsAwaitingProcessing.length}>Process 10</Button
        >
        <Button
            card
            noMargin
            icon="mdiPlay"
            onclick={async () => await onCreate(_itemsAwaitingProcessing)}
            disabled={!_itemsAwaitingProcessing.length}>Process All</Button
        >
    </div>
</main>

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        padding: 0.75rem;
        border-radius: 3px;

        background: var(--color-dark-level-base);

        .header,
        .footer {
            display: flex;
            gap: 0.5rem;
            align-items: center;

            &.footer {
                justify-content: flex-end;
            }
        }
    }
</style>
