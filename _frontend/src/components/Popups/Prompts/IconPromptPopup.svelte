<script lang="ts">
    import FuzzySearch from "fuzzy-search"
    import { onMount } from "svelte"

    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import { possibleIcons, type IconName } from "$lib/possibleIcons.svelte"

    import PromptFramework from "./_PromptFramework.svelte"

    let {
        question,
        value,
        onresult
    }: {
        question: string
        value: string
        onresult: (value: string | null) => void
    } = $props()

    let _value = $state(value)

    const searcher = $derived(
        new FuzzySearch(Object.keys(possibleIcons) as IconName[], [], {
            caseSensitive: false,
            sort: true
        })
    )

    let inputElement: HTMLInputElement
    onMount(() => {
        inputElement.focus()
    })

    const onInput = (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            if (_value in possibleIcons) onresult(_value)
        }
    }

    let results: IconName[] = $derived.by(() => {
        if (!_value) return []
        return searcher.search(_value).slice(0, 20)
    })
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(_value)}>
    <label>
        <span>{question}:</span>
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <div class="inputbar">
            <input
                type="text"
                bind:this={inputElement}
                bind:value={_value}
                onkeydown={onInput}
            />
            <Icon name={_value as any} />
        </div>
    </label>

    <div class="suggestionsGrid">
        {#each results as result}
            <Button
                title={result}
                icon={result}
                onclick={() => {
                    _value = result
                }}
            />
        {/each}
    </div>
</PromptFramework>

<style lang="scss">
    label {
        display: grid;
        gap: 0.5em;
        min-width: 300px;
    }

    input {
        width: 100%;
    }

    .inputbar {
        display: flex;
        gap: 0.65rem;
        padding: 0.5rem;
    }

    .suggestionsGrid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5em;
        align-items: center;
        justify-content: center;

        margin-top: 1rem;
    }
</style>
