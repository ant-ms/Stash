<script lang="ts">
    import { fade } from "svelte/transition"

    import { page } from "$app/state"
    import Icon from "$components/elements/Icon.svelte"
    import { FCastController } from "$lib/client/fcast/controller.svelte"
    import { PlaybackState } from "$lib/client/fcast/protocol"
    import { layout } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { prompts } from "$lib/controllers/PromptController"

    let disableSeeking = $state(false)
    let seekVideo: HTMLVideoElement | null = $state(null)
    let client: FCastController | null = $state(null)
    let playbackProgress = $derived(
        client &&
            // @ts-ignore
            (client.playbackTime / client.playbackDuration) * 100
    )

    $effect(() => {
        if (mediaController.visibleMedium && client)
            client.play(
                `${localStorage.getItem("lastConnectedRemoteAddress") || page.data.serverURL}/file/${mediaController.visibleMedium.id}?session=${page.data.session}`,
                mediaController.visibleMedium.type
            )
        else if (!mediaController.visibleMedium && client) client.stop()
    })

    $effect(() => {
        console.log(client?.playbackState)
    })

    function handleSliderKeyDown(e: KeyboardEvent) {
        if (!client || !client.playbackTime) return

        const step = 15 // 15 seconds
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault()
            if (client.playbackDuration == undefined) {
                console.error("Playback duration is undefined")
                return
            }
            client.seek(
                Math.min(client.playbackDuration, client.playbackTime + step)
            )
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault()
            client.seek(Math.max(0, client.playbackTime - step))
        } else if (e.key === "Home") {
            e.preventDefault()
            client.seek(0)
        } else if (e.key === "End") {
            e.preventDefault()
            if (client.playbackDuration == undefined) {
                console.error("Playback duration is undefined")
                return
            }
            client.seek(client.playbackDuration)
        }
    }
</script>

