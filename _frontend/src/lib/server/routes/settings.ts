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
