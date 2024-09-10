import type { Coding, ValueSet } from 'fhir/r4';

export enum UsageContext {
	DocumentReference_TypeCode,
	DocumentReference_ClassCode,
	DocumentReference_SecurityLabel,
	DocumentReference_FacilityType,
	DocumentReference_PracticeSetting,
	DocumentReference_Format
}

let usageContexts: Record<UsageContext, string> = {
	[UsageContext.DocumentReference_TypeCode]: 'http://ihe-d.de/ValueSets/IHEXDStypeCode',
	[UsageContext.DocumentReference_ClassCode]: 'http://ihe-d.de/ValueSets/IHEXDSclassCode',
	[UsageContext.DocumentReference_SecurityLabel]:
		'http://ihe-d.de/ValueSets/IHEXDSconfidentialityCode',
	[UsageContext.DocumentReference_FacilityType]:
		'http://ihe-d.de/ValueSets/IHEXDShealthcareFacilityTypeCode',
	[UsageContext.DocumentReference_PracticeSetting]:
		'http://ihe-d.de/ValueSets/IHEXDSpracticeSettingCode',
	[UsageContext.DocumentReference_Format]: 'http://ihe-d.de/ValueSets/IHEXDSformatCodeDE'
};

const files = import.meta.glob('/src/codings/*.json') as Record<
	string,
	() => Promise<{ default: ValueSet }>
>;

const valueSets: Record<string, ValueSet> = {};

for (const path in files) {
	files[path]().then((file) => {
		valueSets[file.default.url || file.default.id!] = file.default;
	});
}

export function valueSetForId(id: string): ValueSet | undefined {
	// ID
	if (valueSets[id]) return valueSets[id];

	// URL
	for (const valueSet of Object.values(valueSets)) {
		if (valueSet.url === id) return valueSet;
	}

	return undefined;
}

export function designationForCoding(
	coding: Coding,
	context: UsageContext,
	language: string
): string | undefined {
	const id = usageContexts[context];
	const valueSet = valueSetForId(id!);

	const [languageCode, _] = language.split('-');

	const designations =
		valueSet?.compose?.include
			?.filter((include) => {
				return (
					include.system === coding.system ||
					coding.system ===
						include.extension?.find((extension) => {
							return (
								extension.url ===
								'http://api.phellowseven.com/fhir/StructureDefinition/ValueSet-AlternateName'
							);
						})?.valueString
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
		return false;
	});

	return designation?.value ?? coding.code;
}

export function codingsForUsageContext(context: UsageContext): Coding[] {
	const id = usageContexts[context];

	return codingsForValueSet(id);
}

export function codingsForValueSet(id: string): Coding[] {
	const valueSet = valueSetForId(id);

	return (
		valueSet?.compose?.include?.flatMap((conceptSet) => {
			return (conceptSet.concept ?? []).map((concept) => {
				return {
					code: concept.code!,
					display: concept.display,
					system: conceptSet.system!
				};
			});
		}) ?? []
	);
}

export default valueSets;
