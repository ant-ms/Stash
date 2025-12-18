<!-- @migration-task Error while migrating Svelte code: 'onmousedown|preventDefault' is not a valid attribute name -->
<script>
    // @ts-nocheck

    let hideOnSlide = true,
        imgOffset = null,
        sliding = false,
        contain = false,
        offset = 0.5,
        before = "",
        after = "",
        img

    function resize(e) {
        imgOffset = (e.type === "load" ? e.target : img).getBoundingClientRect()
    }

    function move(e) {
        if (sliding && imgOffset) {
            let x = (e.touches ? e.touches[0].pageX : e.pageX) - imgOffset.left
            x = x < 0 ? 0 : x > w ? w : x
            offset = x / w
        }
    }

    function start(e) {
        e.preventDefault()
        sliding = true
        move(e)
    }

    function end() {
        sliding = false
    }

    $: w = imgOffset && imgOffset.width
    $: h = imgOffset && imgOffset.height
    $: x = w * offset
    $: opacity = hideOnSlide && sliding ? 0 : 1
    $: style = contain
        ? `width:100%;height:100%;`
        : `width:${w}px;height:${h}px;`

    export { before, after, offset, contain, hideOnSlide }
</script>

<svelte:window
    ontouchmove={move}
    ontouchend={end}
    onmousemove={move}
    onmouseup={end}
    on:resize={resize}
/>

<div class="container" {style} ontouchstart={start} onmousedown={start}>
    <img
        bind:this={img}
        src={after}
        alt="after"
        onmousedown={start}
        onload={resize}
        {style}
    />
    <img
        src={before}
        alt="before"
        onmousedown={start}
        style="{style}clip:rect(0, {x}px, {h}px, 0);"
    />
    <div class="handle" style="left: calc({offset * 100}% - 20px)">
        <div class="arrow-left"></div>
        <div class="arrow-right"></div>
    </div>
</div>

<style>
    .container {
        position: relative;
        overflow: hidden;
        box-sizing: content-box;
    }

    .container img {
        user-select: none;

        position: absolute;
        z-index: 20;
        top: 0;
        left: 0;

        display: block;

        width: 100%;
        max-width: 100%;
        /* object-fit: cover; */
        object-fit: contain;
    }

    .handle {
        cursor: move;
        user-select: none;

        position: absolute;
        z-index: 30;
        top: calc(50% - 20px);

        width: 40px;
        height: 40px;
        margin-top: -4px;
        margin-left: -4px;
        border: 4px solid white;
        border-radius: 50px;

        background: none;
    }

    .handle:before,
    .handle:after {
        content: "";

        position: absolute;
        left: calc(50% - 2px);

        height: 9999px;
        border: 2px solid white;
    }

    .handle:before {
        top: 40px;
    }

    .handle:after {
        bottom: 40px;
    }

    .arrow-right,
    .arrow-left {
        user-select: none;

        position: relative;

        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
    }

    .arrow-right {
        bottom: 10px;
        left: 23px;
        border-left: 10px solid white;
    }

    .arrow-left {
        top: 10px;
        left: 7px;
        border-right: 10px solid white;
    }
</style>
