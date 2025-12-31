<script lang="ts">
    import FuzzySearch from "fuzzy-search"
    import { onMount } from "svelte"

    import Icon from "$components/elements/Icon.svelte"
    import { layout } from "$lib/context"
    import {
        default as tagsController,
        type TagExtended
    } from "$lib/controllers/TagsController.svelte"

    let value = $state("")
    let focused = $state(false)

    let selectionIndex = $state(-1)
    let inputElement: HTMLInputElement

    export function focus() {
        inputElement.focus()
    }

    onMount(() => {
        if (focusOnMount) {
            inputElement.focus()
        }
    })

    let {
        alwaysExpanded = false,
        height = 25,
        onselected = (() => {}) as (tag: TagExtended) => void,
        focusOnMount = false
    } = $props()

    const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case "ArrowUp":
                if (selectionIndex > 0) selectionIndex--
                break
            case "ArrowDown":
                if (selectionIndex <= results.length) selectionIndex++
                break
            case "Enter":
                onselected(results[selectionIndex])
                break
            case "Tab":
                e.preventDefault()
                onselected(results[0])
                value = ""
                break
            default:
                selectionIndex = -1
                break
        }
    }

    //   TODO: this should be all and not just some of the tags (aka: should ignore filters)
    let searcher = $derived(
        new FuzzySearch(Object.values(tagsController.tagMap), ["tag"], {
            caseSensitive: false,
            sort: true
        })
    )
    const executeSearch = (query: string) => {
        if (!searcher) return []

        return searcher
            .search(query)
            .slice(0, layout.current == "mobile" ? 15 : 10) as TagExtended[]
    }
    let results: TagExtended[] = $derived(executeSearch(value))
</script>

<main style:--height="{height}px">
    <input
        bind:this={inputElement}
        type="text"
        onfocusin={() => (focused = true)}
        onfocusout={() => (focused = false)}
        bind:value
        onkeydown={e => {
            e.stopPropagation()
            handleKeyDown(e)
        }}
        class:alwaysExpanded
    />

    {#if value?.length > 0 && focused}
        <div class="results">
            {#each results as result, i}
                <div class:active={i == selectionIndex}>
                    {#if result.icon}
                        <Icon name={result.icon} />
                    {/if}
                    <span>{result.tag}</span>
                    <span>{result.count}</span>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style lang="scss">
    $width: 13em;

    main {
        position: relative;

        input {
            width: var(--height);
            height: var(--height);
            transition: width 200ms;

            &:focus,
            &.alwaysExpanded {
                width: $width;
            }
        }

        .results {
            position: absolute;
            z-index: 10;
            top: calc(var(--height) + 8px);
            left: 0;

            display: grid;

            border: 1px solid var(--border-color-1);

            background: var(--color-dark-level-1);

            div {
                overflow: hidden;
                display: flex;
                display: block;
                gap: 1rem;
                align-content: center;

                padding: 0.5em;

                text-overflow: ellipsis;
                text-transform: capitalize;
                white-space: nowrap;

                transition: background 150ms;

                &.active {
                    background: #303030;
                }

                span:last-child {
                    font-size: 14px;
                    opacity: 0.7;
                }
            }
        }
    }
</style>
