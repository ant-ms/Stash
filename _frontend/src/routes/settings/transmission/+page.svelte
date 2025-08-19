<script lang="ts">
    import prettyBytes from "pretty-bytes"
    import { resource } from "runed"

    import Button from "$components/elements/Button.svelte"
    import Table from "$components/elements/Table.svelte"
    import Toggle from "$components/elements/Toggle.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import query from "$lib/client/call"

    let enabled = $state(true)

    let { data } = $props()

    let transmission_endpoint = $derived(data.TRANSMISSION_ENDPOINT)
    let transmission_stash_data_location = $derived(
        data.TRANSMISSION_STASH_DATA_LOCATION
    )

    const seedingTorrents = resource(
        () => ({
            enabled,
            transmission_endpoint,
            transmission_stash_data_location
        }),
        async ({ enabled }) => {
            if (!enabled) return []
            return await query("getAllSeedingTorrents", {})
        },
        {
            debounce: 300
        }
    )
</script>

<SettingsPageContent title="Transmission">
    {#snippet headerActions()}
        <Toggle bind:state={enabled} />
    {/snippet}

    <main class:disabled={!enabled}>
        <div>
            <span> Transmission Endpoint </span>
            <input
                type="url"
                bind:value={transmission_endpoint}
                oninput={e => {
                    query("updateSettingsKeyValuePair", {
                        key: "TRANSMISSION_ENDPOINT",
                        value: transmission_endpoint
                    })
                }}
            />
        </div>
        <div>
            <span> Path from Transmission to Stash </span>
            <input
                type="text"
                bind:value={transmission_stash_data_location}
                oninput={e => {
                    query("updateSettingsKeyValuePair", {
                        key: "TRANSMISSION_STASH_DATA_LOCATION",
                        value: transmission_stash_data_location
                    })
                }}
            />
        </div>

        {#if enabled}
            <h2>Seeding Torrents</h2>
            <span>
                Count: {seedingTorrents.current?.length ?? 0}
            </span>
            <span>
                Total Size: {prettyBytes(
                    seedingTorrents.current?.reduce(
                        (acc, curr) => acc + curr.totalSize,
                        0
                    ) ?? 0
                )}
            </span>
            <span>
                Upload Total: {prettyBytes(
                    seedingTorrents.current?.reduce(
                        (acc, curr) => acc + curr.uploadedEver,
                        0
                    ) ?? 0
                )}
            </span>
            {#if seedingTorrents.loading}
                <span> Loading torrents... </span>
            {/if}
            {#if seedingTorrents.error}
                <span>
                    Error loading torrents!
                    {seedingTorrents.error}
                </span>
            {:else if seedingTorrents.current}
                <Table
                    data={seedingTorrents.current}
                    headers={["Name", "Size", {
                        title: "Uploaded",
                        sortableProperty: "uploadedEver"
                    }, "Ratio"]}
                >
                    {#snippet children({ entry })}
                        <td>
                            <!-- TODO: Displaying the thumbnail/link to the media here would be cool -->
                            {entry.name}
                            <div class="floating">
                                <Button
                                    noMargin
                                    icon="mdiOpenInNew"
                                    onclick={() => {
                                        window.open(
                                            `https://stash.hera.lan/file/${entry.name}`,
                                            "_blank"
                                        )
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            {prettyBytes(entry.totalSize)}
                        </td>
                        <td>
                            {prettyBytes(entry.uploadedEver)}
                        </td>
                        <td>
                            {(entry.uploadRatio as number).toFixed(2)}
                        </td>
                    {/snippet}
                </Table>
            {/if}
        {/if}
    </main>
</SettingsPageContent>

<style lang="scss">
    main {
        display: grid;
        gap: 0.5rem;

        &.disabled {
            pointer-events: none;
            opacity: 0.5;
        }

        div {
            display: flex;
            align-items: center;
            max-width: 600px;

            span {
                flex-grow: 1;
            }

            input {
                width: 300px;
            }
        }
    }

    // TODO: Remove redundancy

    td {
        position: relative;

        .floating {
            position: absolute;
            top: 0;
            right: 0;
        }

        &:not(:hover) {

            .floating {
                display: none;
            }
        }
    }

    h2 {
        margin-bottom: 0;
    }
</style>
