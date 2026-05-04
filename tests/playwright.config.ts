import { defineConfig } from "@playwright/test"

export default defineConfig({
    testDir: ".",
    testMatch: "**/*.spec.ts",
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: "list",
    use: {
        baseURL: process.env.TEST_SERVER_URL ?? "http://localhost:5174",
        browserName: "chromium",
        screenshot: "on",
        trace: "retain-on-failure",
        viewport: { width: 1280, height: 720 }
    },
    outputDir: "./test-results",
    snapshotDir: "./snapshots",
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01
        }
    }
})
