<script lang="ts">
    import { onMount } from "svelte"

    import { invalidate, invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import query from "$lib/client/call.js"
    import Popup from "$reusables/Popup.svelte"

    let { data } = $props()

    const colourPalletteStatus = {
        created: "#eed18c",
        running: "#6fb5e0",
        completed: "grey",
        failed: "red",
        invalid: "red"
    } as const

    let jobDetails: null | (typeof data.jobs)[number] = $state(null)

    onMount(() => {
        // TODO
        const interval = setInterval(() => invalidateAll(), 1000)
        return () => clearInterval(interval)
    })
</script>

<SettingsPageContent title="Jobs">
    <Table headers={["ID", "Name", "Status"]} data={data.jobs}>
        {#snippet children({ entry })}
            <td>{entry.id}</td>
            <td>{entry.name}</td>
            <td
                style="
        color: {colourPalletteStatus[
                    entry.status as keyof typeof colourPalletteStatus
                ]}
        "
            >
                {entry.status}
            </td>
            <td class="floating">
                <Button
                    noMargin
                    icon="mdiInformation"
                    onclick={() => (jobDetails = entry)}
                />
            </td>
        {/snippet}
    </Table>
</SettingsPageContent>

{#if jobDetails}
    <Popup
        title="Job details for {jobDetails.id}"
        onclose={() => (jobDetails = null)}
    >
        <pre>{JSON.stringify(jobDetails, null, 2)
                .split("\n")
                .map(line =>
                    line.length > 120
                        ? line.replace(/(.{1,120})/g, "$1\n") // break into chunks
                        : line
                )
                .join("\n")}</pre>

        {#snippet actionsRight()}
            <Button
                card
                icon="mdiRefresh"
                onclick={async () => {
                    await query("setJobStatus", {
                        // @ts-ignore
                        id: jobDetails.id,
                        status: "created"
                    })
                    invalidateAll()
                }}
            >
                Retry
            </Button>
        {/snippet}
    </Popup>
{/if}

<style lang="scss">
    .floating {
        position: absolute;
        top: 0;
        right: 0;
        padding-top: 2px;
    }

    pre {
        overflow: auto;
    }
</style>
