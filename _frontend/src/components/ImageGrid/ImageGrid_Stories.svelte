<script lang="ts">
    import { PressedKeys } from "runed"
    import { onMount } from "svelte"
    import SvelteMarkdown from "svelte-markdown"

    import { page } from "$app/state"
    import query from "$lib/client/call"
    import { controller } from "$lib/stores.svelte"
    import varsSvelte from "$lib/vars.svelte"

    import type { PageData } from "../../routes/[cluster]/$types"

    let pageData = page.data as PageData

    $effect(() => {
        varsSvelte.layout.hideSidebar = storyPromise != null
    })

    let story: Awaited<typeof pageData.streamed.stories>[number] | null =
        $state(null)
    let storyPromise = $derived(
        story
            ? query("getStoryContent", { id: story.id }).then(content => {
                  varsSvelte.selectedChapterIndex = 0
                  varsSvelte.chaptersOfStory = []

                  const chapters = content.split("\n#")

                  for (const i in chapters) {
                      const chapter = chapters[i]

                      varsSvelte.chaptersOfStory.push(
                          chapter.split("\n")[0].replaceAll("#", "").trim()
                      )
                  }

                  return content
              })
            : null
    )

    const selectStory = async (
        _story: Awaited<typeof pageData.streamed.stories>[number]
    ) => {
        story = _story

        window.history.pushState({ storyOpen: true }, "")
    }

    onMount(() => {
        const keys = new PressedKeys()
        keys.onKeys(["c"], () => {
            $controller.setPopup("Create Story")
        })
    })
</script>

<svelte:window onpopstate={() => (varsSvelte.chaptersOfStory = [])} />

{#if storyPromise}
    {#await storyPromise}
        <p>Loading...</p>
    {:then source}
        <div class="content">
            <div class="header">
                <h1>{story?.title}</h1>
            </div>
            <div class="content-body">
                <SvelteMarkdown {source} options={{}} />
            </div>
        </div>
    {/await}
{:else}
    <main class="stories-grid">
        {#await pageData.streamed.stories then stories}
            {#each stories as story}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="story" onclick={() => selectStory(story)}>
                    <div class="title">
                        {story.title}
                    </div>
                    <div class="date">
                        {new Date(story.date).toISOString().slice(0, 10)}
                    </div>
                </div>
            {/each}
        {/await}
    </main>
{/if}

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap");

    .content {
        max-width: 55em;
        margin: auto;

        font-family: Noto Serif;
        font-family: "Literata", serif;
        font-size: 1rem;
        text-align: justify;

        .content-body {
            width: 100%;
        }

        :global(h3),
        :global(h4),
        :global(h5),
        :global(h6) {
            font-weight: 500;
        }

        :global(p),
        :global(h2),
        :global(h3),
        :global(h4),
        :global(h5),
        :global(h6) {
            padding: 0 0.65rem;
            border-right: 3px solid transparent;
            border-left: 3px solid transparent;
            transition: border 350ms;
        }

        .header {
            display: flex;
            justify-content: center;

            h1 {
                margin-top: 0;
                font-size: 2.25rem;
                font-weight: 800;
            }
        }

        :global(h2) {
            font-size: 1.75rem;
            font-weight: 600;

            &:first-child {
                margin-top: 0;
            }
        }

        :global(p) {
            font-weight: 400;
            letter-spacing: 0.3px;

            &:hover {
                border-left: 3px solid #ccc;
            }
        }

        :global(hr) {
            margin: 1.5em 0;
        }
    }

    main.stories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.5em;

        .story {
            cursor: pointer;

            padding: 0.5em;
            border: 1px solid var(--border-color-1-hover);
            border-radius: 0.35em;

            background: var(--color-dark-level-1);

            &:hover {
                border: 1px solid var(--border-color-1);
                background: var(--color-dark-level-2);
            }

            .title {
                height: 120px;
                padding: 0.5em;
            }

            .date {
                display: flex;
                justify-content: center;

                margin: 0.25em;

                font-size: 14px;

                opacity: 0.8;
            }
        }
    }
</style>
