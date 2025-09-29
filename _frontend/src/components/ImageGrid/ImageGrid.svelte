<script lang="ts">
    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import { mediaController } from "$lib/controllers/MediaController.svelte"

    import type { PageData } from "../../routes/[cluster]/$types"
    import ImageGridCollection from "./ImageGrid_Collection.svelte"
    import ImageGridPage from "./ImageGrid_Page.svelte"
    import ImageGridStories from "./ImageGrid_Stories.svelte"
    import ImageGridStudios from "./ImageGrid_Studios.svelte"

    let pageData = $derived(page.data as PageData)
</script>

<main>
    {#if pageData.cluster.type == "collection" && !mediaController.selectedTags.length}
        <ImageGridCollection />
    {:else if pageData.cluster.type == "stories"}
        <ImageGridStories />
    {:else}
        <!-- TODO -->
        <!-- {#if pageData.cluster.type == "collection"}
        <div id="collectionGroups">
          {#if mediaController.selectedTags.length == 1 && mediaController.selectedTags[0].includes("/")}
            <Button
              card
              icon="mdiFolderArrowUpOutline"
              onclick={() =>
                selectedTags.set([
                  mediaController.selectedTags[0].replace(/\/[^\/]+$/, "").toLowerCase()
                ])}
            >
              {mediaController.selectedTags[0].replace(/\/.+$/, "")}
            </Button>
          {/if}

          {#if tagsController.tags_flat}
            {#each tagsController.tags_flat
              .filter(t => t.tag
                  .join("/")
                  .toLowerCase()
                  .startsWith(mediaController.selectedTags[0].toString()))
              .filter(t => t.tag
                    .join("/")
                    .toLowerCase() != mediaController.selectedTags[0].toString())
              .sort((a, b) => a.tag
                  .join("/")
                  .localeCompare(b.tag.join("/"))) as { tag }}
              <Button
                card
                icon="mdiFolderArrowDownOutline"
                onclick={() => selectedTags.set([tag.join("/").toLowerCase()])}
              >
                {tag.slice(-1)}
              </Button>
            {/each}
          {/if}
        </div>
      {/if} -->

        <section>
            {#each mediaController.pages as { hash, media }, i (hash)}
                <div>
                    {#if pageData.cluster.type == "withName"}
                        <ImageGridStudios {media} {i} />
                    {:else}
                        <ImageGridPage {media} />
                    {/if}
                </div>
            {/each}
            <Button
                card
                icon="mdiPageNext"
                onclick={async () => {
                    await mediaController.loadMoreMedia()
                }}
                styleOverride="margin: 1rem">Load More Media</Button
            >
        </section>
    {/if}
</main>

<style lang="scss">
    main {
        padding: 1em;
    }

    section {
        display: grid;
        gap: 14px;
        max-width: 100vw;
    }

    #collectionGroups {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

        margin-top: -0.5em;
        margin-right: -0.5em;
        margin-bottom: 0.5em;
        margin-left: -0.5em;
    }
</style>
