import dayjs from 'dayjs';
import { z } from 'zod';
import { UploadCategory } from './uploadMappings';

export const uploadDocumentSchema = z.object({
	category: z.nativeEnum(UploadCategory),
	date: z
		.string()
		.optional()
		.default(() => dayjs().format('YYYY-MM-DD')),
	file: z.custom<File>((f) => f instanceof File, 'Please upload a file.').optional()
});

export type UploadDocumentSchema = typeof uploadDocumentSchema;

export const deleteDocumentSchema = z
	.object({
		id: z.string()
	})
	.required();

export type DeleteDocumentSchema = typeof deleteDocumentSchema;
