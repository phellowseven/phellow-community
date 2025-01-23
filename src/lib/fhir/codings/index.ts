import type { Coding, ValueSet } from "fhir/r4";

export enum UsageContext {
	DocumentReference_TypeCode,
	DocumentReference_ClassCode,
	DocumentReference_SecurityLabel,
	DocumentReference_FacilityType,
	DocumentReference_PracticeSetting,
	DocumentReference_EventType,
	DocumentReference_Format,
}

let usageContexts: Record<UsageContext, string> = {
	[UsageContext.DocumentReference_TypeCode]: "http://ihe-d.de/ValueSets/IHEXDStypeCode",
	[UsageContext.DocumentReference_ClassCode]: "http://ihe-d.de/ValueSets/IHEXDSclassCode",
	[UsageContext.DocumentReference_SecurityLabel]:
		"http://ihe-d.de/ValueSets/IHEXDSconfidentialityCode",
	[UsageContext.DocumentReference_FacilityType]:
		"http://ihe-d.de/ValueSets/IHEXDShealthcareFacilityTypeCode",
	[UsageContext.DocumentReference_PracticeSetting]:
		"http://ihe-d.de/ValueSets/IHEXDSpracticeSettingCode",
	[UsageContext.DocumentReference_Format]: "http://ihe-d.de/ValueSets/IHEXDSformatCodeDE",
	[UsageContext.DocumentReference_EventType]: "http://ihe-d.de/ValueSets/IHEXDSeventCodeList",
};

// loads all codings from the /src/codings/*.json files
const files = import.meta.glob("/src/codings/*.json") as Record<
	string,
	() => Promise<{ default: ValueSet }>
>;

const valueSets: Record<string, ValueSet> = {};

// initialize the valueSets object with the ValueSet objects from the files based on their URL or ID
for (const path in files) {
	files[path]().then((file) => {
		valueSets[file.default.url || file.default.id!] = file.default;
	});
}

/**
 * Retrieves a ValueSet object based on the provided identifier.
 *
 * This function searches for a ValueSet by its ID or URL. If a ValueSet
 * with the given ID exists, it returns that ValueSet. If no ValueSet
 * with the given ID is found, it then searches for a ValueSet with a
 * matching URL.
 *
 * @param id - The identifier or URL of the ValueSet to retrieve.
 * @returns The ValueSet object if found, otherwise `undefined`.
 */
export function valueSetForId(id: string): ValueSet | undefined {
	// ID
	if (valueSets[id]) return valueSets[id];

	// URL
	for (const valueSet of Object.values(valueSets)) {
		if (valueSet.url === id) return valueSet;
	}

	return undefined;
}

/**
 * Retrieves the designation for a given coding within a specified usage context and language.
 *
 * @param coding - The coding for which the designation is to be retrieved.
 * @param context - The usage context in which the coding is being used.
 * @param language - The language in which the designation is desired.
 * @returns The designation string if found, otherwise the coding code or undefined.
 */
export function designationForCoding(
	coding: Coding,
	context: UsageContext,
	language: string
): string | undefined {
	const id = usageContexts[context];
	const valueSet = valueSetForId(id!);

	const [languageCode, _] = language.split("-");

	const designations =
		valueSet?.compose?.include
			?.filter((include) => {
				return (
					include.system === coding.system ||
					include.extension
						?.filter((extension) => {
							return (
								extension.url ===
								"http://api.phellowseven.com/fhir/StructureDefinition/ValueSet-AlternateName"
							);
						})
						.some((extension) => extension.valueString === coding.system)
				);
			})
			?.flatMap((conceptSet) => {
				return (conceptSet.concept ?? []).find((concept) => {
					return concept.code === coding.code;
				})?.designation;
			})
			?.filter((designation) => !!designation) ?? [];

	const designation = designations.find((designation) => {
		// Check for language match, either full or just the language code
		if (designation.language === language) return true;
		if (designation.language === languageCode) return true;
		if (designation.language?.startsWith(languageCode)) return true;
		return false;
	});

	return designation?.value ?? coding.code;
}

/**
 * Retrieves the codings for a given usage context.
 *
 * @param context - The usage context for which to retrieve the codings.
 * @returns An array of `Coding` objects associated with the specified usage context.
 */
export function codingsForUsageContext(context: UsageContext): Coding[] {
	const id = usageContexts[context];

	return codingsForValueSet(id);
}

/**
 * Retrieves an array of `Coding` objects for a given ValueSet ID.
 *
 * This function looks up a ValueSet by its ID and extracts the coding information
 * from the included concepts within the ValueSet's composition. Each concept is
 * mapped to a `Coding` object containing the code, display text, and system URL.
 *
 * @param id - The ID of the ValueSet to retrieve codings for.
 * @returns An array of `Coding` objects corresponding to the concepts in the ValueSet.
 */
export function codingsForValueSet(id: string): Coding[] {
	const valueSet = valueSetForId(id);

	return (
		valueSet?.compose?.include?.flatMap((conceptSet) => {
			return (conceptSet.concept ?? []).map((concept) => {
				return {
					code: concept.code!,
					display: concept.display,
					system: conceptSet.system!,
				};
			});
		}) ?? []
	);
}

export default valueSets;
