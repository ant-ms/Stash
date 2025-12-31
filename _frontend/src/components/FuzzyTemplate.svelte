<script lang="ts">
    import FuzzySearch from "fuzzy-search"
    import { onMount, type Snippet } from "svelte"

    import { layout } from "$lib/context"

    type T = $$Generic<Record>
    type TAsArray = Array<T>

    let {
        data,
        searchAttributes,
        conditionAttribute = null,
        placeholder = "",
        value = $bindable(""),
        children,
        onselected = () => {}
    }: {
        data: TAsArray
        searchAttributes: string[]
        conditionAttribute?: keyof T | null
        placeholder?: string
        value?: string
        children: Snippet<[T]>
        onselected?: (d: T) => void
    } = $props()

    let inputBox: HTMLInputElement
    let selectedIndex = $state(0)

    let searcher: any = $state(null)

    const executeSearch = (query: string) => {
        if (!searcher) return []

        return searcher
            .search(query)
            .filter((d: any) => typeof d != "string" || d != ".DS_STORE")
            .slice(0, layout.current == "mobile" ? 15 : 10) as T
    }
    let results: T[] = $derived(executeSearch(value))

    $effect(() => {
        searcher = new FuzzySearch(
            data.filter(t =>
                conditionAttribute == null ? true : t[conditionAttribute]
            ),
            searchAttributes,
            {
                caseSensitive: false,
                sort: true
            }
        )
    })

    const onInput = (event: KeyboardEvent) => {
        if (event.key == "ArrowUp") {
            if (selectedIndex > 0) selectedIndex--
        }

        if (event.key == "ArrowDown") {
            if (selectedIndex <= results.length) selectedIndex++
        }

        if (event.key == "Enter") {
            onselected(results[selectedIndex])
        }
    }

    onMount(() => {
        inputBox.focus()
    })
</script>

<main>
    <input
        type="search"
        bind:value
        onkeydown={e => onInput(e)}
        bind:this={inputBox}
        {placeholder}
    />

    {#each results as result, i}
        <div class:active={i == selectedIndex}>
            {@render children(result)}
        </div>
    {/each}
</main>

<style lang="scss">
    main {
        display: grid;
        max-width: 100%;

        input {
            margin-bottom: 1em;
            padding: 0.5em;
        }

        div {
            display: flex;
            justify-content: space-between;

            margin: 0 0.15em;
            padding: 0.4em;
            border: 1px solid transparent;
            border-radius: 0.35em;

            background: transparent;

            transition: background 150ms;

            &.active {
                border: 1px solid var(--border-color-1-hover);
                background: var(--border-color-1);
            }
        }
    }
</style>
