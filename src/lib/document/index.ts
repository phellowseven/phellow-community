import { designationForCoding, UsageContext } from '$lib/codings';
import dayjs from 'dayjs';
import type { DocumentReference, HumanName, Practitioner, PractitionerRole } from 'fhir/r4';
import { groupBy, sortBy } from 'lodash-es';

/**
 * Returns the full name of a HumanName object.
 *
 * @param name - The HumanName object from which to extract the full name.
 * @returns The full name of the HumanName object.
 */
function getFullNameFromHumanName(name: HumanName): string {
	const givenNames = name.given ? name.given.join(' ') : '';
	const familyName = name.family ? name.family : '';
	const prefix = name.prefix ? name.prefix.join(' ') + ' ' : '';
	return `${prefix}${givenNames} ${familyName}`.trim();
}

/**
 * Extracts the full name of the author from a DocumentReference object.
 *
 * @param documentReference - The DocumentReference object from which to extract the author's full name.
 * @returns The full name of the author, or undefined if the author is not found or does not have a name.
 */
export function extractAuthorFullName(documentReference: DocumentReference): string | null {
	if (!documentReference.author || !documentReference.contained) {
		return null;
	}

	for (const authorRef of documentReference.author) {
		const authorId = authorRef?.reference?.replace('#', '');
		const practitionerRole = documentReference.contained.find(
			(resource) => resource.resourceType === 'PractitionerRole' && resource.id === authorId
		) as PractitionerRole | undefined;

		if (
			practitionerRole &&
			practitionerRole.practitioner &&
			practitionerRole.practitioner.reference
		) {
			const practitionerId = practitionerRole.practitioner.reference.replace('#', '');
			const practitioner = documentReference.contained.find(
				(resource) => resource.resourceType === 'Practitioner' && resource.id === practitionerId
			) as Practitioner | undefined;

			if (practitioner && practitioner.name && practitioner.name.length > 0) {
				// Assuming we take the first name if multiple names are present
				return getFullNameFromHumanName(practitioner.name[0]);
			}
		}
	}

	return null;
}

export function groupByMonth(
	documentReferences: DocumentReference[]
): _.Dictionary<DocumentReference[]> {
	return groupBy(
		sortBy(documentReferences, (doc) => doc.date).reverse(),
		(doc: DocumentReference) => {
			const date = dayjs(doc.date);
			return date.format('YYYY-MM');
		}
	);
}

export function documentTypeStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = 'de-DE'
): string | undefined {
	const coding = documentReference.type?.coding?.[0];
	if (coding) {
		const designation = designationForCoding(
			coding,
			UsageContext.DocumentReference_TypeCode,
			language
		);
		return designation;
	}
	return undefined;
}
