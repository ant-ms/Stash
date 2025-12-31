<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte"
    import { run } from "svelte/legacy"

    const dispatch = createEventDispatcher()

    interface Props {
        once?: boolean
        top?: number
        bottom?: number
        left?: number
        right?: number
        delay?: number
        style?: string
        children?: import("svelte").Snippet<[any]>
    }

    let {
        once = false,
        top = 0,
        bottom = 0,
        left = 0,
        right = 0,
        delay = 0,
        style = "",
        children,
        ...others
    }: Props = $props()

    let intersecting = $state(false)
    let container: Element = $state() as any as any

    run(() => {
        if (intersecting) dispatch("intersecting")
    })

    // @ts-ignore
    onMount(async () => {
        if (delay) await new Promise(resolve => setTimeout(resolve, delay))

        if (typeof IntersectionObserver != "undefined" && container) {
            const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`

            const observer = new IntersectionObserver(
                entries => {
                    intersecting = entries.some(e => e.isIntersecting)
                    if (intersecting && once) {
                        observer.unobserve(container)
                    }
                },
                {
                    rootMargin,
                    // https://stackoverflow.com/questions/54983348/intersectionobserver-rootmargins-positive-and-negative-values-are-not-working/58622945#58622945?newreg=36a94541d1d94aedb3373363975491f0
                    root: document.getElementById("imageGallerySection")
                }
            )

            observer.observe(container)
            return () => observer.unobserve(container)
        }
    })
</script>

<div
    bind:this={container}
    onclick={e => dispatch("click", e)}
    {style}
    {...others}
>
    {@render children?.({ intersecting })}
</div>
