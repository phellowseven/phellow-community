import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { Lucia, TimeSpan } from 'lucia';
import { adapter } from './surrealAdapter';

// expect error (see next section)
export const auth = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: !dev,
			sameSite: 'strict'
		}
	},
	sessionExpiresIn: new TimeSpan(+(env.SESSION_IDLE_TIMEOUT ?? 15), 'm'),
	getSessionAttributes(attributes) {
		return attributes;
	},
	getUserAttributes(attributes) {
		return attributes;
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseSessionAttributes {
	email: string | undefined;
	username: string | undefined;
	encryptedAccessToken: string | undefined;
	encryptedRefreshToken: string | undefined;
}

// export type Role = 'admin' | 'physician' | 'analyst';

interface DatabaseUserAttributes {
	email?: string;
	name?: string;
	username?: string;
	sub: string;
}

export type Auth = typeof auth;
