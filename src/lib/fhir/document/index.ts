import { designationForCoding, UsageContext } from "$lib/fhir/codings";
import { encodeBase64url } from "@oslojs/encoding";
import dayjs from "dayjs";
import type {
	Bundle,
	CodeableConcept,
	Coding,
	DocumentReference,
	DocumentReferenceContent,
	Practitioner,
	PractitionerRole,
} from "fhir/r4";
import { groupBy, sortBy } from "lodash-es";
import { getFullNameFromHumanName } from "../utility";

export function canShowPreviewForDocumentContent(content: DocumentReferenceContent): boolean {
	if (content.attachment.contentType === "application/pdf") {
		return true;
	}

	return false;
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
		const authorId = authorRef?.reference?.replace("#", "");
		const practitionerRole = documentReference.contained.find(
			(resource) => resource.resourceType === "PractitionerRole" && resource.id === authorId
		) as PractitionerRole | undefined;

		if (
			practitionerRole &&
			practitionerRole.practitioner &&
			practitionerRole.practitioner.reference
		) {
			const practitionerId = practitionerRole.practitioner.reference.replace("#", "");
			const practitioner = documentReference.contained.find(
				(resource) => resource.resourceType === "Practitioner" && resource.id === practitionerId
			) as Practitioner | undefined;

			if (practitioner && practitioner.name && practitioner.name.length > 0) {
				// Assuming we take the first name if multiple names are present
				return getFullNameFromHumanName(practitioner.name[0]);
			}
		}
	}

	return null;
}

/**
 * Groups an array of DocumentReference objects by month.
 *
 * @param documentReferences - An array of DocumentReference objects to be grouped.
 * @returns A dictionary where the keys are month strings in the format "YYYY-MM" and the values are arrays of DocumentReference objects.
 */
export function groupByMonth(
	documentReferences: DocumentReference[]
): _.Dictionary<DocumentReference[]> {
	return groupBy(
		sortBy(documentReferences, (doc) => doc.date).reverse(),
		(doc: DocumentReference) => {
			const date = dayjs(doc.date);
			return date.format("YYYY-MM");
		}
	);
}

/**
 * Returns a string representation of the document type for a given DocumentReference.
 *
 * @param documentReference - The FHIR DocumentReference resource to extract the document type from.
 * @param language - The language code to use for the designation. Defaults to "de-DE".
 * @returns A string representing the document type, or undefined if no type coding is available.
 */
export function documentTypeStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	const codings = codingsFromCodeableConcepts(
		documentReference.type ? [documentReference.type] : []
	);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_TypeCode,
		language
	);
	return designations?.join(", ");
}

/**
 * Returns a class string for a given DocumentReference based on its category coding.
 *
 * @param documentReference - The DocumentReference object to extract the class string from.
 * @param language - The language code to use for the designation. Defaults to "de-DE".
 * @returns The class string for the DocumentReference, or undefined if no coding is found.
 */
export function documentClassStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	const codings = codingsFromCodeableConcepts(documentReference.category);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_ClassCode,
		language
	);
	return designations?.join(", ");
}

export function documentFacilityStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	if (!documentReference.context?.facilityType) {
		return undefined;
	}
	const codings = codingsFromCodeableConcepts([documentReference.context.facilityType]);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_FacilityType,
		language
	);
	return designations?.join(", ");
}

export function documentEventStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	if (!documentReference.context?.event) {
		return undefined;
	}
	const codings = codingsFromCodeableConcepts(documentReference.context.event);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_EventType,
		language
	);
	return designations?.join(", ");
}

export function documentPracticeSettingStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	if (!documentReference.context?.practiceSetting) {
		return undefined;
	}
	const codings = codingsFromCodeableConcepts([documentReference.context.practiceSetting]);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_PracticeSetting,
		language
	);
	return designations?.join(", ");
}

export function documentConfidentialityStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	const codings = codingsFromCodeableConcepts(documentReference.securityLabel);
	const designations = designationsForCodings(
		codings,
		UsageContext.DocumentReference_SecurityLabel,
		language
	);
	return designations?.join(", ");
}

export function documentFormatStringForDocumentReference(
	documentReference: DocumentReference,
	language: string = "de-DE"
): string | undefined {
	const designations = designationsForCodings(
		documentReference.content.map((c) => c.format).filter((format) => format !== undefined),
		UsageContext.DocumentReference_Format,
		language
	);
	return designations?.join(", ");
}

function codingsFromCodeableConcepts(codeableConcepts: CodeableConcept[] | undefined): Coding[] {
	if (!codeableConcepts || codeableConcepts.length <= 0) {
		return [];
	}
	const codings = codeableConcepts
		.map((cc) => cc.coding) // Get all codings from all codeable concepts
		.filter((coding) => coding !== undefined) // Remove undefined values
		.flat(); // Flatten the array

	if (codings.length <= 0) {
		return [];
	}

	return codings;
}

function designationsForCodings(
	codings: Coding[],
	context: UsageContext,
	language: string
): string[] | undefined {
	const designations = codings
		.map((coding) => designationForCoding(coding, context, language))
		.filter((designation) => designation !== undefined);
	if (designations.length <= 0) {
		return undefined;
	}
	return designations;
}

/**
 * Extracts DocumentReference resources from a given FHIR Bundle and modifies their attachment URLs.
 *
 * This function filters the entries in the provided FHIR Bundle to find resources of type `DocumentReference`.
 * It then encodes the URL of the first attachment in each `DocumentReference` using base64url encoding and
 * updates the URL to a new path under `/documents/`.
 *
 * @param bundle - The FHIR Bundle containing the entries to be processed.
 * @returns A promise that resolves to an array of `DocumentReference` resources with modified attachment URLs.
 */
export async function extractDocumentReferences(bundle: Bundle): Promise<DocumentReference[]> {
	const entries =
		bundle.entry
			?.filter((entry) => entry.resource?.resourceType == "DocumentReference")
			.map((entry) => entry.resource as DocumentReference)
			.map((entry) => {
				if (entry.content[0].attachment.url) {
					const encoded = encodeBase64url(
						new TextEncoder().encode(entry.content[0].attachment.url)
					);
					entry.content[0].attachment.url = `/documents/${encoded}`;
				}
				return entry;
			}) ?? [];
	return entries;
}
