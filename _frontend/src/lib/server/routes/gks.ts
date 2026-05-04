import { parse } from "node-html-parser"
import TurndownService from "turndown"

export type SeriesData = {
    title: string
    source: string
    chapters: URL[]
}

export type StoryData = {
    title: string
    source: string
    chapters: {
        title: string
        content: string
    }
}

const fetchPage = async (url: URL | string) => {
    const request = await fetch(url)
    if (!request.ok) {
        throw new Error(`Failed to fetch ${url}, got status ${request.status}`)
    }
    return await request.text()
}

const fetchPageAndParse = async (url: URL | string) => {
    return parse(await fetchPage(url))
}

const getSeriesData = async (url: URL): Promise<SeriesData> => {
    let pageHtml = await fetchPageAndParse(url)

    if (url.pathname.startsWith("/story")) {
        const seriesLink = pageHtml.querySelector(".storyData-seriesName")
        if (!seriesLink) {
            throw new Error("Failed to find series link to get to series page")
        }
        const seriesAnchorTag = seriesLink.closest("a")
        if (!seriesAnchorTag) {
            throw new Error("Failed to find anchor tag for series link")
        }
        url = new URL(seriesAnchorTag.getAttribute("href") || "", url.origin)
        pageHtml = await fetchPageAndParse(url)
    }

    const titleElement = pageHtml.querySelector("#title-span")
    if (!titleElement) {
        throw new Error("Failed to find series title")
    }
    const title = titleElement.text.trim()

    const listItems = pageHtml.querySelectorAll(
        ".list-group-item .storyTitle a.storyLink"
    )
    return {
        title,
        source: url.href,
        chapters: listItems
            .map(item => item.getAttribute("href") || "")
            .map(href => new URL(href, url.origin))
    }
}

const getStoryData = async (url: URL): Promise<StoryData["chapters"]> => {
    const pageSource = await fetchPage(url)

    const title = pageSource.match(/shareTitle: `([^`]+)`,/)
    const content = pageSource.match(/storyText: `([^`]+)`,/)

    return {
        title: title ? title[1] : "Unknown",
        content: content ? content[1] : "Unknown"
    }
}

const gks_fetch = async (parsedURL: URL) => {
    if (
        !parsedURL.pathname.startsWith("/story") &&
        !parsedURL.pathname.startsWith("/series")
    )
        return null

    const seriesData = await getSeriesData(parsedURL)

    return {
        title: seriesData.title,
        source: seriesData.source,
        chapters: await Promise.all(seriesData.chapters.map(getStoryData))
    }
}

const gd_fetch = async (parsedURL: URL) => {
    const html = await fetchPageAndParse(parsedURL)

    const title = html.querySelector("#story h1[itemprop=name]")
    if (!title) return

    let chapterLinks = html
        .querySelectorAll("nav#chapter-nav li a")
        .map(e => e.getAttribute("href"))
    if (!chapterLinks.length) chapterLinks = [parsedURL.toString()]

    const turndownService = new TurndownService()
    const chapterContents: string[] = []
    try {
        for (const chapterLink of chapterLinks) {
            const chapterURL = new URL(chapterLink || "", parsedURL.origin)
            const chapterHtml = await fetchPageAndParse(chapterURL)
            const chapterElement = chapterHtml.querySelector(
                "div[itemprop=articleBody]"
            )
            if (!chapterElement) continue
            chapterContents.push(
                turndownService.turndown(chapterElement.innerHTML)
            )
        }
    } catch (error) {
        console.error(error)
    }

    return {
        title: title.innerText,
        source: parsedURL.toString(),
        chapters: chapterContents.map((content, index) => ({
            title: `Chapter ${index + 1}`,
            content
        }))
    }
}

export const story_import = async (d: { url: string }) => {
    const parsedURL = new URL(d.url)

    const gks_content = await gks_fetch(parsedURL)
    if (gks_content) return gks_content

    const gd_content = await gd_fetch(parsedURL)
    if (gd_content) return gd_content

    throw "Unknown URL"
}
