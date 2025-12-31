<script lang="ts">
    import Select from "$components/elements/Select.svelte"
    import Toggle from "$components/elements/Toggle.svelte"
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
    import { layout, presentationMode } from "$lib/context"
    import { settings } from "$lib/stores.svelte"
</script>

<SettingsPageContent title="General">
    <section>
        <div>
            <span>Mobile Navigation Touch areas</span>
            <Select
                options={[
                    { value: "navigate", name: "Navigate" },
                    { value: "zoom", name: "Zoom" },
                    { value: "seek", name: "Seek" }
                ]}
                bind:value={$settings.mediaTouchAction}
            />
        </div>

        <div>
            <span>Layout</span>
            <Select
                options={[
                    { value: "desktop", name: "Desktop" },
                    { value: "mobile", name: "Mobile" },
                    { value: "tv", name: "TV" }
                ]}
                bind:value={layout.current}
            />
        </div>

        <div>
            <span>Theme</span>
            <Select
                options={[
                    { value: "default", name: "Default" },
                    { value: "light", name: "Light" },
                    { value: "amoled", name: "Amoled" }
                ]}
                bind:value={$settings.theme}
            />
        </div>

        <hr style="width: 100%" />

        <div>
            <span>Presentation Mode</span>
            <Toggle bind:state={presentationMode.current} />
        </div>
    </section>
</SettingsPageContent>

<style lang="scss">
    section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem 1rem;
        max-width: 475px;

        div {
            display: flex;
            align-items: center;

            span {
                flex-grow: 1;
            }
        }
    }
</style>
