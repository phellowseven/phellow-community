export function pageTitle(section: string): string {
	return `${section}\uFF5Cphellow•community`;
}

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

export function addPathToUrl(baseUrl: string, path: string): URL {
	const url = new URL(baseUrl);

	// Ensure the path is properly formatted
	if (!path.startsWith('/')) {
		path = `/${path}`;
	}

	// Add the path to the URL, ensuring no duplicate slashes
	url.pathname = url.pathname.replace(/\/+$/, '') + path;

	return url;
}
