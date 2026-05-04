import * as mdiIcons from "@mdi/js"

const possibleMdiIcons: Record<string, string> = Object.fromEntries(
    Object.entries(mdiIcons).filter(([key]) => key.startsWith("mdi"))
) as any

export type IconName = string

const allStaticIcons = {
    ...possibleMdiIcons
}

export let possibleIcons = $state<Record<string, string>>({
    ...possibleMdiIcons
})
