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
	import { languageTag } from "$lib/paraglide/runtime";
	import { cn } from "$lib/utils";
	import * as Table from "$ui/table";
	import dayjs from "dayjs";
	import type { DocumentReference, Organization, Practitioner, PractitionerRole } from "fhir/r4";
	import * as m from "$lib/paraglide/messages";

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

	let currentLanguage = $state(languageTag());
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
</script>

<div class={cn("rounded-lg border border-sidebar-border bg-sidebar", classes)}>
	<Table.Root>
		<Table.Body>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_date()}</Table.Cell>
				<Table.Cell>{formattedDate}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_author()}</Table.Cell>
				<Table.Cell>{authorName}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_category()}</Table.Cell>
				<Table.Cell>{categoryString}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_type()}</Table.Cell>
				<Table.Cell>{typeString}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_facility()}</Table.Cell>
				<Table.Cell>{facilityString}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_confidentiality()}</Table.Cell>
				<Table.Cell>{confidentialityString}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_event()}</Table.Cell>
				<Table.Cell>{eventString}</Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell class="font-bold">{m.documents_document_details_content_format()}</Table.Cell>
				<Table.Cell>{formatString}</Table.Cell>
			</Table.Row>
			{#if contentType}
				<Table.Row>
					<Table.Cell class="font-bold">{m.documents_document_details_content_type()}</Table.Cell>
					<Table.Cell>{contentType}</Table.Cell>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
</div>
