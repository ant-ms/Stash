<script lang="ts">
    import { PressedKeys } from "runed"
    import { onMount } from "svelte"
    import { run } from "svelte/legacy"

    import { page } from "$app/state"
    import Button from "$components/elements/Button.svelte"
    import { isMobile } from "$lib/context"
    import { mediaController } from "$lib/controllers/MediaController.svelte"
    import { settings, videoElement } from "$lib/stores.svelte"

    const formatDuration = (seconds: number) => {
        let hours = Math.floor(seconds / 3600)
        let minutes = Math.floor(seconds / 60)
        let remainingSeconds = seconds % 60

        if (hours > 0) {
            return (
                hours +
                ":" +
                (minutes < 10 ? "0" + minutes : minutes) +
                ":" +
                remainingSeconds.toFixed()
            )
        }

        return (
            minutes +
            ":" +
            (remainingSeconds < 10
                ? "0" + remainingSeconds.toFixed()
                : remainingSeconds.toFixed())
        )
    }

    let videoElementWidth: number = $state()
    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries.at(0)
            if (!entry) return
            videoElementWidth = entry.contentRect.width
        })

        resizeObserver.observe(video)

        const keys = new PressedKeys()
        keys.onKeys([" "], () => {
            paused = !paused
        })
        keys.onKeys(["k"], () => {
            paused = !paused
        })
        keys.onKeys(["j"], () => {
            const seekBy = 60
            if (currentTime - seekBy < 0) currentTime = 0
            else currentTime -= seekBy
        })
        keys.onKeys(["ArrowLeft"], () => {
            const seekBy = 15
            if (currentTime - seekBy < 0) currentTime = 0
            else currentTime -= seekBy
        })
        keys.onKeys(["ArrowRight"], () => {
            const seekBy = 15
            if (currentTime + seekBy > duration) currentTime = duration
            else currentTime += seekBy
        })
        keys.onKeys(["j"], () => {
            const seekBy = 60
            if (currentTime - seekBy < 0) currentTime = 0
            else currentTime -= seekBy
        })
        keys.onKeys(["l"], () => {
            const seekBy = 60
            if (currentTime + seekBy > duration) currentTime = duration
            else currentTime += seekBy
        })

        // This callback cleans up the observer
        return () => resizeObserver.unobserve(video)
    })

    let video: HTMLVideoElement = $state() as any
    run(() => {
        videoElement.set(video)
    })
    let seekVideo: HTMLVideoElement | null = $state()

    let paused = $state(false)
    let currentTime = $state(0)
    let duration = $state(0)
    let volume = $state(0.5)
    let disableSeeking = $state(false)
    let currentSeekPosition: number = 0

    let playbackPercentage = $derived((currentTime / duration) * 100)

    let rangeSlider: HTMLDivElement = $state() as any
    let thumbIsLifted = $state(false)

    const processMousePositionToTime = (e: MouseEvent | TouchEvent) => {
        const startX = rangeSlider.getBoundingClientRect().left
        const endX = rangeSlider.getBoundingClientRect().right
        const range = endX - startX
        const playbackPercentage =
            // @ts-ignore
            (((e.clientX || e.touches[0].clientX) - startX) / range) * 100

        currentSeekPosition = (video.duration / 100) * playbackPercentage

        if (thumbIsLifted) currentTime = currentSeekPosition

        if (seekVideo) {
            seekVideo.currentTime = currentSeekPosition
            seekVideo.style.left = `${playbackPercentage}%`
        }
    }

    interface Props {
        hideControls?: boolean
    }

    let { hideControls = $bindable(false) }: Props = $props()

    //   TODO: reimplment this
    //   visibleMedium.subscribe(() => {
    //     disableSeeking = false
    //   });

    const SECONDS_TO_SEEK_PER_PERCENT = 10
    let startedTouchingAtTime = 0
    let startedTouchingAtX = 0

    const ontouchstart = (e: TouchEvent) => {
        if ($settings.mediaTouchAction !== "seek") return
        hideControls = false
        startedTouchingAtTime = video.currentTime
        startedTouchingAtX = e.touches[0].clientX
    }

    const ontouchmove = (e: TouchEvent) => {
        if ($settings.mediaTouchAction !== "seek") return
        const distanceMoved = e.touches[0].clientX - startedTouchingAtX
        const distanceMovedPercentage =
            (distanceMoved / videoElementWidth) * 100
        video.currentTime =
            startedTouchingAtTime +
            distanceMovedPercentage * SECONDS_TO_SEEK_PER_PERCENT
    }

    const ontouchend = (e: TouchEvent) => {
        if ($settings.mediaTouchAction !== "seek") return
        const distanceMoved = e.changedTouches[0].clientX - startedTouchingAtX
        if (Math.abs(distanceMoved) < 3) {
            paused = !paused
        }
        hideControls = true
    }
