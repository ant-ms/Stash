<script lang="ts">
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import query from "$lib/client/call"
    import { prompts } from "$lib/controllers/PromptController"
    import { controller } from "$lib/stores.svelte"
    import Popup from "$reusables/Popup.svelte"

    import type { PageData } from "../../routes/[cluster]/$types"

    let pageData = $derived(page.data as PageData)

    let title = $state("")
    let source = $state("")
    let content = $state("")

    const submitStory = async () => {
        const response = await fetch(
            `/api/cluster/${pageData.cluster.id}/stories`,
            {
                method: "POST",
                body: JSON.stringify({
                    title,
                    source,
                    content
                })
            }
        )

        if (!response.ok) throw window.alert("Failed to add story")

        location.reload()
    }
</script>

<Popup title="Create Story" onclose={() => $controller.setPopup(null)}>
    <main>
        <Button
            card
            icon="mdiImport"
            onclick={async () => {
                const url = await prompts.text("Enter the URL of the story")
                if (!url) return
                const data = await query("story_import", { url })
                title = data.title
                source = data.source
                content = data.chapters
                    .map(c => {
                        return `## ${c.title}\n\n${c.content}`
                    })
                    .join("\n")
            }}
        >
            Import
        </Button>
        <label>
            Title
            <input type="text" bind:value={title} />
        </label>
        <label>
            Source
            <input type="text" bind:value={source} />
        </label>
        <label for="contentTextarea"> Content </label>
        <textarea bind:value={content} id="contentTextarea" cols="120" rows="30"
        ></textarea>

        <div style="display: flex; justify-content: right">
            <Button card onclick={submitStory} icon="mdiSend">Create</Button>
        </div>
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5em;

        label {
            display: grid;
            grid-template-columns: 100px 1fr;
        }
    }
</style>
