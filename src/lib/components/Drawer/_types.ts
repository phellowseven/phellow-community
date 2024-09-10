import type { UploadDocumentSchema } from '$lib/document/form';
import type { Infer, SuperValidated } from 'sveltekit-superforms';
/**
 * Import Data Drawer
 */
interface UploadDocumentDrawer {
	type: 'upload-document';
	data: SuperValidated<Infer<UploadDocumentSchema>>;
}

export type DrawerType = UploadDocumentDrawer;
