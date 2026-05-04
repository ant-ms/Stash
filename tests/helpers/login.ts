import { type Page } from "@playwright/test"

/**
 * Sign in through the UI form. Reusable across specs.
 */
export async function login(
    page: Page,
    username = "testadmin",
    password = "testpassword123"
) {
    await page.goto("/signin")
    await page.waitForLoadState("networkidle")
    await page.getByLabel("Username").fill(username)
    await page.getByLabel("Password").fill(password)

    // Click login and wait for the redirect away from /signin
    await Promise.all([
        page.waitForURL(url => !url.pathname.includes("/signin"), {
            timeout: 15000
        }),
        page.getByText("Login").click()
    ])
    // Navigate to the seeded "cats" cluster so media actually loads
    await page.goto("/cats")
    await page.waitForLoadState("networkidle")
}
