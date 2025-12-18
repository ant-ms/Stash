<script lang="ts">
    import Key from "$components/elements/Key.svelte"
    import { controller } from "$lib/stores.svelte"
    import Popup from "$reusables/Popup.svelte"
</script>

<Popup title="Shortcuts" onclose={() => $controller.setPopup(null)}>
    <main>
        <b>Global</b>
        <div>
            <span>Open Settings</span>
            <Key key="command" />
            <Key key="," />
        </div>
        <div>
            <span>Open Shortcuts</span>
            <Key key="command" />
            <Key key="/" />
        </div>

        <b>Navigation</b>
        <div>
            <span>Previous Cluster</span>
            <Key key="shift" />
            <Key key="option" />
            <Key key="arrowUp" />
        </div>
        <div>
            <span>Next Cluster</span>
            <Key key="shift" />
            <Key key="option" />
            <Key key="arrowDown" />
        </div>

        <b>Media Viewer</b>
        <div>
            <span>Toggle Fullscreen</span>
            <Key key="f" />
        </div>
        <div>
            <span>Show details</span>
            <Key key="meta" />
            <Key key="i" />
        </div>
        <div>
            <span>Toggle Serif (Stories)</span>
            <Key key="option" />
            <Key key="s" />
        </div>
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        gap: 0.25em;

        b {
            font-weight: 700;

            &:not(:first-child) {
                margin-top: 1em;
            }
        }

        div {
            display: flex;
            align-items: center;

            span {
                flex-grow: 1;
            }
        }
    }
</style>
