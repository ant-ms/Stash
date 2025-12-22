import * as mdiIcons from "@mdi/js"

const possibleMdiIcons: { [key in keyof typeof mdiIcons]: string } =
    Object.fromEntries(
        Object.entries(mdiIcons).filter(([key]) => key.startsWith("mdi"))
    ) as any

const extraIconStrokeWidthMultiplier = 1.25
const extraIcons = {
    extraCag: `
        <path d="M124 122c4 0 6-11 6-19 0-7-2-18-6-18-5 0-5 8-5 8l2 10c0 6-2 8-2 11 0 0 0 8 5 8z" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M121 66c-12-20-22-20-31-19-29 3-34 40-22 61 5 8 26 21 40 21 36-1 25-43 13-63z" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M90 106c4-6 15 5 13 10-4 8-17-5-13-10zm0-59L74 37S73 6 62 6s-37 5-37 5c-6 7-9 14-13 17-11 9-9 13-9 28 0 17 16 46 16 46s15 25 33 25c15 0 16-3 25-11" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M66 104c-27-3-22-37-46-38" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M69 109c-6 5-21 12-35-8-13-20-34-69 6-53 8-13 20-15 34-11" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M41 9c6 4 9 10 9 21l-5 1 3 8m5-32c6 4 10 10 10 21l5-1v8M38 22h-6c-1-4-6-4-7 1 0 8 6 5 7 4l5 1z" display="inline" fill="none" stroke-width="${
            5.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path>
    `,
    extraCuf: `
  <path d="M56 64a24 11 0 0 1-24 10A24 11 0 0 1 8 64a24 11 0 0 1 24-11 24 11 0 0 1 24 11Z" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" paint-order="markers fill stroke"></path><path d="M8 65v28c0 5 11 10 24 10s24-5 24-10V65" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" paint-order="markers fill stroke" stroke-miterlimit="4" stroke-dasharray="none"></path><rect width="17.2" height="15.9" x="26.4" y="80.7" rx="5.3" ry="5.3" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></rect><path d="M36 89H20" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><circle cx="49.7" cy="86.4" r="2.6" fill="#000" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></circle><circle cx="13.6" cy="87.2" r="2.6" fill="#000" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></circle><path d="M91 38a11 24 0 0 1 11 24 11 24 0 0 1-11 24 11 24 0 0 1-10-24 11 24 0 0 1 10-24z" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" paint-order="markers fill stroke"></path><path d="M93 86h27c6 0 11-11 11-24s-5-24-11-24H93" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></path><rect width="17.2" height="15.9" x="-67.5" y="108.5" rx="5.3" ry="5.3" transform="rotate(-90)" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></rect><path d="M116 58v16" fill="none" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><circle cx="-44.2" cy="114.1" r="2.6" transform="rotate(-90)" fill="#000" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></circle><circle cx="-80.3" cy="115" r="2.6" transform="rotate(-90)" fill="#000" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" paint-order="markers fill stroke"></circle><rect width="15.9" height="9.5" x="-100.5" y="61.9" rx="3.2" ry="3.2" transform="rotate(-90)" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="15.9" height="9.5" x="-139.8" y="1.4" rx="3.2" ry="3.2" transform="rotate(-120)" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="15.9" height="9.5" x="-92.6" y="-125.9" rx="3.2" ry="3.2" transform="scale(-1)" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="15.9" height="9.5" x="-36.8" y="-157.5" rx="3.2" ry="3.2" transform="rotate(150)" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="15.9" height="9.5" x="-111.1" y="105.6" rx="3.2" ry="3.2" transform="rotate(-90)" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><path d="M119 89c0 2-2 4-5 4h-8c-3 0-5-2-5-4M58 71c3 0 5 3 5 6v8c0 3-2 5-5 5" fill="none" fill-opacity="1" stroke-width="${
      4.3 * extraIconStrokeWidthMultiplier
  }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></path>
    `,
    extraGag: `
        <circle cx="67.2" cy="88.4" r="17.6" opacity="1" fill="none" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><path d="M57 89s0-11 10-11m0-54h16" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M58 16v16m21-17v15m41 27c0 20-22 20-22 20v5h-5v11h5v5c20 0 28-17 28-41 0-35-25-43-59-43-33 0-58 8-58 43 0 24 8 41 28 41v-5h5V82h-5v-5s-22 0-22-20c0-10 11-25 52-25s53 15 53 25z" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><circle cx="49.3" cy="24.2" r="2.7" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><circle cx="39.1" cy="26.8" r="2.7" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><circle cx="28.7" cy="30.5" r="2.7" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><circle cx="112.4" cy="-34.4" r="2.7" transform="scale(1 -1)" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><circle cx="102.6" cy="-30" r="2.7" transform="scale(1 -1)" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle><circle cx="92.2" cy="-26.3" r="2.7" transform="scale(1 -1)" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></circle>
    `,
    extraPlg: `
        <g display="inline"><path d="M68 109c-11 0-35 8-35 16 0 7 6 8 7 8h56c1 0 8-1 8-8s-24-16-36-16z" display="inline" opacity="1" fill="none" fill-opacity="1" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M57 13c-5 12-10 24-13 36-3 10-7 20-8 29 0 8 5 15 14 18 10 4 23 4 33 2 9-3 16-9 17-17 1-5-4-19-8-30L80 13C78 9 75 3 68 3c-6 0-10 6-11 10z" display="inline" opacity="1" fill="none" fill-opacity="1" stroke-width="${
            5.9 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M48 94v18" display="inline" fill="none" stroke-width="${
            6.6 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M89 95v18" display="inline" fill="none" stroke-width="${
            6.4 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path></g>
    `,
    extraMas: `
        <g display="inline"><path d="M105 5c24 10 5 46-13 36s-27 7-30 15 8 15 3 24c-6 10-17 3-20 9-4 7-4 12-2 14 18 5 41-18 53-6s20 2 19 15c-1 12-30 22-58 20-26-1-44-1-46-4-3-2-5-23 6-25 10-2 15-2 9-15-5-13 1-35 17-53C59 16 80-4 105 5Z" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M90 52c20 8 35-7 32-21M16 56c5-26 23-42 42-47" display="inline" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M98 63c20 9 35-7 32-21M5 49C10 24 27 8 47 3" display="inline" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path></g>`,
    extraRui: `
        <path d="M95 43s-7 20-9 37c-2 8 0 21 1 29l1 17-36 1c-10 0-12-1-20-5-9-4-10-10-7-20 3-15 19-15 26-13s14 14 22 22c7 7 14 5 14 5m-9-97s-3-4 2-8c2-1 11-4 19 2 7 7 2 23 3 25 1 6-4 7-7 5-10-8-10-13-11-16M55 91s-2-15 7-40c3-11 9-25 16-32" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M102 52s9 47 0 47 0-37 0-47z" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path>
    `,
    extraStr: `
        <path d="M70 116s8 2 15-5 13-18 20-21c7-2 22-2 25 12 2 10 1 16-7 20-8 3-9 4-19 4l-35-1m4-85c-3-10-6-16-11-22" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M62 18s2-4-2-7c-2-2-11-5-18 1-7 7-2 21-3 24-1 5 4 6 6 4 10-7 10-12 11-15" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="stroke markers fill"></path><path d="m45 40 4 8m17 56c2 6 4 17 4 24" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><rect width="36.5" height="13.8" x="31.4" y="58.2" rx="6.1" transform="rotate(-15)" opacity="1" fill="none" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><path d="M9 75s13-3 16-8c3-6-3-8 5-14 4-2 8-2 12 0 4 3 13 22 8 24-6 3-9 2-11-1l-3-8-6 11" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M64 102s-15-2-23 1l-24 8" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><rect width="36.5" height="13.8" x="31.9" y="73.6" rx="6.1" transform="rotate(-15)" opacity="1" fill="none" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="36.5" height="13.8" x="31.1" y="88.3" rx="6.1" transform="rotate(-15)" opacity="1" fill="none" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><rect width="31.7" height="15" x="34.1" y="102.9" rx="5.3" transform="rotate(-15)" opacity="1" fill="none" fill-opacity="1" fill-rule="nonzero" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="markers fill stroke"></rect><path d="M8 48c1-9 9-14 18-13m27 82c-4 9-13 12-21 8" fill="none" stroke-width="${
            5.3 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path>
    `,
    extraSkir: `
    <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.5 135.5" id="icon-skirt"><path d="M40 24h24v-3h10v3h23v8H74v2H64v-2H40Z" fill="none" stroke-width="${
        5.3 * extraIconStrokeWidthMultiplier
    }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="m97 32 22 74c-41 12-58 12-100 0l21-74" fill="none" stroke-width="${
        5.3 * extraIconStrokeWidthMultiplier
    }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="m53 32-11 79" fill="none" stroke-width="${
        5.3 * extraIconStrokeWidthMultiplier
    }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M69 37v79" fill="none" stroke-width="${
        5.3 * extraIconStrokeWidthMultiplier
    }" stroke-linecap="butt" stroke-linejoin="miter" stroke-opacity="1" stroke-miterlimit="4" stroke-dasharray="none"></path><path d="m85 32 10 79" fill="none" stroke-width="${
        5.3 * extraIconStrokeWidthMultiplier
    }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path></symbol>
    `,
    extraDil: `
        <path d="M90 105s-10 5-18 0c-9-5-18-14-25-15-7 0-22 4-21 18 0 10 3 15 12 17 8 2 10 2 19-1l33-9" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="m90 115 5 6s3-1 3 3c0 3 0 4-4 6s-17 4-21 3c-5 0-16 0-20-3l-3-3v-1m10-29s-2-31 6-54c4-11 9-24 15-30" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path><path d="M81 13s-2-4 2-8c2-1 11-4 18 2s2 21 3 24c1 5-4 6-6 4-10-7-10-12-11-15" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" paint-order="stroke markers fill"></path><path d="M98 35s-7 19-9 35c-1 7-2 20-1 28 1 3 3 5 3 8l-1 9" fill="none" stroke-width="${
            5.2 * extraIconStrokeWidthMultiplier
        }" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1"></path>
    `
}

export const possibleIcons = {
    ...possibleMdiIcons,
    ...extraIcons
}
