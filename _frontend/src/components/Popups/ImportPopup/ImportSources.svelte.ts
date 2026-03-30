import { page } from "$app/state"
import query from "$lib/client/call"
import { prompts } from "$lib/controllers/PromptController"
import type { TagExtended } from "$lib/controllers/TagsController.svelte"
import type { possibleIcons } from "$lib/possibleIcons"

interface importParams {
    cluster: string
    tags: TagExtended[]
}

export abstract class ImportSource {
    abstract icon: keyof typeof possibleIcons

    protected abstract import(p: importParams): Promise<void>
    protected cleanup?(): Promise<void>

    filename: string
    name?: string
    size: number
    progress = $state(0)
    error = $state("")
    selected = $state<string[]>([])

    constructor(
        public params: {
            filename: string
            size?: number
            name?: string
        }
    ) {
        this.filename = params.filename
        this.size = params.size || 0
        this.name = params.name
    }

    async select(): Promise<void> {
        this.selected = [this.filename]
    }

    async process(p: importParams): Promise<void> {
        try {
            this.progress = 1
            await this.import(p)
            this.progress = 100
        } catch (error: any) {
            console.error(error)
            this.error = error.message
        }
    }
}

export class UploadImportSource extends ImportSource {
    public icon = "mdiUpload" as const

    private file: File

    constructor(file: File) {
        if (!file) throw new Error("File is required")
        if (!file.name) throw new Error("File name is required")

        super({
            filename: file.name,
            size: file.size || 0
        })

        this.file = file
    }

    async import(p: importParams): Promise<void> {
        this.progress = 0

        const data = new FormData()
        data.append("file", this.file)
        data.append("selectedTags", JSON.stringify(p.tags.map(t => t.id)))

        await new Promise((resolve, reject) => {
            let ajax = new XMLHttpRequest()
            ajax.addEventListener(
                "progress",
                e => (this.progress = Math.round((e.loaded / e.total) * 100)),
                false
            )
            ajax.addEventListener("load", resolve, false)
            ajax.addEventListener("error", reject, false)
            ajax.addEventListener("abort", reject, false)
            ajax.open(
                "POST",
                `${page.data.serverURL}/api/cluster/${p.cluster}/media`
            )
            ajax.send(data)
        })
    }
}

export class ImportablesImportSource extends ImportSource {
    public icon = "mdiImport" as const

    constructor(filename: string) {
        super({ filename })
    }

    async import(p: importParams): Promise<void> {
        await fetch(
            `https://stash.hera.lan/api/cluster/${page.data.cluster.name}/import`,
            {
                method: "POST",
                body: JSON.stringify({
                    filename: this.filename,
                    selectedTags: p.tags.map(t => t.id)
                })
            }
        )
    }
}

export class TransmissionImportSource extends ImportSource {
    public icon = "mdiTransmissionTower" as const

    private torrentId: number
    private downloadDir: string
    private files: string[]

    constructor(
        torrentId: number,
        files: string[],
        downloadDir: string,
        name: string
    ) {
        if (files.length > 1) {
            super({ filename: files[0], name })
        } else {
            super({ filename: files[0] })
        }
        this.torrentId = torrentId
        this.downloadDir = downloadDir
        this.files = files
    }

    async select(): Promise<void> {
        if (this.files.length === 1) {
            this.selected = this.files
            return
        }
        const filesToImport = await prompts.selectMultiple(
            "Select files to import",
            this.files.map(f => ({ name: f, value: f }))
        )
        if (filesToImport) {
            this.selected = filesToImport
        }
    }

    async import(p: importParams): Promise<void> {
        if (this.files.length === 1) {
            return await this._import_single(p)
        }

        if (this.selected) {
            return await this._import_multiple(p, this.selected)
        }
    }

    async _import_single(p: importParams): Promise<void> {
        // Step 1: Generate file entry
        const mediaId = await query("transmissionCreatePreUploadMediaEntry", {
            name: this.filename,
            clusterName: p.cluster,
            tagIds: p.tags.map(t => t.id),
            downloadDir: this.downloadDir
        })

        // Step 2: Rename the torrent file
        await query("renameTorrentPath", {
            id: this.torrentId,
            oldFileName: this.filename,
            newFileName: mediaId
        })

        // Step 3: Move the torrent file to the media
        await query("moveTorrentPath", {
            id: this.torrentId
        })

        // Step 4: Create post upload jobs
        await query("createPostMoveJobs", {
            mediaId
        })
    }

    async _import_multiple(
        p: importParams,
        filesToImport: string[]
    ): Promise<void> {
        if (!this.name) {
            window.alert(
                "No name supplied to _import_multiple, this should never happen."
            )
            return
        }

        // Step 1: Move torrent to permanent seed location
        await query("moveTorrentPathToStashTorrentFolder", {
            id: this.torrentId
        })

        // Step 2: Disable all media files that were not selected
        await query("setFilesWantedForTorrent", {
            torrentId: this.torrentId,
            fileIndicies: filesToImport.map(f => this.files.indexOf(f))
        })

        // Step 3: Delete all media files that were not selected
        // TODO

        for (const file of filesToImport) {
            console.log("Importing", file, "...")

            // Step 4: Create media database entry
            const mediaId = await query(
                "transmissionCreatePreUploadMediaEntry",
                {
                    name: file,
                    clusterName: p.cluster,
                    tagIds: p.tags.map(t => t.id),
                    downloadDir: this.name
                }
            )

            // Step 5: Create Symlinks for the selected files
            await query("createSymlinkFromTorrentsToMedia", {
                torrentPath: `${this.name}/${this.filename}`,
                mediaId
            })

            // Step 6: Create post upload jobs for the selected files
            await query("createPostMoveJobs", {
                mediaId
            })
        }
    }
}
