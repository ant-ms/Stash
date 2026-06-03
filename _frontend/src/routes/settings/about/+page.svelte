<script lang="ts">
    import Table from "$components/elements/Table.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import rawSbom from "$lib/sbom.json"

    // Parse and deduplicate the raw Syft JSON
    let sbom: {
        name: any
        version: any
        license: string
    }[] = []

    if (rawSbom && rawSbom.artifacts) {
        const packages = rawSbom.artifacts.map(artifact => {
            let license = "Unknown"
            if (artifact.licenses && artifact.licenses.length > 0) {
                license = artifact.licenses
                    .map((l: any) => l.value || l.spdxExpression || "Unknown")
                    .join(", ")
            }
            return {
                name: artifact.name,
                version: artifact.version,
                license: license
            }
        })

        // Deduplicate
        const uniquePackages = Array.from(
            new Map(
                packages.map(item => [`${item.name}@${item.version}`, item])
            ).values()
        )
        // Sort alphabetically
        uniquePackages.sort((a, b) => a.name.localeCompare(b.name))
        sbom = uniquePackages
    }
</script>

<SettingsPageContent>
    <div class="wrapper">
        <main>
            <div class="details">
                <img src="/icons/web/icon-512-maskable.png" alt="" />
                <b>Stash</b>
                <span>By <a href="https://ant.lgbt/">ConfusedAnt</a></span>
            </div>

            <p class="description">
                A featureful tag based library to <br /> organise your media collections
            </p>

            {#if sbom && sbom.length > 0}
                <div class="sbom-section">
                    <h3>Open Source Licenses ({sbom.length})</h3>
                    <p class="sbom-desc">
                        Stash is built with the help of the following open
                        source projects:
                    </p>
                    <!--
                    TODO: Adjust table component to support: but keep header visible
                    max-height: 50vh;
                    overflow: auto; -->
                    <Table
                        headers={["Package", "Version", "License"]}
                        data={sbom}
                    >
                        {#snippet children({ entry })}
                            <td>{entry.name}</td>
                            <td>{entry.version}</td>
                            <td>{entry.license}</td>
                        {/snippet}
                    </Table>
                </div>
            {/if}
        </main>
    </div>
</SettingsPageContent>

<style lang="scss">
    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 0;

        main {
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 900px;
            width: 100%;

            .details {
                display: grid;
                grid-template-columns: auto 1fr;
                margin-bottom: 1rem;

                img {
                    grid-row: span 2;
                    height: 4em;
                    margin-right: 0.75em;
                    border-radius: 0.65em;
                }

                b {
                    font-size: 1.5em;
                }
            }

            .description {
                text-align: center;
                margin-bottom: 3rem;
            }

            .sbom-section {
                width: 100%;

                h3 {
                    margin-bottom: 0.5rem;
                    font-size: 1.25em;
                }

                .sbom-desc {
                    margin-bottom: 1rem;
                    opacity: 0.8;
                }
            }
        }
    }
</style>
