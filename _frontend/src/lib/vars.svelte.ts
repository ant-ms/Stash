import type { MediaType } from "./controllers/MediaController.svelte"

class Layout {
    isElectron = $state(false) as false | true | "fullscreen"
    hideSidebar = $state(false)
    castVisible = $state(false)
    windowControlsSpacerVisible = $state(false)
    isFullscreen = $state(false)
}

class Vars {
    public clusterName: string | undefined = $state()
    public thumbnailSuffixParameter: {
        mediaId: string
        suffix: string
    } | null = $state(null)

    // ========== Page Data ==========

    public collapsedTags: string[] = $state([])

    // ========== State for reader ==========

    public chaptersOfStory: string[] = $state([])
    public selectedChapterIndex: number = $state(0)

    // ========== Global states =========

    public selectedMedias: MediaType[] = $state([])
    public imageSuffixParameter = $state("")
    public mediaTypeFilter: "video" | "image" | "" = $state("")
    public videoElement: HTMLVideoElement | null = $state(null)

    // ========== Global modes ==========

    // When on, will overlay the current subject (count of people) onto the thumbnails
    // and will allow setting the subject count by pressing 1, 2, 3, or 4 on the keyboard
    public isInSubjectEditingMode: boolean = $state(false)

    layout = new Layout()
}

export default new Vars()
