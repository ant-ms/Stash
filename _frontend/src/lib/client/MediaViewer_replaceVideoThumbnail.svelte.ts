import { get } from "svelte/store"

import { page } from "$app/state"
import { mediaController } from "$lib/controllers/MediaController.svelte"
import { prompts } from "$lib/controllers/PromptController"
import { controller } from "$lib/stores.svelte"
import vars from "$lib/vars.svelte"

const dataURItoBlob = (dataURI: string) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(",")[1])

    // separate out the mime component
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length)

    // create a view into the buffer
    const ia = new Uint8Array(ab)

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString })
    return blob
}

export default async () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

    const video = vars.videoElement
    if (!video) {
        prompts.notify(
            "ERROR: No video element found present while trying to replace thumbnail."
        )
        return
    }

    // Set the canvas size to match the video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current frame of the video onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get the image data from the canvas
    const imageData = canvas.toDataURL("image/png")

    // Convert the image data to a Blob object
    const blob = dataURItoBlob(imageData)

    const data = new FormData()
    data.append("file", blob, "frame.png")

    let mediaId = mediaController.visibleMedium?.id
    if (!mediaId) {
        return
    }

    await fetch(`${page.data.serverURL}/api/media/${mediaId}/thumbnail`, {
        method: "POST",
        body: data
    }).then(async () => {
        get(controller).setPopup(null)
    })

    vars.thumbnailSuffixParameter = {
        mediaId,
        suffix: Math.random().toString(16).substring(2, 8)
    }
}
