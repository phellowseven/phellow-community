import crypto from "crypto";

export function generateKey(): Promise<CryptoKey> {
	// Create symmetric encryption key
	return crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 256,
		},
		true,
		["encrypt", "decrypt"]
	);
}

export async function encrypt(key: CryptoKey, value: BufferSource): Promise<Uint8Array> {
	// encrypt access token using symmetric key
	const iv = crypto.randomBytes(12);
	const encrypted = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		value
	);

	// concatenate iv and encrypted data
	const encryptedData = new Uint8Array(iv.byteLength + encrypted.byteLength);
	encryptedData.set(new Uint8Array(iv), 0);
	encryptedData.set(new Uint8Array(encrypted), iv.byteLength);

	return encryptedData;
}

export async function decrypt(key: CryptoKey, value: Uint8Array): Promise<Uint8Array> {
	// extract iv and encrypted data
	const iv = value.slice(0, 12);
	const encrypted = value.slice(12);

	const decrypted = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		encrypted
	);

	const decryptedData = new Uint8Array(decrypted);

	return decryptedData;
}

export async function parseCryptoKeyFromJsonWebKeyString(string: string): Promise<CryptoKey> {
	const jwk = JSON.parse(string) as JsonWebKey;
	return await crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, true, [
		"encrypt",
		"decrypt",
	]);
}
