import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"

test.describe("Media grid", () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("image grid shows seeded cat thumbnails", async ({ page }) => {
        // Wait for thumbnails to appear in the grid
        const gallery = page.locator("#imageGallerySection")
        await expect(gallery).toBeVisible()

        // We seeded 5 cat images — at least some should be visible
        const thumbnails = gallery.locator("img")
        await expect(thumbnails.first()).toBeVisible({ timeout: 10000 })

        const count = await thumbnails.count()
        expect(count).toBeGreaterThanOrEqual(1)

        await expect(page).toHaveScreenshot("media-grid.png")
    })

    test("clicking a thumbnail opens the media viewer", async ({ page }) => {
        const gallery = page.locator("#imageGallerySection")
        const firstThumb = gallery.locator("img").first()
        await expect(firstThumb).toBeVisible({ timeout: 10000 })

        await firstThumb.click()

        // The media viewer should open (contains #media element)
        const viewer = page.locator("#media")
        await expect(viewer).toBeVisible({ timeout: 5000 })

        await expect(page).toHaveScreenshot("media-viewer.png")
    })
})
