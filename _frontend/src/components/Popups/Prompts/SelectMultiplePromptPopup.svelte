<script lang="ts">
    import PromptFramework from "./_PromptFramework.svelte"

    interface Props {
        question: string
        options: { value: string; name: string }[]
        selected: string[]
        onresult: (value: string[] | null) => void
    }

    let {
        question,
        options,
        selected = $bindable(),
        onresult
    }: Props = $props()
</script>

<PromptFramework
    oncancel={() => onresult(null)}
    onok={() => onresult(selected)}
>
    <span>{question}:</span>

    <section>
        {#each options as { value, name }}
            <label>
                <input type="checkbox" {value} bind:group={selected} />
                {name}
            </label>
        {/each}
    </section>
</PromptFramework>

<style>
    section {
        overflow-y: auto;
        display: grid;
        gap: 0.5em;

        height: 500px;
        padding-top: 0.5em;
    }

    label {
        display: flex;
        gap: 0.5em;
        align-items: center;
    }

    input:checked {
        background-color: #e0e0e0 !important;
    }
</style>
