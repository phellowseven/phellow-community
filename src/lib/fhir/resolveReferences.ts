import type { DomainResource, Reference, Resource } from "fhir/r4";

/**
 * Custom error class for FHIR reference resolution errors
 */
export class ReferenceResolutionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ReferenceResolutionError";
	}
}

/**
 * Type guard to check if a resource is of a specific type
 *
 * @param resource The resource to check
 * @param resourceType The expected resource type
 * @returns Type predicate for the resource
 */
export function isResourceOfType<T extends Resource>(
	resource: Resource,
	resourceType: T["resourceType"]
): resource is T {
	return resource.resourceType === resourceType;
}

/**
 * Resolves a FHIR reference from a contained array with support for multiple possible resource types
 *
 * @param reference The reference to resolve
 * @param container The resource containing the reference
 * @param expectedTypes Array of possible resource types
 * @returns The resolved resource with union type of all possible resources
 * @throws {ReferenceResolutionError} If the reference cannot be resolved or is of wrong type
 */
export function resolveContainedReference<T extends Resource>(
	reference: Reference,
	container: DomainResource,
	expectedTypes: Array<T["resourceType"]>
): T {
	// Check if we have a reference
	if (!reference.reference) {
		throw new ReferenceResolutionError("Empty reference");
	}

	// Handle contained references (starting with #)
	if (reference.reference.startsWith("#")) {
		const localId = reference.reference.substring(1);

		// Check if container has contained resources
		if (!container.contained || !Array.isArray(container.contained)) {
			throw new ReferenceResolutionError(
				`No contained resources found in ${container.resourceType}/${container.id}`
			);
		}

		// Find the referenced resource
		const resource = container.contained.find((r) => r.id === localId);

		if (!resource) {
			throw new ReferenceResolutionError(`Contained resource with id ${localId} not found`);
		}

		// Check if the resource type is one of the expected types
		if (!expectedTypes.includes(resource.resourceType)) {
			throw new ReferenceResolutionError(
				`Resource type ${resource.resourceType} not in expected types: ${expectedTypes.join(", ")}`
			);
		}

		return resource as T;
	}

	// Handle absolute references - this could be extended based on your needs
	throw new ReferenceResolutionError("Only contained references are supported at this time");
}
