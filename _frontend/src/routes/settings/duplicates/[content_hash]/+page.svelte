<script lang="ts">
    import type { Media } from "@prisma/client/wasm"
    import { run } from "svelte/legacy"

    import { goto, invalidateAll } from "$app/navigation"
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Toggle from "$components/elements/Toggle.svelte"
    import Popup from "$reusables/Popup.svelte"

    import type { PageData } from "./$types"
    import type { DuplicatesMergeServerPutRequestData } from "./merge/+server"
    import TagChip from "$components/Tags/TagChip.svelte"

    interface Props {
        data: PageData
    }

    let { data }: Props = $props()

    const dateFormatter = (input: string) =>
        new Date(input)
            .toLocaleString("en-ca", { hour12: false })
            .replace(",", "")

    const attributesToTransfer: {
        attr: keyof Media
        name: string
        selectedIndex: number
        formatter?: (value: any) => string
    }[] = $state([
        { attr: "id", name: "ID / File", selectedIndex: 0 },
        { attr: "name", name: "Name", selectedIndex: -1 },
        { attr: "clustersId", name: "Clusters ID", selectedIndex: -1 },
        { attr: "favourited", name: "Favourited", selectedIndex: -1 },
        {
            attr: "createdDate",
            name: "Created Date",
            selectedIndex: -1,
            formatter: dateFormatter
        },
        {
            attr: "date",
            name: "Date",
            selectedIndex: -1,
            formatter: dateFormatter
        },
        {
            attr: "groupedIntoNamesId",
            name: "Grouped Into Names ID",
            selectedIndex: -1
        },
        {
            attr: "specialFilterAttribute",
            name: "Special Filter Attribute",
            selectedIndex: -1
        }
    ])

    let tags = [
        ...new Set(
            data.duplicate_media
                .flatMap(m => m.tags.map(t => ({ id: t.id, tag: t.tag })))
                .map(o => JSON.stringify(o))
        )
    ].map(s => JSON.parse(s))

    run(() => {
        attributesToTransfer.forEach((a, i) => {
            if (
                data.duplicate_media.every(
                    m => m[a.attr] === data.duplicate_media[0][a.attr]
                )
            ) {
                attributesToTransfer[i].selectedIndex = 0
            }
        })
    })

    const getValueToKeep = (
        attribute: (typeof attributesToTransfer)[number]["attr"]
    ) => {
        try {
            const dominantObject = attributesToTransfer.find(
                a => a.attr === attribute
            )
            if (!dominantObject) throw new Error("Attribute not found!")
            return (
                (data.duplicate_media[dominantObject.selectedIndex][
                    attribute
                ] as any) || null
            )
        } catch {
            return null
        }
    }

    let attributesToKeep = $derived({
        createdDate: getValueToKeep("createdDate"),
        date: getValueToKeep("date"),
        favourited: getValueToKeep("favourited"),
        groupedIntoNamesId: getValueToKeep("groupedIntoNamesId"),
        name: getValueToKeep("name"),
        specialFilterAttribute: getValueToKeep("specialFilterAttribute"),
        tags: tags.map(t => t.id)
    })
</script>

