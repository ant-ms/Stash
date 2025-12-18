import path from "path"

import { sveltekit } from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
const config = {
    resolve: {
        alias: {
            $lib: path.resolve("./src/lib"),
            $components: path.resolve("./src/components"),
            $reusables: path.resolve("./src/reusables")
        }
    },

    plugins: [sveltekit()],

    ssr: {
        noExternal: ["@egjs/*"]
    },

    server: {
        cors: false
    }
}

export default config
