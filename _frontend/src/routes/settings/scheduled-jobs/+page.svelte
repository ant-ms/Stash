<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import query from "$lib/client/call"

    import type { PageData } from "./$types"
    import JobCard from "./JobCard.svelte"

    let { data }: { data: PageData } = $props()
</script>

<SettingsPageContent title="Scheduled Jobs">
    <main>
        <JobCard
            title="Automatic Tag Suggestions"
            icon="mdiTagMultiple"
            itemsAwaitingProcessing={data.aiTagMatching.idsStillUnprocessed}
            countProcessed={data.aiTagMatching.countProcessed}
            countScheduled={data.aiTagMatching.countScheduled}
            countApplicable={data.aiTagMatching.countApplicable}
            onCreate={async itemsToProcess => {
                for (const { id } of itemsToProcess) {
                    await query("createJob", {
                        name: "attemptManualTagging",
                        data: JSON.stringify({ id }),
                        priority: -10
                    })
                }
            }}
        />

        <JobCard
            title="Gather Perceived Loudness"
            icon="mdiVolumeHigh"
            itemsAwaitingProcessing={data.gatherPerceivedLoudness
                .idsStillUnprocessed}
            countProcessed={data.gatherPerceivedLoudness.countProcessed}
            countScheduled={data.gatherPerceivedLoudness.countScheduled}
            countApplicable={data.gatherPerceivedLoudness.countApplicable}
            onCreate={async idsToProcess => {
                for (const id of idsToProcess) {
                    await query("createJob", {
                        name: "gatherPerceivedLoudness",
                        data: JSON.stringify({ id }),
                        priority: -10
                    })
                }
            }}
        />

        <!-- <span>Regenerate all media Data</span>
        <Button
            card
            noMargin
            icon="mdiPlay"
            onclick={async () => {
                await query("createJob", {
                    name: "regenerateAllMediaData",
                    data: JSON.stringify({}),
                    priority: -10
                })
            }}
        >
            Process remaining
        </Button> -->
    </main>
</SettingsPageContent>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1rem;
    }
</style>
