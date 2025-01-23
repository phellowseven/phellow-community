import { z } from "zod";
import { UploadCategory } from "./uploadMappings";

export const uploadDocumentSchema = z.object({
	category: z.nativeEnum(UploadCategory),
	date: z.string().refine((v) => v, { message: "A creation date is required." }),
	file: z.instanceof(File).refine((v) => v.size > 0, { message: "A file is required." }),
});

export type UploadDocumentSchema = typeof uploadDocumentSchema;

export const deleteDocumentSchema = z
	.object({
		id: z.string(),
	})
	.required();

export type DeleteDocumentSchema = typeof deleteDocumentSchema;
