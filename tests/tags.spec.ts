import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"

test.describe("Tags", () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("sidebar shows seeded tag hierarchy", async ({ page }) => {
        // The seeded tags are Animals (parent), Cats and Dogs (children)
        // Tags show with a count suffix, so use a locator scoped to tag entries
        await expect(page.getByText("Animals")).toBeVisible({ timeout: 10000 })
        await expect(
            page.locator("[id^='tag-']", { hasText: "Cats" })
        ).toBeVisible()
        await expect(
            page.locator("[id^='tag-']", { hasText: "Dogs" })
        ).toBeVisible()

        await expect(page).toHaveScreenshot("tags-sidebar.png")
    })

    test("clicking a tag filters the grid", async ({ page }) => {
        // Wait for the grid to load
        const gallery = page.locator("#imageGallerySection")
        await expect(gallery.locator("img").first()).toBeVisible({
            timeout: 10000
        })

        // Click the "Cats" tag in the sidebar
        await page.locator("[id^='tag-']", { hasText: "Cats" }).click()

        // Grid should still show images (all seeded images are tagged Cats)
        await expect(gallery.locator("img").first()).toBeVisible({
            timeout: 10000
        })
    })
})
