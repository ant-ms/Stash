import prisma from "../prisma"

export const updateSettingsKeyValuePair = async (d: {
    key: string
    value: string
}) =>
    await prisma.settingsKeyValuePairs.upsert({
        where: { key: d.key },
        update: { value: d.value },
        create: { key: d.key, value: d.value }
    })

export const getScheduledJob = async (d: { name: string }) =>
    await prisma.scheduledJob.findUnique({ where: { name: d.name } })

export const updateScheduledJob = async (d: {
    name: string
    enabled?: boolean
    cronExpression?: string
}) =>
    await prisma.scheduledJob.upsert({
        where: { name: d.name },
        update: {
            ...(d.enabled !== undefined && { enabled: d.enabled }),
            ...(d.cronExpression !== undefined && {
                cronExpression: d.cronExpression
            })
        },
        create: {
            name: d.name,
            enabled: d.enabled ?? false,
            cronExpression: d.cronExpression ?? "0 * * * *"
        }
    })
