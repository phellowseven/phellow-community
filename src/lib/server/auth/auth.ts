// src/lib/server/auth.ts
import { dev } from "$app/environment";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { Cookies } from "@sveltejs/kit";
import dayjs from "dayjs";
import type { NewSession, NewUser, Session, User } from "../db/schema";
import { logger } from "../logger";
import { SessionService } from "../services/session_service";
import { UserService } from "../services/user_service";

const authLogger = logger.child({ module: "Auth" });

export const sessionCookieName = "session";
export const sessionEncryptionKeyName = "encryptionkey";

export function generateSessionToken() {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes);
	return token;
}

export async function createSession(
	token: string,
	userId: number,
	encryptedAccessToken: string,
	encryptedRefreshToken: string,
	encryptedIdToken: string
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	authLogger.trace({ sessionId, userId }, "Creating session");
	const newSession: NewSession = {
		id: sessionId,
		userId,
		expiresAt: dayjs().add(30, "days").toDate(),
		encryptedAccessToken,
		encryptedRefreshToken,
		encryptedIdToken,
	};
	return await SessionService.create(newSession);
}

export async function createUser(data: NewUser): Promise<User> {
	authLogger.trace({ data }, "Creating User");
	const user = await UserService.findBySubId(data.sub);

	if (user) {
		const existingUser = { ...user, id: user.id };
		const updatedUser = await UserService.updateUser(existingUser);
		return updatedUser;
	} else {
		const newUser = await UserService.create(data);
		return newUser;
	}
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	authLogger.trace({ sessionId }, "Validating session");
	const { user, session } = await SessionService.findBySessionId(sessionId);

	if (!session || !user) {
		authLogger.trace("Session/User not found");
		return { session: null, user: null };
	}

	const sessionInvalid = Date.now() >= session.expiresAt.getTime();
	if (sessionInvalid) {
		authLogger.trace("Session expired");
		await SessionService.deleteSession(sessionId);
		return { session: null, user: null };
	}

	const renewSession = dayjs().isAfter(dayjs(session.expiresAt).subtract(15, "days"));
	if (renewSession) {
		session.expiresAt = dayjs().add(30, "days").toDate();

		await SessionService.updateSession(session);
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	authLogger.trace({ sessionId }, "Invalidating session");
	await SessionService.deleteSession(sessionId);
}

export async function invalidateUserSession(userId: number) {
	authLogger.trace({ userId }, "Invalidating user sessions");
	await SessionService.deleteSessionsForUser(userId);
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date) {
	authLogger.trace({ token, expiresAt }, "Setting session token cookie");
	cookies.set(sessionCookieName, token, {
		httpOnly: true,
		path: "/",
		secure: !dev,
		sameSite: "lax",
		expires: expiresAt,
	});
}

export function deleteSessionTokenCookie(cookies: Cookies) {
	authLogger.trace("Deleting session token cookie");
	cookies.delete(sessionCookieName, {
		path: "/",
	});
}

export function deleteSessionEncryptionKeyCookie(cookies: Cookies) {
	authLogger.trace("Deleting session encryption key cookie");
	cookies.delete(sessionEncryptionKeyName, {
		path: "/",
	});
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
