<script lang="ts">
    import FuzzySearch from "fuzzy-search"
    import { onMount, type Snippet } from "svelte"

    import Button from "$components/elements/Button.svelte"
    import { layout } from "$lib/context"
    import { controller, settings } from "$lib/stores.svelte"
    import Popup from "$reusables/Popup.svelte"

    type T = $$Generic<Record>
    type TAsArray = Array<T>

    let {
        promise,
        searchAttributes,
        disableClose = false,
        conditionAttribute = null,
        placeholder = "",
        value = $bindable(""),
        children,
        onclose = () => {},
        onselected = () => {}
    }: {
        promise: Promise<TAsArray>
        searchAttributes: string[]
        disableClose?: boolean
        conditionAttribute?: keyof T | null
        placeholder?: string
        value?: string
        children: Snippet<[T]>
        onclose?: () => void
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

    promise.then(data => {
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
            if (!disableClose) {
                onclose()
                $controller.setPopup(null)
            }
            onselected(results[selectedIndex])
        }
    }

    onMount(() => {
        inputBox.focus()
    })
</script>

<Popup {onclose} hideHeader>
    <main>
        <input
            type="search"
            bind:value
            onkeydown={e => onInput(e)}
            bind:this={inputBox}
            {placeholder}
        />

        {#each results as result, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class:active={i == selectedIndex}
                onclick={() => {
                    if (!disableClose) {
                        onclose()
                        $controller.setPopup(null)
                    }
                    onselected(results[i])
                }}
            >
                {@render children(result)}
            </div>
        {/each}

        {#if layout.current == "mobile"}
            <div class="mobileNavigationButtons">
                <Button
                    card
                    icon="mdiArrowUp"
                    onclick={() => {
                        if (selectedIndex > 0) selectedIndex--
                    }}
                />
                <Button
                    card
                    icon="mdiArrowDown"
                    onclick={() => {
                        if (selectedIndex <= results.length) selectedIndex++
                    }}
                />
                <Button
                    card
                    icon="mdiKeyboardReturn"
                    onclick={() => {
                        if (!disableClose) {
                            onclose()
                            $controller.setPopup(null)
                        }
                        onselected(results[selectedIndex])
                    }}
                />
            </div>
        {/if}
    </main>
</Popup>

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
                background: #303030;
            }

            &.mobileNavigationButtons {
                position: absolute;
                right: 10px;
                bottom: 10px;

                border: 1px solid var(--border-color-base);

                background: var(--color-dark-level-base);
            }
        }
    }
</style>
