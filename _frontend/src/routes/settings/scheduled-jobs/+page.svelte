<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import query from "$lib/client/call"

    import type { PageData } from "./$types"

    let { data }: { data: PageData } = $props()
</script>

<SettingsPageContent title="Scheduled Jobs">
    <table>
        <tbody>
            <tr>
                {#await data.imagesMissingAiTagMatching then imagesMissingAiTagMatching}
                    <td>Visual AI Image Recognition</td>
                    <td>{imagesMissingAiTagMatching.length}</td>
                    <td>
                        <Button
                            card
                            noMargin
                            icon="mdiPlay"
                            onclick={async () => {
                                for (const {
                                    id
                                } of imagesMissingAiTagMatching) {
                                    await query("createJob", {
                                        name: "attemptManualTagging",
                                        data: JSON.stringify({ id }),
                                        priority: -10
                                    })
                                }
                            }}
                        >
                            Process remaining
                        </Button>
                    </td>
                {/await}
                <td>Regenerate all media Data</td>
                <td>
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
                    </Button>
                </td>
            </tr>
        </tbody>
    </table>
</SettingsPageContent>

<style lang="scss">
</style>
