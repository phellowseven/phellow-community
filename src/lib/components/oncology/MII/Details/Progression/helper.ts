// Helper function to determine status color
function getStatusColor(code: string) {
	const responseMap: Record<string, string> = {
		// Overall assessment codes
		K: "bg-gray-500", // Complete response
		P: "bg-gray-500", // Progression
		R: "bg-gray-500", // Partial remission
		S: "bg-gray-500", // Stable disease
		B: "bg-gray-500", // Clinical improvement
		V: "bg-gray-500", // Deterioration
		U: "bg-gray-500", // Unknown

		// Primary tumor codes
		N: "bg-gray-500", // No evidence of primary tumor
		T: "bg-gray-500", // Residual tumor
		Y: "bg-gray-500", // Primary tumor disappeared
		X: "bg-gray-500", // Primary tumor cannot be assessed

		// Lymph node codes
		L: "bg-gray-500", // No evidence of regional lymph node involvement
		F: "bg-gray-500", // First manifestation of lymph node involvement
		Z: "bg-gray-500", // Regression of known lymph node involvement

		// Distant metastasis codes
		M: "bg-gray-500", // First manifestation of distant metastasis
		A: "bg-gray-500", // Progression of known distant metastasis
		D: "bg-gray-500", // Regression of known distant metastasis
	};

	return responseMap[code] || "bg-gray-500";
}

export { getStatusColor };
