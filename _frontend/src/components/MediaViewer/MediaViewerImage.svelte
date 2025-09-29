<script lang="ts">
    import { page } from "$app/state"
    import { presentationMode } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { settings } from "$lib/stores.svelte"

    let mainElement: HTMLElement = $state() as any
    let imageElement: HTMLImageElement = $state() as any

    let zoomMode: "none" | "original" | "fit" = "none"

    const toggleZoom = (e: MouseEvent) => {
        if ($settings.mediaTouchAction != "zoom") return

        if (zoomMode == "none" && e.button == 0) {
            const targetCords = {
                left: e.offsetX / imageElement.width,
                top: e.offsetY / imageElement.height
            }

            zoomMode = "original"
            imageElement.style.height = "unset"
            imageElement.style.width = "unset"
            imageElement.height = mainElement.clientHeight
            imageElement.width = mainElement.clientWidth
            ;(() => {
                mainElement.scrollTo({
                    top:
                        targetCords.top * imageElement.height -
                        mainElement.clientHeight / 2,
                    left:
                        targetCords.left * imageElement.width -
                        mainElement.clientWidth / 2
                })
            })()

            return
        }

        if (zoomMode == "none" && e.button == 2) {
            zoomMode = "fit"

            const targetCords = {
                left: e.offsetX / imageElement.width,
                top: e.offsetY / imageElement.height
            }

            if (
                imageElement.naturalWidth / mainElement.clientWidth >
                imageElement.naturalHeight / mainElement.clientHeight
            ) {
                imageElement.style.height = "100%"
                imageElement.style.width = "unset"
            } else {
                imageElement.style.height = "unset"
                imageElement.style.width = "100%"
            }

            ;(() => {
                mainElement.scrollTo({
                    top:
                        targetCords.top * imageElement.height -
                        mainElement.clientHeight / 2,
                    left:
                        targetCords.left * imageElement.width -
                        mainElement.clientWidth / 2
                })
            })()

            return
        }

        zoomMode = "none"
        imageElement.style.height = "100%"
        imageElement.style.width = "100%"
    }

    const calculateCursor = (e: MouseEvent) => {
        if ($settings.mediaTouchAction == "zoom") {
            cursor = zoomMode == "none" ? "zoom-in" : "zoom-out"
            return
        }

        if ($settings.mediaTouchAction == "navigate") {
            const { width } = mainElement.getBoundingClientRect()

            if (e.clientY > window.innerHeight - 100) cursor = "default"
            else cursor = e.offsetX < width / 2 ? "w-resize" : "e-resize"
            return
        }

        cursor = "default"
    }

    let cursor = $state("default")

    let src = $derived.by(() => {
        if (presentationMode.current) {
            return `https://picsum.photos/${mediaController.visibleMedium?.width}/${mediaController.visibleMedium?.height}?q=${mediaController.visibleMedium?.id}`
        }
        return `${page.data.serverURL}/file/${mediaController.visibleMedium?.id}?session=${page.data.session}`
    })
</script>

<main bind:this={mainElement}>
    <img
        bind:this={imageElement}
        onmousedown={toggleZoom}
        oncontextmenu={e => e.preventDefault()}
        onmousemove={calculateCursor}
        style:cursor
        {src}
        alt={mediaController.visibleMedium?.name}
    />
</main>

<style lang="scss">
    main {
        position: relative;
        overflow: scroll;
        width: 100%;
        height: 100%;

        img {
            position: absolute;
            top: 0;
            left: 0;

            width: 100%;
            height: 100%;

            object-fit: contain;
        }
    }
</style>
