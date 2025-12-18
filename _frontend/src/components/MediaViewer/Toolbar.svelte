<script lang="ts">
    import { PressedKeys } from "runed"
    import selectFiles from "select-files"
    import { onMount } from "svelte"

    import { browser } from "$app/environment"
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import SpecialFilterAttributeDropdown from "$components/Tags/SpecialFilterAttributeDropdown.svelte"
    import { addTagToMedia } from "$lib/client/actions/addTagToMedia.svelte"
    import { removeTagFromMedia } from "$lib/client/actions/removeTagFromMedia.svelte"
    import query from "$lib/client/call"
    import MediaViewer_replaceVideoThumbnail from "$lib/client/MediaViewer_replaceVideoThumbnail.svelte"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { controller } from "$lib/stores.svelte"
    import vars from "$lib/vars.svelte"
    import Dropdown from "$reusables/Dropdown.svelte"

    import type { PageData } from "../../routes/[cluster]/$types"
    import TagChip from "../Tags/TagChip.svelte"
    import TagInputField from "../Tags/TagInputField.svelte"

    let pageData = $derived(page.data as PageData)

    let dropdownVisible = $state(false)
    let { hideControls } = $props()

    ;(window as any).test = () =>
        (vars.imageSuffixParameter = `?${Math.random().toString(16).substring(2, 8)}`)

    const replaceMedia = (newMedia: Blob) => {
        const data = new FormData()
        data.append(
            "file",
            new File(
                [newMedia],
                mediaController.visibleMedium?.name || "newImage.jpg",
                {
                    type: newMedia.type
                }
            )
        )

        fetch(`/api/media/${mediaController.visibleMedium?.id}/replace`, {
            method: "PUT",
            body: data
        }).then(async () => {
            // reload image in viewer
            vars.imageSuffixParameter = `?${Math.random().toString(16).substring(2, 8)}`

            // visibleMedium.update()
            // // This seems to ignore the history pushes
            // window.location.reload()
        })
    }

    const replaceWithLocalMedia = () => {
        if (!browser) return

        selectFiles({}).then(files => {
            if (files && files[0]) replaceMedia(files[0])
        })
    }

    const replaceThumbnail = () => {
        if (!browser) return
        MediaViewer_replaceVideoThumbnail()
    }

    onMount(() => {
        const keys = new PressedKeys()
        keys.onKeys(["f"], () => {
            vars.layout.isFullscreen = !vars.layout.isFullscreen
        })
        keys.onKeys(["i"], () => {
            $controller.setPopup("Media Details")
        })
    })
</script>

{#if mediaController.visibleMedium}
    <main class:fullscreen={vars.layout.isFullscreen}>
        <section>
            <button onclick={() => (mediaController.visibleMedium = null)}>
                <Icon name="mdiClose" size={0.8} />
            </button>
        </section>

        <div>
            <button
                onclick={() => {
                    // TODO: Rmove duplication
                    fetch(
                        `/api/media/${mediaController.visibleMedium?.id}/favourited`,
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                favourited:
                                    !mediaController.visibleMedium?.favourited
                            })
                        }
                    )
                        .then(() => {
                            if (!mediaController.visibleMedium) return
                            const tmp = mediaController.visibleMedium
                            tmp.favourited =
                                !mediaController.visibleMedium.favourited
                            mediaController.visibleMedium = tmp
                        })
                        .catch(console.error)
                }}
            >
                {#if mediaController.visibleMedium.favourited}
                    <Icon name="mdiStar" size={0.8} />
                {:else}
                    <Icon name="mdiStarOutline" size={0.8} />
                {/if}
            </button>
            <!-- TODO: Move these definitions into the DB -->
            <SpecialFilterAttributeDropdown />
            {#each mediaController.visibleMedium.tags || [] as tag (tag)}
                <TagChip
                    {tag}
                    oncontextmenu={() => {
                        if (!mediaController.visibleMedium)
                            throw "Expected mediaController.visibleMedium to be defined"
                        removeTagFromMedia([mediaController.visibleMedium], tag)
                    }}
                />
            {/each}
            {#if pageData.cluster.type != "collection" || mediaController.visibleMedium.tags.length != 1}
                <TagInputField
                    onselected={({ id }) => {
                        if (!mediaController.visibleMedium)
                            throw "Expected mediaController.visibleMedium to be defined"
                        addTagToMedia([mediaController.visibleMedium], id)
                    }}
                />
            {/if}
        </div>

        <section>
            {#if !hideControls}
                <button
                    onclick={() => {
                        vars.layout.isFullscreen = !vars.layout.isFullscreen
                        if (vars.layout.isFullscreen) {
                            document.documentElement.requestFullscreen()
                        } else {
                            document.exitFullscreen()
                        }
                    }}
                >
                    <Icon name="mdiFullscreen" size={0.8} />
                </button>
            {/if}

            <button
                onclick={() => {
                    dropdownVisible = !dropdownVisible
                }}
            >
                <Icon name="mdiDotsVertical" size={0.8} />
            </button>
        </section>
    </main>
{/if}

<Dropdown visible={dropdownVisible} top={44} right={8}>
    <Button
        icon="mdiInformationOutline"
        onclick={() => {
            $controller.setPopup("Media Details")
            dropdownVisible = false
        }}
    >
        Show Details
    </Button>

    <Button
        icon="mdiFileReplace"
        onclick={() => {
            replaceWithLocalMedia()
            dropdownVisible = false
        }}
    >
        Replace file content
    </Button>

    {#if mediaController.visibleMedium?.type.startsWith("video")}
        <Button
            icon="mdiFileReplaceOutline"
            onclick={() => {
                replaceThumbnail()
                dropdownVisible = false
            }}
        >
            Replace file thumbnail
        </Button>
    {/if}

    <Button
        icon="mdiDownload"
        href="/api/media/{mediaController.visibleMedium?.id}/download"
        download
    >
        Download
    </Button>

    <Button
        icon="mdiOpenInNew"
        onclick={() => {
            window.open(
                `${page.data.serverURL}/file/${mediaController.visibleMedium?.id}`,
                "_blank"
            )
            dropdownVisible = false
        }}
    >
        Open in new tab
    </Button>

    <Button
        icon="mdiTrashCan"
        onclick={async () => {
            await query("markMediaAsDeleted", {
                mediaId: mediaController.visibleMedium?.id as string
            })
            mediaController.setMedia(
                mediaController.media.filter(
                    m => m.id != mediaController.visibleMedium?.id
                )
            )
            mediaController.visibleMedium = null
            dropdownVisible = false
        }}
    >
        Delete media
    </Button>
</Dropdown>

<style lang="scss">
    main {
        display: flex;
        align-items: center;
        justify-content: space-between;

        min-width: calc(100% - 4em);
        height: 33px;
        padding: 0.35em;
        border-bottom: 1px solid var(--border-color-base);

        background: var(--color-dark-level-1);

        // TODO: Still make click interractions possible even with dragging
        // -webkit-app-region: drag;

        div {
            display: flex;
        }

        section {
            display: flex;
            align-items: center;

            button {
                outline: none;
            }
        }

        &.fullscreen {
            position: absolute;
            z-index: 5;
            top: 0;
            right: 0;

            justify-content: right;

            border-bottom: none;

            background: none;
            box-shadow: none;

            div,
            section {
                display: none;
            }

            section:last-of-type {
                display: flex;

                :last-child {
                    display: none;
                }
            }
        }
    }
</style>
