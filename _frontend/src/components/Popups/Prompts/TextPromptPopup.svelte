<script lang="ts">
    import { onMount } from "svelte"

    import PromptFramework from "./_PromptFramework.svelte"

    interface Props {
        question: string
        value: string
        onresult: (value: string | null) => void
    }

    let { question, value, onresult }: Props = $props()

    let _value = $state(value)

    const onInput = (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            onresult(_value)
        }
    }

    let inputElement: HTMLTextAreaElement = $state() as any
    onMount(() => {
        inputElement.focus()
    })
</script>

<PromptFramework oncancel={() => onresult(null)} onok={() => onresult(_value)}>
    <label>
        <span>{question}:</span>
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <textarea
            name="text"
            rows="3"
            wrap="soft"
            bind:this={inputElement}
            bind:value={_value}
            onkeydown={onInput}
        ></textarea>
    </label>
</PromptFramework>

<style lang="scss">
    label {
        display: grid;
        gap: 0.5em;
        min-width: 300px;
    }
</style>