<main>
    <section class="first">
        {#if client}
            <button
                type="button"
                aria-label="Disconnect from cast device"
                onclick={() => {
                    console.info("disconnect")
                    client?.disconnect()
                }}
            >
                <Icon name="mdiCastConnected" size={0.8} />
            </button>
        {:else}
            <button
                type="button"
                aria-label="Connect to cast device"
                onclick={async () => {
                    console.info("connect")
                    const address = await prompts.text(
                        "What ip address should I connect to?",
                        localStorage.getItem("lastConnectedAddress") || ""
                    )
                    if (address) {
                        localStorage.setItem("lastConnectedAddress", address)
                    }
                    const remoteAddress = await prompts.text(
                        "What addresss does this client use to connect to stash?",
                        localStorage.getItem("lastConnectedRemoteAddress") || ""
                    )
                    if (remoteAddress) {
                        localStorage.setItem(
                            "lastConnectedRemoteAddress",
                            remoteAddress
                        )
                    }

                    // TODO: Target
                    if (address)
                        client = new FCastController(address, 46899, {
                            appName: "Stash",
                            appVersion: "1.0.0",
                            displayName: "Stash"
                        })
                }}
            >
                <Icon name="mdiCastOff" size={0.8} />
            </button>
        {/if}

        {#if mediaController.visibleMedium}
            <button
                type="button"
                aria-label="Close media"
                onclick={() => (mediaController.visibleMedium = null)}
            >
                <Icon name={"mdiBackspaceOutline"} size={0.8} />
            </button>
        {/if}
    </section>

    <section>
        {#if mediaController.visibleMedium?.type.startsWith("video")}
            <!-- go backward 60 sec -->
            <button
                type="button"
                aria-label="Rewind 60 seconds"
                disabled={!client?.playbackTime}
                onclick={() => {
                    // @ts-ignore
                    client?.seek(client?.playbackTime - 60)
                }}
                transition:fade={{ duration: 100 }}
            >
                <Icon name="mdiRewind60" size={0.8} />
            </button>

            <!-- go backward 15 sec -->
            <button
                type="button"
                aria-label="Rewind 15 seconds"
                disabled={!client?.playbackTime}
                onclick={() => {
                    // @ts-ignore
                    client?.seek(client?.playbackTime - 15)
                }}
                transition:fade={{ duration: 100 }}
            >
                <Icon name="mdiRewind15" size={0.8} />
            </button>

            <!-- play/pause -->
            <button
                type="button"
                aria-label={client?.playbackState == PlaybackState.Playing
                    ? "Pause"
                    : "Play"}
                disabled={!client?.playbackState}
                onclick={() => {
                    if (client?.playbackState == PlaybackState.Playing)
                        client?.pause()
                    else client?.resume()
                }}
                transition:fade={{ duration: 100 }}
            >
                <Icon
                    name={client?.playbackState == PlaybackState.Playing
                        ? "mdiPause"
                        : "mdiPlay"}
                    size={0.8}
                />
            </button>

            <!-- go forward 15 sec -->
            <button
                type="button"
                aria-label="Fast-forward 15 seconds"
                disabled={!client?.playbackTime}
                onclick={() => {
                    // @ts-ignore
                    client?.seek(client?.playbackTime + 15)
                }}
                transition:fade={{ duration: 100 }}
            >
                <Icon name="mdiFastForward15" size={0.8} />
            </button>

            <!-- go forward 60 sec -->
            <button
                type="button"
                aria-label="Fast-forward 60 seconds"
                disabled={!client?.playbackTime}
                onclick={() => {
                    // @ts-ignore
                    client?.seek(client?.playbackTime + 60)
                }}
                transition:fade={{ duration: 100 }}
            >
                <Icon name="mdiFastForward60" size={0.8} />
            </button>
        {/if}
    </section>

    <section class="last">
        {#if mediaController.visibleMedium}
            <button
                type="button"
                aria-label={mediaController.visibleMedium.favourited
                    ? "Remove from favourites"
                    : "Add to favourites"}
                onclick={() => {
                    fetch(
                        `/api/media/${mediaController.visibleMedium?.id}/favourited`,
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                favourited:
                                    !mediaController.visibleMedium?.favourited
                            })
                        }
                    )
                        .then(() => {
                            if (!mediaController.visibleMedium) return
                            const tmp = mediaController.visibleMedium
                            tmp.favourited =
                                !mediaController.visibleMedium.favourited
                            mediaController.visibleMedium = tmp
                        })
                        .catch(console.error)
                }}
            >
                {#if mediaController.visibleMedium.favourited}
                    <Icon name="mdiStar" size={0.8} />
                {:else}
                    <Icon name="mdiStarOutline" size={0.8} />
                {/if}
            </button>
            <!-- <button type="button" aria-label="Previous media" onclick={() => $controller.goToPreviousMedia()}>
                <Icon name="mdiChevronLeft" size={0.8} />
            </button>
            <button type="button" aria-label="Next media" onclick={() => $controller.goToNextMedia()}>
                <Icon name="mdiChevronRight" size={0.8} />
            </button> -->
        {/if}
    </section>

    {#if mediaController.visibleMedium?.type.startsWith("video") && client}
        <div
            role="slider"
            tabindex="0"
            aria-label="Playback progress"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={client.playbackDuration || 0}
            aria-valuenow={client.playbackTime || 0}
            class="playbackStatus"
            onclick={e => {
                client?.seek(
                    (e.clientY / window.innerHeight) *
                        (client.playbackDuration || 0)
                )
            }}
            onkeydown={handleSliderKeyDown}
            onmousemove={e => {
                if (seekVideo) {
                    seekVideo.currentTime =
                        (e.clientY * seekVideo.duration) / window.innerHeight

                    const topBottomPadding = 59
                    seekVideo.style.top = `${Math.max(topBottomPadding, Math.min(window.innerHeight - topBottomPadding, e.clientY))}px`
                }
            }}
        >
            <div style:height="{playbackProgress}%"></div>

            {#if layout.current == "desktop" && !disableSeeking}
                <video
                    src="{page.data.serverURL}/thumb/{mediaController
                        .visibleMedium?.id}_seek.webm?session={page.data
                        .session}"
                    muted
                    bind:this={seekVideo}
                    onerror={() => (disableSeeking = true)}
                >
                    <track kind="captions" />
                </video>
            {/if}
        </div>
    {/if}
</main>

<style lang="scss">
    // TODO: Reduce redundancy

    main {
        display: grid;
        grid-template-rows: repeat(3, 1fr);
        align-items: center;
        justify-content: center;

        width: 64px;
        height: calc(100% - 1em);
        padding-top: 0.5em;
        padding-bottom: 0.5em;
        border-left: 1px solid var(--border-color-1);

        background: var(--color-dark-level-1);

        section.first {
            align-self: start;
        }

        section.last {
            align-self: end;
        }

        button {
            all: unset;

            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 45px;
            height: 37px;
            margin: 0.25em;
            border: 1px solid transparent;
            border-radius: 0.35em;

            transition:
                background 100ms,
                border 100ms;

            &:disabled {
                pointer-events: none;
                opacity: 0.5;
            }

            @media (hover: hover) and (pointer: fine) {
                &:not(:disabled):hover {
                    border: 1px solid var(--border-color-1-hover);
                    background: var(--border-color-1);
                }
            }
        }

        .playbackStatus {
            cursor: pointer;

            position: absolute;
            top: 0;
            right: 0;

            width: 5px;
            height: 100vh;

            div {
                width: 5px;
                background: var(--border-color-1);
                transition: height 150ms;
            }

            video {
                position: absolute;
                right: 1em;
                transform: translateY(-50%);

                display: none;

                height: 85px;
                border-radius: 5px;
            }

            &:hover video {
                display: block;
            }
        }
    }
</style>
