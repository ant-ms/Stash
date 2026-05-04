<script lang="ts">
    import Button from "$components/elements/Button.svelte"
    import Icon from "$components/elements/Icon.svelte"
    import Toggle from "$components/elements/Toggle.svelte"
    import { type IconName } from "$lib/possibleIcons.svelte"
    import query from "$lib/client/call"

    let {
        title,
        icon,
        jobName,
        initialEnabled,
        initialCron,
        onRun
    }: {
        title: string
        icon: IconName
        jobName: string
        initialEnabled: boolean
        initialCron: string
        onRun?: () => Promise<void>
    } = $props()

    let enabled = $state(initialEnabled)
    let cronExpression = $state(initialCron)
    let running = $state(false)

    async function saveEnabled(value: boolean) {
        await query("updateScheduledJob", { name: jobName, enabled: value })
    }

    async function saveCron() {
        await query("updateScheduledJob", {
            name: jobName,
            cronExpression
        })
    }

    async function runNow() {
        running = true
        try {
            if (onRun) {
                await onRun()
            } else {
                await query("createJob", {
                    name: jobName,
                    data: "{}",
                    priority: 0
                })
            }
        } finally {
            running = false
        }
    }
</script>

<main>
    <div class="header">
        <Icon name={icon} />
        <b>{title}</b>
    </div>

    <div class="row">
        <span>Enabled</span>
        <Toggle
            bind:state={enabled}
            toggle={saveEnabled}
        />
    </div>

    <div class="row">
        <span>Cron schedule</span>
        <input
            type="text"
            bind:value={cronExpression}
            onblur={saveCron}
            placeholder="e.g. 0 * * * *"
            disabled={!enabled}
        />
    </div>

    <div class="footer">
        <Button
            card
            noMargin
            icon="mdiPlay"
            onclick={runNow}
            disabled={running}
        >
            Run now
        </Button>
    </div>
</main>

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        padding: 0.75rem;
        border-radius: 3px;

        background: var(--color-dark-level-base);

        .header,
        .row,
        .footer {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .row {
            span {
                flex-grow: 1;
            }

            input {
                background: var(--color-dark-level-1);
                border: 1px solid var(--border-color-base);
                border-radius: 3px;
                color: inherit;
                font-size: 0.85rem;
                padding: 0.2rem 0.4rem;
                width: 10rem;

                &:disabled {
                    opacity: 0.4;
                }
            }
        }

        .footer {
            justify-content: flex-end;
        }
    }
</style>
