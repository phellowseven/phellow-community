import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Generates the title for the head section of a page.
 *
 * @param section - The specific section of the page. If provided, it will be included in the title.
 * @returns The formatted title string for the head section.
 */
export function headPageTitle(section: string | undefined = undefined): string {
	if (section) {
		return `${section}\uFF5Cphellow•community`;
	} else {
		return `phellow•community`;
	}
}

/**
 * Adds query parameters to a given base URL.
 *
 * @param baseUrl - The base URL to which the query parameters will be added.
 * @param queryParams - A string representing the query parameters to be added.
 * @returns The updated URL object with the appended query parameters.
 */
export function addQueryParamsToUrl(baseUrl: string, queryParams: string): URL {
	// Initialize the URL object with the base URL
	const url = new URL(baseUrl);

	// Parse the query parameters string into URLSearchParams
	const params = new URLSearchParams(queryParams);

	// Append each parameter to the URL's search parameters
	params.forEach((value, key) => {
		url.searchParams.append(key, value);
	});

	// Return the updated URL as a string
	return url;
}

/**
 * Appends a given path to a base URL.
 *
 * @param baseUrl - The base URL to which the path will be appended.
 * @param path - The path to append to the base URL.
 * @returns A new URL object with the appended path.
 */
export function appendPathToUrl(baseUrl: URL, path: string): URL {
	let url = new URL(baseUrl);
	let newPath = `${url.pathname.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
	url.pathname = newPath;
	return url;
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
