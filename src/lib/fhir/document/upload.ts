import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import dayjs from "dayjs";
import type {
	Binary,
	Bundle,
	Coding,
	DocumentReference,
	DocumentReferenceContent,
	List,
	Patient,
} from "fhir/r4";

import { v4 as uuidv4 } from "uuid";

/**
 * Creates an upload bundle containing a Binary resource, DocumentReference resource,
 * SubmissionSet resource, and a Bundle resource for uploading a document.
 *
 * @param contentType - The MIME type of the document.
 * @param dataBase64 - The base64 encoded content of the document.
 * @param documentTitle - The title of the document.
 * @param creationDate - The creation date of the document.
 * @param contentFormat - The format coding of the document content. Defaults to IHE format code.
 * @param documentTypeCodings - The codings for the type of the document.
 * @param documentCategoryCodings - The codings for the category of the document.
 * @param subject - The patient subject of the document.
 * @param securityLabelCodings - The codings for the security labels of the document.
 * @param facilityTypeCodings - The codings for the facility type.
 * @param practiceSettingCodings - The codings for the practice setting.
 * @param designationType - The designation type coding.
 * @param sourceId - The source identifier for the document.
 * @returns The created Bundle resource containing the submission set, document reference, and binary.
 */
export function createUploadBundle(
	contentType: string,
	dataBase64: string,
	documentTitle: string,
	creationDate: string,
	contentFormat: Coding = {
		system: "http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem",
		code: "urn:ihe:iti:xds:2017:mimeTypeSufficient",
	},
	documentTypeCodings: Coding[],
	documentCategoryCodings: Coding[],
	subject: Patient,
	securityLabelCodings: Coding[],
	facilityTypeCodings: Coding[],
	practiceSettingCodings: Coding[],
	designationType: Coding,
	sourceId: string
) {
	// Create a Binary resource
	const binary: Binary = createBinary(contentType, dataBase64);

	// Create a DocumentReferenceContent resource based on binary
	const content: DocumentReferenceContent = createContent(
		documentTitle,
		creationDate,
		contentFormat,
		binary
	);

	// Create the document reference resource referenceing the content/binary
	const documentReference: DocumentReference = createDocumentReference(
		documentTypeCodings,
		documentCategoryCodings,
		subject,
		creationDate,
		securityLabelCodings,
		content,
		facilityTypeCodings,
		practiceSettingCodings
	);

	// Create the submission set resource referenceing the document reference
	const submissionSet: List = createSubmissionSet(
		subject,
		documentReference,
		designationType,
		sourceId
	);

	// finally create the bundle resource containing the submission set, document reference, and binary that will be uploaded
	const bundle: Bundle = createBundle(submissionSet, documentReference, binary);
	return bundle;
}

// Create a method that returns a rfc:3986 compliant string
function createMasterIdentifier(): string {
	// save the uuid to a buffer
	const buffer = Buffer.alloc(36);
	const _ = uuidv4(undefined, buffer, 0);
	const joined = buffer.join("");
	return "urn:oid:2.25." + joined;
}

/**
 * This function is used to create a Binary resource.
 *
 * @param contentType The MIME type of the binary data
 * @param dataBase64 The binary data encoded in base64
 * @returns A Binary resource.
 */
function createBinary(contentType: string, dataBase64: string): Binary {
	const binary: Binary = {
		resourceType: "Binary",
		id: uuidv4(),
		contentType: contentType,
		data: dataBase64,
	};

	return binary;
}

/**
 * This function is used to create a DocumentReferenceContent resource.
 *
 * @param title The title of the document
 * @param creationDate The date the document was created
 * @param format The format of the document
 * @param binary The binary resource containing the document data
 * @returns A DocumentReferenceContent resource.
 */
function createContent(
	title: string,
	creationDate: string,
	format: Coding,
	binary: Binary
): DocumentReferenceContent {
	const data = Buffer.from(binary.data!, "base64");
	const hash = sha256(data);
	const hexEncodedHash = encodeHexLowerCase(hash);
	const size = data.byteLength;
	const content: DocumentReferenceContent = {
		attachment: {
			contentType: binary.contentType,
			title,
			url: "urn:uuid" + binary.id,
			size,
			hash: hexEncodedHash,
			creation: creationDate,
		},
		format,
	};

	return content;
}

