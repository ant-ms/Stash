import mime from "mime-types"

import { createPostUploadJobs } from "../actions/create-post-upload-jobs"
import { createPreUploadMediaEntry } from "../actions/create-pre-upload-media-entry"
import prisma from "../prisma"

const getTransmissionEndpoint = async () =>
    (
        await prisma.settingsKeyValuePairs.findUniqueOrThrow({
            where: {
                key: "TRANSMISSION_ENDPOINT"
            }
        })
    ).value

const getTransmissionStashDataLocation = async () =>
    (
        await prisma.settingsKeyValuePairs.findUniqueOrThrow({
            where: {
                key: "TRANSMISSION_STASH_DATA_LOCATION"
            }
        })
    ).value

let transmissionSessionId = ""

const make_request = async (body: object) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    const _make_request = async (body: object) => {
        const response = await fetch(await getTransmissionEndpoint(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Transmission-Session-Id": transmissionSessionId
            },
            body: JSON.stringify(body)
        })
        return response
    }

    let response = await _make_request(body)
    if (response.status === 409) {
        transmissionSessionId =
            response.headers.get("X-Transmission-Session-Id") || ""
        response = await _make_request(body)
    }

    if (!response.ok) {
        throw new Error(
            `Transmission API error: ${response.status} ${response.statusText}`
        )
    }

    return await response.json()
}

export const getAllCompletedTorrents = async (d: {}) => {
    const transmissionStashDataLocation =
        await getTransmissionStashDataLocation()
    return (
        (await make_request({
            method: "torrent-get",
            arguments: {
                fields: ["id", "name", "files", "status", "downloadDir"]
            }
        })) as {
            arguments: {
                torrents: Array<{
                    files: Array<{
                        bytesCompleted: number
                        length: number
                        name: string
                    }>
                    id: number
                    name: string
                    status: number
                    downloadDir: string
                }>
            }
            result: string
        }
    ).arguments.torrents.filter(
        t =>
            [0, 5, 6].includes(t.status) &&
            t.files.length == 1 &&
            t.downloadDir != transmissionStashDataLocation
    )
}

export const transmissionCreatePreUploadMediaEntry = async (d: {
    name: string
    clusterName: string
    tagIds: Array<number>
    downloadDir: string
}) => {
    const type =
        mime.lookup(
            `${d.downloadDir.replace("/downloads", "/transmission")}/${d.name}`
        ) || "Unknown"
    return await createPreUploadMediaEntry({
        name: d.name,
        type: type,
        clusterName: d.clusterName,
        tagIds: d.tagIds
    })
}

export const renameTorrentPath = async (d: {
    id: number
    oldFileName: string
    newFileName: string
}) => {
    await make_request({
        method: "torrent-rename-path",
        arguments: {
            ids: [d.id],
            path: d.oldFileName,
            name: d.newFileName
        }
    })
}

export const moveTorrentPath = async (d: { id: number }) => {
    await make_request({
        method: "torrent-set-location",
        arguments: {
            ids: [d.id],
            location: await getTransmissionStashDataLocation(),
            move: true
        }
    })
}

export const createPostMoveJobs = async (d: { mediaId: string }) => {
    const { type } = await prisma.media.findUniqueOrThrow({
        where: {
            id: d.mediaId
        }
    })
    await createPostUploadJobs(d.mediaId, type)
}

export const getAllSeedingTorrents = async (d: {}) => {
    const transmissionStashDataLocation =
        await getTransmissionStashDataLocation()
    return (
        (await make_request({
            method: "torrent-get",
            arguments: {
                fields: [
                    "id",
                    "name",
                    "downloadDir",
                    "totalSize",
                    "uploadedEver",
                    "uploadRatio"
                ]
            }
        })) as {
            arguments: {
                torrents: Array<{
                    id: number
                    name: string
                    downloadDir: string
                    totalSize: number
                    uploadedEver: number
                    uploadRatio: number
                }>
            }
            result: string
        }
    ).arguments.torrents.filter(
        t => t.downloadDir == transmissionStashDataLocation
    )
}
