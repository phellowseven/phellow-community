import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: "./tests/screenshots",
	outputDir: "./screenshots",
	snapshotPathTemplate: "snapshots/{arg}{ext}",
	timeout: 30000,
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
		screenshot: "off",
		trace: "off",
	},
	projects: [
		{
			name: "smartphone",
			use: {
				browserName: "chromium",
				viewport: { width: 390, height: 844 }, // iPhone 12 Pro
			},
		},
		{
			name: "tablet-portrait",
			use: {
				browserName: "chromium",
				viewport: { width: 820, height: 1180 }, // iPad
			},
		},
		{
			name: "tablet-landscape",
			use: {
				browserName: "chromium",
				viewport: { width: 1180, height: 820 }, // iPad
			},
		},
		{
			name: "desktop",
			use: {
				browserName: "chromium",
				viewport: { width: 1546, height: 1024 }, // Standard desktop
			},
		},
	],
};

export default config;
