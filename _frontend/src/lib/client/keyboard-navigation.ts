import { goto } from "$app/navigation"

export function neighborByElementsFromPoint(
    currentEl: Element,
    direction: "up" | "down" | "left" | "right",
    selector = "[data-navigable]",
    options?: {
        stepPx?: number // how far to move each probe step
        maxSteps?: number // max number of probes
        marginPx?: number // start just outside the element
        root?: Document // useful for iframes
    }
): Element | null {
    const stepPx = options?.stepPx ?? 8
    const maxSteps = options?.maxSteps ?? 200
    const marginPx = options?.marginPx ?? 2
    const doc = options?.root ?? document

    const rect = currentEl.getBoundingClientRect()

    // Start from the element’s center, then move outward in the chosen direction.
    let x = (rect.left + rect.right) / 2
    let y = (rect.top + rect.bottom) / 2

    // Jump just outside current element so we don't immediately hit itself.
    switch (direction) {
        case "up":
            y = rect.top - marginPx
            break
        case "down":
            y = rect.bottom + marginPx
            break
        case "left":
            x = rect.left - marginPx
            break
        case "right":
            x = rect.right + marginPx
            break
    }

    for (let i = 0; i < maxSteps; i++) {
        // Stop if we probe outside the viewport (elementsFromPoint uses viewport coords).
        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
            return null
        }

        const stack = doc.elementsFromPoint(x, y) // topmost -> bottommost [web:23]

        // Find the first matching element in the stack (or its closest matching ancestor).
        for (const el of stack) {
            if (el === currentEl) continue

            const match = (
                el.matches(selector) ? el : el.closest(selector)
            ) as Element | null

            if (match && match !== currentEl) return match
        }

        // Move probe further in the requested direction.
        switch (direction) {
            case "up":
                y -= stepPx
                break
            case "down":
                y += stepPx
                break
            case "left":
                x -= stepPx
                break
            case "right":
                x += stepPx
                break
        }
    }

    return null
}

export const navigateInDirection = (
    direction: "up" | "down" | "left" | "right"
) => {
    const currentlySelected = document.querySelector("[data-selected]")

    if (!currentlySelected) {
        const element = document.querySelector("#cluster-select") as Element
        element.setAttribute("data-selected", "true")
        return
    }

    const foundElement = neighborByElementsFromPoint(
        currentlySelected,
        direction
    )

    if (foundElement) {
        ensureElementVisibleWithMargin(foundElement, {
            marginPx: foundElement.getBoundingClientRect().height + 24,
            behavior: "smooth"
        })
        currentlySelected.removeAttribute("data-selected")
        foundElement.setAttribute("data-selected", "true")
    }
}

function getScrollParent(node: Element): Element | null {
    let el: Element | null = node.parentElement
    while (el) {
        const style = getComputedStyle(el)
        const overflowY = style.overflowY
        const overflowX = style.overflowX
        const canScrollY =
            (overflowY === "auto" || overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight
        const canScrollX =
            (overflowX === "auto" || overflowX === "scroll") &&
            el.scrollWidth > el.clientWidth
        if (canScrollY || canScrollX) return el
        el = el.parentElement
    }
    return null
}

export function ensureElementVisibleWithMargin(
    el: Element,
    opts: {
        marginPx?: number
        behavior?: ScrollBehavior
        onlyIfNeeded?: boolean
    } = {}
) {
    const marginPx = opts.marginPx ?? 12
    const behavior = opts.behavior ?? "smooth"
    const onlyIfNeeded = opts.onlyIfNeeded ?? true

    const scroller = getScrollParent(el)

    // If no scrollable ancestor, fall back to the window strategy you already have.
    if (!scroller) {
        el.scrollIntoView({ behavior, block: "nearest", inline: "nearest" })
        return
    }

    const r = el.getBoundingClientRect()
    const c = scroller.getBoundingClientRect()

    const minX = c.left + marginPx
    const maxX = c.right - marginPx
    const minY = c.top + marginPx
    const maxY = c.bottom - marginPx

    const fullyVisible =
        r.left >= minX && r.right <= maxX && r.top >= minY && r.bottom <= maxY

    if (onlyIfNeeded && fullyVisible) return

    let dx = 0,
        dy = 0

    if (r.left < minX) dx = r.left - minX
    else if (r.right > maxX) dx = r.right - maxX

    if (r.top < minY) dy = r.top - minY
    else if (r.bottom > maxY) dy = r.bottom - maxY

    if (dx || dy) {
        ;(scroller as HTMLElement).scrollTo({
            left: (scroller as HTMLElement).scrollLeft + dx,
            top: (scroller as HTMLElement).scrollTop + dy,
            behavior
        })
    }
}
