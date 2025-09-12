<script lang="ts">
    import prettyBytes from "pretty-bytes"

    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import Key from "$components/elements/Key.svelte"
    import TagChip from "$components/Tags/TagChip.svelte"
    import TagInputField from "$components/Tags/TagInputField.svelte"
    import query from "$lib/client/call"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import type { TagExtended } from "$lib/controllers/TagsController.svelte"
    import { controller } from "$lib/stores.svelte"
    import Popup from "$reusables/Popup.svelte"

    import ImportPopupImportablesSelection from "./ImportPopupImportablesSelection.svelte"
    import ImportPopupTransmissionSection from "./ImportPopupTransmissionSection.svelte"
    import {
        UploadImportSource,
        type ImportSource
    } from "./ImportSources.svelte"

    let queue: ImportSource[] = $state([])
    let tags: TagExtended[] = $state(mediaController.selectedTags)

    let mainPopupContent: "home" | "importables" | "transmission" =
        $state("home")
    let fileInputElement: HTMLInputElement
</script>

<input
    bind:this={fileInputElement}
    type="file"
    multiple
    style="
        position: absolute;
        left: 999vw;
        opacity: 0
    "
    accept="image/*, video/*"
    oninput={e => {
        const files: File[] = Array.from((e.target as any).files)
        for (const file of files) {
            queue.push(new UploadImportSource(file))
        }
    }}
/>

<Popup title="Import" onclose={() => $controller.setPopup(null)}>
    {#snippet sidebar()}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="sidebar"
            ondrop={e => {
                e.preventDefault()
                if (!e.dataTransfer?.types.includes("Files")) return

                const items = Array.from(e.dataTransfer?.items || [])
                for (const item of items) {
                    if (item.kind != "file")
                        throw "Selected Element is not a file: " + item.kind
                    const file = item.getAsFile()
                    if (!file) continue
                    queue.push(new UploadImportSource(file))
                }
            }}
            ondragover={e => e.preventDefault()}
        >
            <div class="sidebar-header">
                <Button
                    card
                    icon="mdiUpload"
                    onclick={() => fileInputElement.click()}
                >
                    Upload
                </Button>
                <Button
                    card
                    icon="mdiImport"
                    onclick={() => (mainPopupContent = "importables")}
                >
                    Import
                </Button>
                <Button
                    card
                    icon="mdiTransmissionTower"
                    onclick={() => (mainPopupContent = "transmission")}
                >
                    Transfer
                </Button>
            </div>

            <div class="sidebar-queue-entries">
                {#each queue as queueEntry}
                    <div
                        class="sidebar-queue-entry"
                        style={queueEntry.error
                            ? "background: red"
                            : queueEntry.progress
                              ? `background: linear-gradient(to right, var(--color-dark-level-2) 0%, var(--color-dark-level-2) ${queueEntry.progress}%, transparent ${queueEntry.progress}%, transparent 100%)`
                              : ""}
                    >
                        <Icon name={queueEntry.icon} size={0.9} />
                        <span>
                            {queueEntry.filename}
                            {#if queueEntry.size}
                                ({prettyBytes(queueEntry.size)})
                            {/if}
                        </span>
                        <Button
                            noMargin
                            icon="mdiClose"
                            onclick={() =>
                                queue.splice(queue.indexOf(queueEntry), 1)}
                            styleOverride="outline: none"
                        />
                    </div>
                {/each}
            </div>
        </div>
    {/snippet}

    <main>
        {#if mainPopupContent === "home"}
            <div class="tags">
                <div class="tagsHeader">
                    <b>Tags</b>
                    <div>
                        <Key key="shift" />
                        <Key key="T" />
                    </div>
                </div>
                <TagInputField
                    alwaysExpanded
                    onselected={tag => (tags = tags.concat(tag))}
                />
                <div class="tagsList">
                    {#each tags as tag}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <span
                            class="tag"
                            oncontextmenu={e => {
                                e.preventDefault()
                                tags = tags.filter(t => t != tag)
                            }}
                        >
                            <TagChip show="both" tag={tag.id} />
                        </span>
                    {/each}
                    {#if !tags.length}
                        <span>No Tag</span>
                    {/if}
                </div>
            </div>
        {:else if mainPopupContent === "importables"}
            <Button
                card
                icon="mdiArrowLeft"
                onclick={() => (mainPopupContent = "home")}
            >
                Back
            </Button>

            <ImportPopupImportablesSelection bind:queue />
        {:else if mainPopupContent === "transmission"}
            <Button
                card
                icon="mdiArrowLeft"
                onclick={() => (mainPopupContent = "home")}
            >
                Back
            </Button>

            <ImportPopupTransmissionSection bind:queue />
        {/if}
    </main>

    {#snippet actionsRight()}
        <Button
            card
            highlighted
            disabled={!queue.length}
            icon="mdiUpload"
            onclick={async () => {
                for (const queueEntry of queue) {
                    await queueEntry.process({
                        cluster: page.params.cluster,
                        tags
                    })
                }

                if (!queue.some(e => e.error)) {
                    while (
                        await query(
                            "areThereUpdateMediaMetadataFromFileJobs",
                            {}
                        )
                    ) {
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }
                    $controller.setPopup(null)
                    mediaController.updateMedia()
                }
            }}
            shortcut={{ modifier: "meta", key: "enter" }}
        >
            Import
        </Button>
    {/snippet}
</Popup>

<style lang="scss">
    .sidebar {
        flex-grow: 1;
        width: 314px;

        .sidebar-header {
            display: flex;
            margin-bottom: 0.5rem;
        }

        .sidebar-queue-entries {

            .sidebar-queue-entry {
                display: flex;
                align-items: center;

                padding-left: 0.5rem;
                border-radius: 5px;

                transition: background 100ms;

                span {
                    flex: 1;
                    padding-left: 3px;
                }

                &:hover {
                    background: var(--color-dark-level-1-hover);
                }
            }
        }
    }

    main {
        width: 400px;

        .tags {
            display: grid;
            gap: 0.5em;

            b {
                font-size: 1.1em;
                font-weight: 500;
            }

            .tagsHeader {
                display: flex;
                justify-content: space-between;

                div {
                    display: flex;
                    align-items: center;
                }
            }
        }
    }
</style>