<Popup title="Merge" onclose={() => goto("/settings/duplicates")}>
    {#snippet actionsLeft()}
        <Button
            card
            icon="mdiDebugStepOver"
            onclick={() => {
                fetch(`${page.url.href}/ignore`, {
                    method: "PUT"
                })
                    .then(async () => {
                        await invalidateAll()
                        goto("/settings/duplicates")
                    })
                    .catch(e => {
                        console.error(e)
                        window.alert("An error occurred!")
                    })
            }}
        >
            Ignore
        </Button>
    {/snippet}

    {#snippet actionsRight()}
        {#key attributesToTransfer}
            <Button
                card
                icon="mdiSourceMerge"
                highlighted
                onclick={async () => {
                    await fetch(`${page.url.href}/merge`, {
                        method: "PUT",
                        body: JSON.stringify({
                            idToKeep: getValueToKeep("id"),
                            idsToRemove: data.duplicate_media
                                .filter(
                                    (_, i) =>
                                        i !=
                                        attributesToTransfer[0].selectedIndex
                                )
                                .map(m => m.id),
                            attributesToKeep
                        } satisfies DuplicatesMergeServerPutRequestData)
                    })
                        .then(async () => {
                            await invalidateAll()
                            goto("/settings/duplicates")
                        })
                        .catch(e => {
                            console.error(e)
                            window.alert("An error occurred!")
                        })
                }}
            >
                Merge
            </Button>
        {/key}
    {/snippet}

    {#snippet sidebar()}
        <h2>Result</h2>
        <div class="attributesToKeepInSidebar">
            <!-- {#each Object.entries(attributesToKeep) as [attr, value]}
                {#if value instanceof Date}

                    <span>{attr}: {dateFormatter(value as any)}</span>
                {:else}
                    <span>{attr}: {String(value)}</span>
                    {/if}
            {/each} -->
            {#each attributesToTransfer as { attr, name, selectedIndex, formatter }, j}
                {#if !data.duplicate_media.every(m => m[attr] === data.duplicate_media[0][attr])}
                    <div class="row">
                        <span>{name}</span>
                        {#if formatter}
                            <span>
                                {formatter((attributesToKeep as any)[attr])}
                            </span>
                        {:else}
                            <span>
                                {(attributesToKeep as any)[attr] || "False / TODO"}
                            </span>
                        {/if}
                    </div>
                {/if}
            {/each}
            <div class="row">
                <span>Tags</span>
                {#each attributesToKeep.tags as tag}
                    <TagChip {tag} show="both"/>
                {/each}
            </div>
        </div>
    {/snippet}

    <main>
        {#each data.duplicate_media as entry, i}
            <div class="duplicateEntry">
                <div class="left">
                    {#if entry.type.startsWith("image")}
                        <img
                            src={`${page.data.serverURL}/file/${entry.id}?session=${page.data.session}`}
                            alt={entry.id}
                        />
                    {:else if entry.type.startsWith("video")}
                        <video controls>
                            <source
                                src={`${page.data.serverURL}/file/${entry.id}?session=${page.data.sessionId}`}
                                type={entry.type}
                            />
                        </video>
                    {:else}
                        <span>ERROR: Unknown format!</span>
                    {/if}
                </div>
                <div class="right">
                    {#each attributesToTransfer as { attr, name, selectedIndex, formatter }, j}
                        {#if !data.duplicate_media.every(m => m[attr] === data.duplicate_media[0][attr])}
                            <div class="row">
                                <span class:disabled={selectedIndex != -1}
                                    >{name}</span
                                >
                                {#if formatter}
                                    <span class:disabled={selectedIndex != -1}
                                        >{formatter(entry[attr])}</span
                                    >
                                {:else}
                                    <span class:disabled={selectedIndex != -1}
                                        >{entry[attr]}</span
                                    >
                                {/if}
                                <div class="div">
                                    <Toggle
                                        state={selectedIndex == i}
                                        enable={() => {
                                            attributesToTransfer[
                                                j
                                            ].selectedIndex = i
                                            console.log(attributesToTransfer[j])
                                        }}
                                        disable={() => {
                                            attributesToTransfer[
                                                j
                                            ].selectedIndex = -1
                                        }}
                                    />
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </main>
</Popup>

<style lang="scss">
    h2 {
        margin: 0;
    }

    main {
        overflow-y: scroll;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2rem;

        max-height: 70vh;
    }

    img,
    video {
        width: 200px;
    }

    .row {
        display: grid;
        grid-template-columns: 150px 1fr auto;
        gap: 1rem;
        align-items: center;

        .disabled {
            pointer-events: none;
            opacity: 0.25;
        }
    }

    .attributesToKeepInSidebar {
        display: grid;
        gap: 0.5rem;

        width: 325px;
        margin-top: 0.25rem;
        padding: 0.25rem;
    }
</style>