</script>

<main class:hide-controls={hideControls}>
    <video
        onclick={() => {
            if ($settings.mediaTouchAction !== "seek") paused = !paused
        }}
        src={`${page.data.serverURL}/file/${mediaController.visibleMedium?.id}?session=${page.data.session}`}
        autoplay
        bind:this={video}
        bind:paused
        bind:currentTime
        bind:duration
        bind:volume
        {ontouchstart}
        {ontouchmove}
        {ontouchend}
        onplaying={() => {
            if (video.duration <= 5) video.loop = true
        }}
    >
        <track kind="captions" />
    </video>
    <div class="controls" style="width: {videoElementWidth - 32}px">
        <Button
            transparentButton
            noMargin
            icon={paused ? "mdiPlay" : "mdiPause"}
            onclick={() => {
                paused = !paused
            }}
        />
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="range"
            bind:this={rangeSlider}
            onmousedown={e => {
                e.preventDefault()
                thumbIsLifted = true
            }}
            onmousemove={e => {
                processMousePositionToTime(e)
            }}
            onmouseup={e => {
                processMousePositionToTime(e)
                thumbIsLifted = false
            }}
            ontouchstart={() => (thumbIsLifted = true)}
            ontouchmove={e => {
                processMousePositionToTime(e)
            }}
            ontouchend={e => {
                processMousePositionToTime(e)
                thumbIsLifted = false
            }}
        >
            <div
                class="track-before"
                style="width: {playbackPercentage}%"
            ></div>
            <div
                class="track-after"
                style="width: {100 - playbackPercentage}%"
            ></div>
            <div class="thumb" style="left: {playbackPercentage}%"></div>
            {#if !isMobile.current && !disableSeeking}
                <video
                    src="{page.data.serverURL}/thumb/{mediaController
                        .visibleMedium?.id}_seek.webm?session={page.data.session}"
                    bind:this={seekVideo}
                    muted
                    onerror={() => (disableSeeking = true)}
                >
                    <track kind="captions" />
                </video>
            {/if}
        </div>
        <div>
            <span
                >{formatDuration(currentTime)} / {formatDuration(
                    duration
                )}</span
            >
        </div>
    </div>
</main>

<style lang="scss">
    main {
        position: relative;
        width: 100%;
        height: 100%;

        & > video {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            width: inherit;
            max-width: 100%;
            height: inherit;
            max-height: 100%;

            object-fit: contain;
            outline: none !important;
        }

        .controls {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            transform: translate(-8px);

            display: flex;
            gap: 1rem;
            align-items: center;
            justify-self: center;

            padding: 1rem;

            .range {
                $height: 12px;
                $border-radius: 4px;

                cursor: pointer;

                position: relative;

                display: flex;
                flex-grow: 1;
                align-items: center;

                height: $height;

                // TODO: Transition/animation

                .track-before {
                    height: $height;
                    border-top-left-radius: $border-radius;
                    border-bottom-left-radius: $border-radius;
                    background: rgba(255, 255, 255, 0.5);
                }

                .track-after {
                    height: $height;
                    border-radius: 2px;
                    border-top-right-radius: $border-radius;
                    border-bottom-right-radius: $border-radius;

                    background: rgba(50, 50, 50, 0.5);
                }

                .thumb {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);

                    width: 8px;
                    height: $height + 8px;
                    border-radius: 4px;

                    background: white;

                    transition: height 200ms;

                    &:hover {
                        height: $height + 12px;
                    }
                }

                &:not(:hover) {

                    & > video {
                        display: none;
                    }
                }

                /* stylelint-disable-next-line no-descending-specificity */

                & > video {
                    position: absolute;
                    bottom: 40px;
                    transform: translate(-50%);

                    width: 150px;
                    border-radius: 5px;
                }
            }
        }
    }

    .hide-controls {
        cursor: none;

        .controls {
            opacity: 0;
            transition: opacity 0.5s;
        }
    }
</style>
