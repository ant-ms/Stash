<script lang="ts">
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import SpecialFilterAttributeDropdown from "$components/Tags/SpecialFilterAttributeDropdown.svelte"
    import { addTagToMedia } from "$lib/client/actions/addTagToMedia.svelte"
    import { removeTagFromMedia } from "$lib/client/actions/removeTagFromMedia.svelte"
    import query from "$lib/client/call"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { controller } from "$lib/stores.svelte"
    import Dropdown from "$reusables/Dropdown.svelte"

    import type { PageData } from "../../routes/[cluster]/$types"
    import TagChip from "../Tags/TagChip.svelte"
    import TagInputField from "../Tags/TagInputField.svelte"

    let pageData = $derived(page.data as PageData)

    let dropdownVisible = $state(false)
</script>

{#if mediaController.visibleMedium}
    <main>
        <div class="left-section">
            <Button
                onclick={() => {
                    fetch(
                        `/api/media/${mediaController.visibleMedium?.id}/favourited`,
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                favourited: !mediaController.visibleMedium?.favourited
                            })
                        }
                    )
                        .then(() => {
                            if (!mediaController.visibleMedium) return
                            const tmp = mediaController.visibleMedium
                            tmp.favourited = !mediaController.visibleMedium.favourited
                            mediaController.visibleMedium = tmp
                        })
                        .catch(console.error)
                }}
                card
                icon={mediaController.visibleMedium.favourited ? "mdiStar" : "mdiStarOutline"}
                styleOverride="padding: 0.6rem; --outline-size: 2px; --border-radius: 12px"
            />
        </div>

        <section class="right-section">
            <Button
                card
                icon="mdiDotsVertical"
                styleOverride="padding: 0.6rem; --outline-size: 2px; --border-radius: 12px"
                onclick={() => {
                    dropdownVisible = !dropdownVisible
                }}
            />
        </section>
    </main>

    <Dropdown visible={dropdownVisible} bottom={80} right={8}>
        <div class="dropdown-content">
            <div class="tags-section">
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

            <hr style="width: 100%; margin: 0.5rem 0; border-color: var(--border-color-base); opacity: 0.5" />

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
                icon="mdiDownload"
                href="/api/media/{mediaController.visibleMedium?.id}/download"
                download
            >
                Download
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
        </div>
    </Dropdown>
{/if}

<style lang="scss">
    main {
        display: flex;
        align-items: center;
        justify-content: space-between;

        width: 100%;
        min-height: 48px;
        padding: 0.75rem 0.5rem;
        box-sizing: border-box;

        background: transparent;

        .left-section {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            flex-wrap: wrap;
            flex-grow: 1;

            :global(> a) {
                border: 1px solid var(--border-color-2) !important;
                background-color: var(--color-dark-level-2) !important;
            }
        }

        .right-section {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            padding-left: 0.5rem;

            :global(> a) {
                border: 1px solid var(--border-color-2) !important;
                background-color: var(--color-dark-level-2) !important;
            }
        }
    }

    .dropdown-content {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        width: 280px;
        max-width: calc(100vw - 32px);

        .tags-section {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 0.25rem;
        }
    }
</style>
