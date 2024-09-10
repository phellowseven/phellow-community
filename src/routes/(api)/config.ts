import { env } from '$env/dynamic/private';

export const phellow_cloud_base_uri = new URL(
	env.PHELLOW_CLOUD_BASE_URI ?? 'http://phellow.cloud.local:5173'
);
