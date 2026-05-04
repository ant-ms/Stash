import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"

test.describe("Clusters", () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("sidebar is visible with cluster selector", async ({ page }) => {
        // The Select component for clusters should be visible
        const clusterSelect = page.locator("[data-navigable]").first()
        await expect(clusterSelect).toBeVisible()

        await expect(page).toHaveScreenshot("clusters-sidebar.png")
    })

    test("cats cluster is active in sidebar", async ({ page }) => {
        // The sidebar should have the "cats" cluster name visible in the selector
        await expect(
            page.getByText("cats", { exact: true })
        ).toBeVisible()
    })
})
