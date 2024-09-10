import { parseJWT } from 'oslo/jwt';
import { decrypt } from './encryption';
import { oauth2Client } from './server/auth/auth';

export async function refreshAccessTokenIfNecessary(
	encryptionKey: CryptoKey,
	encryptedAccessToken: string,
	encryptedRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string; wasRefreshed: boolean }> {
	const decryptedAccessToken = await decrypt(
		encryptionKey,
		Buffer.from(encryptedAccessToken, 'base64')
	);
	const accessToken = new TextDecoder().decode(decryptedAccessToken);

	const decryptedRefreshToken = await decrypt(
		encryptionKey,
		Buffer.from(encryptedRefreshToken, 'base64')
	);
	const refreshToken = new TextDecoder().decode(decryptedRefreshToken);

	const parsedAccessToken = parseJWT(accessToken);
	if (parsedAccessToken!.expiresAt!.getTime() > Date.now()) {
		return { accessToken, refreshToken, wasRefreshed: false };
	}

	// access token is expired, refresh it
	const tokenSet = await oauth2Client.refresh(refreshToken);
	const newAccessToken = tokenSet.access_token;
	const newRefreshToken = tokenSet.refresh_token || refreshToken;

	return {
		accessToken: newAccessToken!,
		refreshToken: newRefreshToken,
		wasRefreshed: true
	};
}
