import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"

test.describe("Media Sources", () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("can create a new media source", async ({ page }) => {
        // Navigate to Media Sources settings page
        await page.goto("/settings/media-sources")

        // Wait for the page to load
        await expect(page.getByText("Media Sources", { exact: true })).toBeVisible()

        // Click Add source
        await page.getByText("Add source").click()

        // Fill out the popup
        await page.getByPlaceholder("Name (e.g. e621)").fill("Test Booru")
        await page.getByPlaceholder("Base URL (e.g. https://e621.net)").fill("https://test.booru.org")
        await page.getByPlaceholder("Endpoint (e.g. /posts.json)").fill("/api/posts")
        await page.getByPlaceholder("JSON Mapping (e.g. {})").fill('{"idPath": "id", "urlPath": "fileUrl"}')

        // Submit the form
        await page.getByRole('button', { name: 'Create' }).click()

        // Verify the new source appears in the table
        await expect(page.getByText("Test Booru")).toBeVisible()
        await expect(page.getByText("https://test.booru.org")).toBeVisible()
        await expect(page.getByText("/api/posts")).toBeVisible()
    })
})
