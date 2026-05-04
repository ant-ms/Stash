import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"

test.describe("Authentication", () => {
    test("sign-in page renders with username and password fields", async ({
        page
    }) => {
        await page.goto("/signin")

        await expect(page.getByLabel("Username")).toBeVisible()
        await expect(page.getByLabel("Password")).toBeVisible()
        await expect(page.getByText("Login")).toBeVisible()

        await expect(page).toHaveScreenshot("signin-page.png")
    })

    test("successful login redirects to cluster page", async ({ page }) => {
        await login(page)

        // Should be on a cluster page (URL has a cluster name segment)
        expect(page.url()).toMatch(/\/\w+/)
        // Should not be on /signin anymore
        expect(page.url()).not.toContain("/signin")
    })

    test("wrong password shows alert", async ({ page }) => {
        await page.goto("/signin")
        await page.getByLabel("Username").fill("testadmin")
        await page.getByLabel("Password").fill("wrongpassword")

        // The app calls window.alert() on failed login
        const dialogPromise = page.waitForEvent("dialog")
        await page.getByText("Login").click()
        const dialog = await dialogPromise
        expect(dialog.type()).toBe("alert")
        await dialog.accept()

        // Should remain on signin page
        expect(page.url()).toContain("/signin")
    })
})
