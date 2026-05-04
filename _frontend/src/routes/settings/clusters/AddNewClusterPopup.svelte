<script lang="ts">
    import { invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import { possibleIcons } from "$lib/possibleIcons.svelte"
    import Popup from "$reusables/Popup.svelte"

    interface Props {
        close: () => void
    }

    let { close }: Props = $props()

    let name = $state("")
    let icon = $state("")
    let type = $state("normal")
    let errors: string[] = $state([])

    const validate = () => {
        errors = []

        if (!Object.keys(possibleIcons).includes(icon)) errors.push("icon")

        return errors.length === 0
    }

    const addNewCluster = async () => {
        if (!validate()) return

        const response = await fetch("/settings/clusters/create", {
            method: "POST",
            body: JSON.stringify({ name, icon, type })
        })

        if (!response.ok) {
            window.alert("Something went wrong, got status " + response.status)
            console.error(await response.text())
            return
        }

        invalidateAll()
        close()
    }
</script>

<Popup title="Add new Cluster" onclose={close}>
    <section>
        <label for="e-name"> Name </label>
        <input
            bind:value={name}
            class:invalid={errors.includes("name")}
            type="text"
            id="e-name"
            oninput={validate}
        />

        <!-- TODO: Search ability and preview -->
        <label for="e-icon"> Icon </label>
        <input
            bind:value={icon}
            class:invalid={errors.includes("icon")}
            type="text"
            id="icon"
            oninput={validate}
        />

        <label for="e-type"> Type </label>
        <select bind:value={type} id="e-type">
            {#each Object.keys( ["normal", "collection", "screenshots", "stories", "withName"] ) as type}
                <option value={type}
                    >{type.substring(0, 1).toUpperCase()}{type.substring(
                        1
                    )}</option
                >
            {/each}
        </select>
    </section>

    {#snippet actionsLeft()}
        <Button card onclick={close}>Cancel</Button>
    {/snippet}

    {#snippet actionsRight()}
        <Button
            card
            highlighted
            icon="mdiPlus"
            onclick={addNewCluster}
            shortcut={{ modifier: "meta", key: "enter" }}
        />
    {/snippet}
</Popup>

<style lang="scss">
    section {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em 1em;
        align-items: center;

        input.invalid {
            outline: 1px solid red !important;
        }
    }
</style>
