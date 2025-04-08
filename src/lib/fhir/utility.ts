import type { HumanName } from "fhir/r4";

/**
 * Constructs a full name string from a HumanName object.
 *
 * @param {HumanName} name - The HumanName object containing the name parts.
 * @returns {string} The full name constructed from the given, family, and prefix parts of the HumanName object.
 */
export function getFullNameFromHumanName(name: HumanName): string {
	const givenNames = name.given ? name.given.join(" ") : "";
	const familyName = name.family ? name.family : "";
	const prefix = name.prefix ? name.prefix.join(" ") + " " : "";
	return `${prefix}${givenNames} ${familyName}`.trim();
}
