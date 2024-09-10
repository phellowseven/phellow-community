import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, locals }) => {
	const accessToken = await locals.validAccessToken();
	const headers = {
		Authorization: 'Bearer ' + accessToken
	};
	const documentURL = Buffer.from(params.documentId, 'base64').toString('utf-8');
	const response = await fetch(documentURL, {
		method: 'GET',
		headers
	});

	const transformer = new TransformStream();
	response.body?.pipeTo(transformer.writable);

	return new Response(transformer.readable, {
		headers: {
			'content-type': response.headers.get('content-type') || 'application/octet-stream'
		}
	});
};
