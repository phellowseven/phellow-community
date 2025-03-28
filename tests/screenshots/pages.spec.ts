import { test } from "@playwright/test";

test.describe("Capture screenshots of pages", () => {
	test(`Capture login page`, async ({ page: browserPage }, testInfo) => {
		await browserPage.goto("/login");

		// Wait for any critical elements or animations to complete
		await browserPage.waitForLoadState("networkidle");

		// Take screenshot
		await browserPage.screenshot({
			path: `./screenshots/${testInfo.project.name}/01_login.png`,
			fullPage: false,
		});

		await browserPage.getByRole("button").click();

		await browserPage.waitForTimeout(2000);

		await browserPage.screenshot({
			path: `./screenshots/${testInfo.project.name}/02_dashboard.png`,
			fullPage: false,
		});
	});
});
