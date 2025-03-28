import { test as base, type Page } from "@playwright/test";

// 1. Define a custom fixture that extends the base test with auth state
type AuthFixtures = {
	authenticatedPage: Page;
};

// 2. Create a test using this fixture for authenticated scenarios
const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ browser }, use) => {
		// Create a new context
		const context = await browser.newContext();
		const page = await context.newPage();

		// Navigate to login page and authenticate
		await page.goto("/login");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button").click();

		// Wait for login to complete
		await page.waitForTimeout(2000);

		// Store the authentication state
		await context.storageState({ path: "./.auth-state.json" });

		// Use the authenticated page in the test
		await use(page);

		// Clean up
		await context.close();
	},
});

// 3. Define a test for the login page (unauthenticated)
test("Capture 01 login page", async ({ page }, testInfo) => {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");

	// Take screenshot
	await page.screenshot({
		path: `./screenshots/${testInfo.project.name}/01_login.png`,
	});
});

// 4. Define a test for the dashboard (authenticated)
test("Capture 02 dashboard", async ({ authenticatedPage }, testInfo) => {
	// We're already logged in thanks to our custom fixture
	await authenticatedPage.goto("/dashboard"); // Adjust path as needed
	await authenticatedPage.waitForLoadState("networkidle");

	// Take screenshot
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/02_dashboard.png`,
	});
});

// 5. If you have more authenticated pages to capture
test("Capture 03 documents page", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/documents"); // Adjust path as needed
	await authenticatedPage.waitForLoadState("networkidle");

	// Take screenshot
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/03.1_documents.png`,
		fullPage: false,
	});
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/03.2_documents_full.png`,
		fullPage: true,
	});
});
