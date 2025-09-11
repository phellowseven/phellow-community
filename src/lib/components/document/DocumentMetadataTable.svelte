<script lang="ts">
	import {
		documentClassStringForDocumentReference,
		documentConfidentialityStringForDocumentReference,
		documentEventStringForDocumentReference,
		documentFacilityStringForDocumentReference,
		documentFormatStringForDocumentReference,
		documentTypeStringForDocumentReference,
	} from "$lib/fhir/document";
	import { isResourceOfType, resolveContainedReference } from "$lib/fhir/resolveReferences";
	import { getFullNameFromHumanName } from "$lib/fhir/utility";
	import { cn } from "$lib/utils";
	import * as Table from "$ui/table";
	import dayjs from "dayjs";
	import type { DocumentReference, Organization, Practitioner, PractitionerRole } from "fhir/r4";
	import * as m from "$lib/paraglide/messages";
	import type { MetadataEntry } from "$components/MetadataTable.svelte";
	import MetadataTable from "$components/MetadataTable.svelte";
	import { getLocale } from "$lib/paraglide/runtime";

	interface Props {
		document: DocumentReference;
		class?: string;
	}

	let { document, class: classes }: Props = $props();

	let author = $derived.by(() => {
		if (!document.author || !document.author[0].reference) {
			return undefined;
		}
		try {
			const resolved = resolveContainedReference<Practitioner | PractitionerRole | Organization>(
				document.author[0],
				document,
				["PractitionerRole", "Practitioner", "Organization"]
			);

			if (isResourceOfType(resolved, "PractitionerRole")) {
				const practitionerRef = (resolved as PractitionerRole).practitioner;
				if (!practitionerRef) {
					return undefined;
				}
				const resolvedPractitioner = resolveContainedReference<Practitioner>(
					practitionerRef,
					document,
					["Practitioner"]
				);
				return resolvedPractitioner;
			} else if (isResourceOfType(resolved, "Practitioner")) {
				return resolved as Practitioner;
			} else if (isResourceOfType(resolved, "Organization")) {
				return resolved as Organization;
			}
		} catch (error) {
			return undefined;
		}
	});

	let authorName = $derived.by(() => {
		if (!author) {
			return undefined;
		}

		if (author.name instanceof Array) {
			return author.name.map(getFullNameFromHumanName).join(", ");
		} else if (typeof author.name === "string") {
			return author.name;
		}
		return undefined;
	});

	let currentLanguage = $state(getLocale());
	// Create a reactive formatted date that updates when language changes
	let formattedDate = $derived(dayjs(document.date).locale(currentLanguage).format("L"));
	let categoryString = $derived(documentClassStringForDocumentReference(document, currentLanguage));
	let typeString = $derived(documentTypeStringForDocumentReference(document, currentLanguage));
	let facilityString = $derived(
		documentFacilityStringForDocumentReference(document, currentLanguage)
	);
	let confidentialityString = $derived(
		documentConfidentialityStringForDocumentReference(document, currentLanguage)
	);
	let eventString = $derived(documentEventStringForDocumentReference(document, currentLanguage));
	let formatString = $derived(documentFormatStringForDocumentReference(document, currentLanguage));
	let contentType = document.content?.[0]?.attachment?.contentType;

	let metadata: MetadataEntry[] = $derived.by(
		() =>
			[
				{
					title: m.documents_document_details_date(),
					value: formattedDate,
				},
				{
					title: m.documents_document_details_author(),
					value: authorName,
				},
				{
					title: m.documents_document_details_category(),
					value: categoryString,
				},
				{
					title: m.documents_document_details_type(),
					value: typeString,
				},
				{
					title: m.documents_document_details_facility(),
					value: facilityString,
				},
				{
					title: m.documents_document_details_confidentiality(),
					value: confidentialityString,
				},
				{
					title: m.documents_document_details_event(),
					value: eventString,
				},
				{
					title: m.documents_document_details_content_format(),
					value: formatString,
				},
				{
					title: m.documents_document_details_content_type(),
					value: contentType,
				},
			].filter((entry) => entry.value !== undefined) as MetadataEntry[]
	);
</script>

<div class={cn("border-border bg-card rounded-lg border", classes)}>
	<MetadataTable {metadata} />
</div>
