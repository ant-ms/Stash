import fs from "fs"
import path from "path"

import { sveltekit } from "@sveltejs/kit/vite"

/** Vite plugin that serves /thumb/ and /file/ from disk (replaces gatekeeper in dev/test). */
function serveMedia() {
    const mediaDir = path.resolve("media")
    const thumbDir = path.resolve("thumbnails")

    return {
        name: "serve-media",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (!req.url) return next()

                let filePath = null
                if (req.url.startsWith("/thumb/")) {
                    filePath = path.join(
                        thumbDir,
                        req.url.slice("/thumb/".length).split("?")[0]
                    )
                } else if (req.url.startsWith("/file/")) {
                    filePath = path.join(
                        mediaDir,
                        req.url.slice("/file/".length).split("?")[0]
                    )
                }

                if (!filePath) return next()

                fs.stat(filePath, (err, stats) => {
                    if (err || !stats.isFile()) {
                        res.statusCode = 404
                        res.end("Not found")
                        return
                    }
                    fs.createReadStream(filePath).pipe(res)
                })
            })
        }
    }
}

/** @type {import('vite').UserConfig} */
const config = {
    resolve: {
        alias: {
            $lib: path.resolve("./src/lib"),
            $components: path.resolve("./src/components"),
            $reusables: path.resolve("./src/reusables")
        }
    },

    plugins: [sveltekit(), serveMedia()],

    ssr: {
        noExternal: ["@egjs/*"]
    },

    server: {
        cors: false
    }
}

export default config
