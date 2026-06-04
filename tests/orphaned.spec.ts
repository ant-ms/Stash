import { test, expect } from "@playwright/test"
import { login } from "./helpers/login"
import { writeFile, rm, mkdir } from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"
import fs from "fs"

const MEDIA_ROOT = process.env.MEDIA_ROOT ?? "../_frontend/media";

test.describe("Orphaned files", () => {
    let testFilename: string;

    test.beforeAll(async () => {
        testFilename = `orphaned-test-${randomUUID()}.txt`;
        const filePath = path.join(MEDIA_ROOT, testFilename);
        if (!fs.existsSync(MEDIA_ROOT)) {
            await mkdir(MEDIA_ROOT, { recursive: true });
        }
        await writeFile(filePath, "test content");
    })

    test.afterAll(async () => {
        try {
            await rm(path.join(MEDIA_ROOT, testFilename))
        } catch(e) {}
    })

    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("can view and import an orphaned file", async ({ page }) => {
        await page.goto("/settings/orphaned")
        
        const tableRow = page.locator('tr').filter({ hasText: testFilename })
        await expect(tableRow).toBeVisible()

        const catsButton = tableRow.getByRole('button', { name: 'cats', exact: true })
        await catsButton.click()

        await expect(tableRow).not.toBeVisible()
    })
})
