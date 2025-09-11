import { test as base, type Page } from "@playwright/test";

// Defines a custom fixture that extends the base test with auth state
type AuthFixtures = {
	authenticatedPage: Page;
};

// Create a test using the auth fixture for authenticated scenarios
const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ browser }, use) => {
		// Create a new context
		const context = await browser.newContext();
		const page = await context.newPage();

		// Navigate to login page and authenticate
		await page.goto("/login");
		await page.waitForLoadState("networkidle");
		await page.getByTestId("login_button").click();

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

test("Capture 01 login page", async ({ page }, testInfo) => {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");

	await page.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/01_login.png`,
	});

	await page.emulateMedia({ colorScheme: "dark" });

	await page.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/01_login.png`,
	});
});

test("Capture 02 dashboard", async ({ authenticatedPage }, testInfo) => {
	// Using the authenticated page to navigate to the dashboard that is on a protected route
	await authenticatedPage.goto("/dashboard");
	await authenticatedPage.waitForLoadState("networkidle");

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/02_dashboard.png`,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/02_dashboard.png`,
	});
});

test("Capture 03 documents page", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/documents");
	await authenticatedPage.waitForLoadState("networkidle");

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/03.1_documents.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/03.2_documents_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/03.1_documents.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/03.2_documents_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "light" });

	await authenticatedPage.getByRole("link", { name: "Psychologischer Bericht" }).click();
	await authenticatedPage.locator("td", { hasText: "Erstellt am" }).waitFor();
	const pdfViewer = authenticatedPage.locator(".pdfSlickViewer");
	await pdfViewer.waitFor();
	await pdfViewer.locator('div[data-loaded="true"]').waitFor();

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/03.3_document.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/03.3_document.png`,
		fullPage: false,
	});
});

test("Capture 04 appointments page", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/appointments");
	await authenticatedPage.waitForLoadState("networkidle");

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/04.1_appointments.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/04.2_appointments_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/04.1_appointments.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/04.2_appointments_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "light" });

	await authenticatedPage.getByRole("link", { name: "Nachuntersuchung" }).click();
	await authenticatedPage.locator("td", { hasText: "Datum & Uhrzeit" }).waitFor();
	await authenticatedPage.waitForTimeout(1500); // Wait for fade-in and map to load

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/04.3_appointment.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/04.3_appointment.png`,
		fullPage: false,
	});
});

test("Capture 05 tasks page", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/tasks");
	await authenticatedPage.waitForLoadState("networkidle");

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/05.1_tasks.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/05.2_tasks_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/05.1_tasks.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/05.2_tasks_full.png`,
		fullPage: true,
	});
});

test("Capture 06 questionnaires", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/tasks");
	await authenticatedPage.waitForLoadState("networkidle");
	await authenticatedPage.waitForTimeout(500); // Wait for blur duration

	await authenticatedPage.locator("[data-testid='task_item']").first().click();
	await authenticatedPage.waitForLoadState("networkidle");
	await authenticatedPage.waitForTimeout(250); // Wait for fade-in

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/06.1_questionnaire_01.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/06.1_questionnaire_01.png`,
		fullPage: false,
	});

	// Select the first answer option

	await authenticatedPage.locator('[data-testid="questionnaire-component"] button').nth(2).click();

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/06.1_questionnaire_01.selected.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "light" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/06.1_questionnaire_01.selected.png`,
		fullPage: false,
	});
});

test("Capture 07 labs page", async ({ authenticatedPage }, testInfo) => {
	await authenticatedPage.goto("/labs");
	await authenticatedPage.waitForLoadState("networkidle");

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/07.1_labs.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/07.2_labs_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/07.1_labs.png`,
		fullPage: false,
	});

	// Takes a screenshot of the full page instead of just the viewport
	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/07.2_labs_full.png`,
		fullPage: true,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "light" });

	await authenticatedPage.getByRole("button", { name: "Körpertemperatur" }).first().click();
	await authenticatedPage.waitForTimeout(500); // Wait for fade-in

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/07.3_labs_temperatur.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/07.3_labs_temperatur.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "light" });

	await authenticatedPage.locator("tr", { hasText: "Körpertemperatur" }).first().click();
	await authenticatedPage.waitForTimeout(500); // Wait for fade-in

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/light/07.4_labs_temperatur_details.png`,
		fullPage: false,
	});

	await authenticatedPage.emulateMedia({ colorScheme: "dark" });

	await authenticatedPage.screenshot({
		path: `./screenshots/${testInfo.project.name}/dark/07.4_labs_temperatur_details.png`,
		fullPage: false,
	});
});