/**
 * This function is used to create a DocumentReference resource.
 *
 * @param documentTypeCodings The type of document being submitted
 * @param documentCategoryCodings The category of the document being submitted
 * @param subject The patient this document is about
 * @param creationDate The date the document was created
 * @param securityLabelCodings The security labels of the document
 * @param content The content of the document
 * @param facilityTypeCodings The facility type of the document
 * @param practiceSettingCodings The practice setting of the document
 * @returns A DocumentReference resource conforming to the IHE MHD Comprehensive DocumentReference profile
 */
function createDocumentReference(
	documentTypeCodings: Coding[],
	documentCategoryCodings: Coding[],
	subject: Patient,
	creationDate: string,
	securityLabelCodings: Coding[],
	content: DocumentReferenceContent,
	facilityTypeCodings: Coding[],
	practiceSettingCodings: Coding[]
): DocumentReference {
	const documentReference: DocumentReference = {
		resourceType: "DocumentReference",
		id: uuidv4(),
		meta: {
			profile: [
				"https://profiles.ihe.net/ITI/MHD/StructureDefinition/IHE.MHD.Comprehensive.DocumentReference",
			],
		},
		masterIdentifier: {
			system: "urn:ietf:rfc:3986",
			value: createMasterIdentifier(),
		},
		status: "current",
		type: {
			coding: documentTypeCodings,
		},
		category: [
			{
				coding: documentCategoryCodings,
			},
		],
		subject: {
			reference: "Patient/" + subject.id,
		},
		date: creationDate,
		securityLabel: [
			{
				coding: securityLabelCodings,
			},
		],
		content: [content],
		context: {
			facilityType: {
				coding: facilityTypeCodings,
			},
			practiceSetting: {
				coding: practiceSettingCodings,
			},
			sourcePatientInfo: {
				reference: "Patient/" + subject.id,
			},
		},
	};

	return documentReference;
}

/**
 * This function is used to create a DocumentReference resource.
 *
 * @param subject The patient this submission is about
 * @param documentReference The document being submitted
 * @param designationType The designation type of the submission
 * @param sourceId The source of the submission (using urn:oid prefix)
 * @returns A List resource conforming to the IHE MHD Comprehensive SubmissionSet profile
 */
function createSubmissionSet(
	subject: Patient,
	documentReference: DocumentReference,
	designationType: Coding,
	sourceId: string
): List {
	const submissionSet: List = {
		resourceType: "List",
		id: uuidv4(),
		extension: [
			{
				url: "https://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-designationType",
				valueCodeableConcept: {
					coding: [designationType],
				},
			},
			{
				url: "https://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-sourceId",
				valueIdentifier: {
					value: sourceId,
				},
			},
		],
		meta: {
			profile: [
				"https://profiles.ihe.net/ITI/MHD/StructureDefinition/IHE.MHD.Comprehensive.SubmissionSet",
			],
		},
		status: "current",
		mode: "working",
		code: {
			coding: [
				{
					system: "https://profiles.ihe.net/ITI/MHD/CodeSystem/MHDlistTypes",
					code: "submissionset",
				},
			],
		},
		date: dayjs().toISOString(),
		subject: { reference: "Patient/" + subject.id },

		entry: [
			{
				item: {
					reference: "urn:uuid:" + documentReference.id, // The DocumentReference.id
				},
			},
		],
	};

	return submissionSet;
}

/**
 * This function is used to create a Bundle resource.
 *
 * @param submissionSet The submission set to be included in the bundle
 * @param documentReference The document reference to be included in the bundle
 * @param binary The binary resource to be included in the bundle
 * @returns A Bundle resource containing the submission set, document reference, and binary
 */
function createBundle(
	submissionSet: List,
	documentReference: DocumentReference,
	binary: Binary
): Bundle {
	const bundle: Bundle = {
		resourceType: "Bundle",
		type: "transaction",
		meta: {
			profile: [
				"https://profiles.ihe.net/ITI/MHD/StructureDefinition/IHE.MHD.Comprehensive.ProvideBundle",
			],
		},
		timestamp: dayjs().toISOString(),
		entry: [
			{
				fullUrl: "urn:uuid:" + submissionSet.id,
				resource: submissionSet,
				request: {
					method: "POST",
					url: "List",
				},
			},
			{
				fullUrl: "urn:uuid:" + documentReference.id,
				resource: documentReference,
				request: {
					method: "POST",
					url: "DocumentReference",
				},
			},
			{
				fullUrl: "urn:uuid:" + binary.id,
				resource: binary,
				request: {
					method: "POST",
					url: "Binary",
				},
			},
		],
	};

	return bundle;
}
